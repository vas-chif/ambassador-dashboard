/**
 * @file articles.ts
 * @description Store Pinia specializzato per la gestione degli articoli, storie prima/dopo e testimonianze.
 * Implementa il pattern Stale-While-Revalidate con persistenza in localStorage e sincronizzazione Firestore in tempo reale.
 * @author Vasile Chifeac (AI Agent)
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from 'src/boot/firebase';
import { useSecureLogger } from 'src/shared/logger';
import type { Article } from 'stores/settings';

const CACHE_KEY_ARTICLES = 'elara_articles_cache';

const getCachedArticles = (): Article[] => {
  try {
    const raw = localStorage.getItem(CACHE_KEY_ARTICLES);
    return raw ? (JSON.parse(raw) as Article[]) : [];
  } catch {
    return [];
  }
};

const setCachedArticles = (arts: Article[]) => {
  try {
    localStorage.setItem(CACHE_KEY_ARTICLES, JSON.stringify(arts));
  } catch {
    // quota exceeded fallback
  }
};

export const useArticlesStore = defineStore('articles', () => {
  const logger = useSecureLogger();
  const articles = ref<Article[]>(getCachedArticles());
  const loading = ref(false);

  let unsubscribeArticles: Unsubscribe | null = null;

  // Real-time Firestore Subscription with Local Cache Sync
  const subscribeToArticles = () => {
    if (unsubscribeArticles) return;

    try {
      const q = query(collection(db, 'articles'), orderBy('order', 'asc'));
      unsubscribeArticles = onSnapshot(
        q,
        (snapshot) => {
          const list: Article[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Article, 'id'>) });
          });
          articles.value = list;
          setCachedArticles(list);
          logger.info(`Sincronizzati ${list.length} articoli con cache locale.`);
        },
        (error) => {
          logger.error('Errore listener articoli Firestore:', error);
        },
      );
    } catch (e: unknown) {
      logger.error('Errore inizializzazione sottoscrizione articoli:', e);
    }
  };

  const unsubscribeAll = () => {
    if (unsubscribeArticles) {
      unsubscribeArticles();
      unsubscribeArticles = null;
    }
  };

  // Image Processing & Compression (Max 1200px, 80% JPEG quality)
  const processBannerImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const MAX_WIDTH = 1200;
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  // CRUD Operations
  const addArticle = async (article: Omit<Article, 'id'>) => {
    loading.value = true;
    try {
      const articlesRef = collection(db, 'articles');
      await addDoc(articlesRef, article);
      logger.info('Articolo aggiunto con successo');
    } catch (e: unknown) {
      logger.error('Errore aggiunta articolo:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateArticle = async (id: string, updates: Partial<Article>) => {
    loading.value = true;
    try {
      const docRef = doc(db, 'articles', id);
      await updateDoc(docRef, updates);
      logger.info(`Articolo ${id} aggiornato.`);
    } catch (e: unknown) {
      logger.error(`Errore aggiornamento articolo ${id}:`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const deleteArticle = async (id: string) => {
    loading.value = true;
    try {
      const docRef = doc(db, 'articles', id);
      await deleteDoc(docRef);
      logger.info(`Articolo ${id} eliminato.`);
    } catch (e: unknown) {
      logger.error(`Errore eliminazione articolo ${id}:`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateArticlesOrder = async (orderedArticles: Article[]) => {
    const updated = orderedArticles.map((art, idx) => ({ ...art, order: idx }));
    articles.value = updated;
    setCachedArticles(updated);

    try {
      const promises = updated.map((art) => {
        const docRef = doc(db, 'articles', art.id);
        return updateDoc(docRef, { order: art.order });
      });
      await Promise.all(promises);
      logger.info('Ordine articoli aggiornato su Firestore.');
    } catch (e: unknown) {
      logger.error('Errore aggiornamento ordine articoli:', e);
      throw e;
    }
  };

  return {
    articles,
    loading,
    subscribeToArticles,
    unsubscribeAll,
    processBannerImage,
    addArticle,
    updateArticle,
    deleteArticle,
    updateArticlesOrder,
  };
});
