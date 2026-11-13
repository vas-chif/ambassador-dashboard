import { defineStore } from 'pinia';
import { ref } from 'vue';
import { db } from 'src/boot/firebase';
import {
  doc,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { setCssVar, uid } from 'quasar';
import { useSecureLogger } from 'src/shared/logger';

export interface QrCode {
  id: string;
  name: string;
  url: string;
  createdAt: number;
}

export interface ArticleLayoutConfig {
  articleType?: 'testimonial' | 'product';
  displayMode?: 'below' | 'split-right' | 'split-left' | 'overlay';
  horizontalAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  boxWidth?: 'sm' | 'md' | 'lg' | 'full';
  textAlign?: 'left' | 'center' | 'right';
  cardBgColor?: string;
  cardTextColor?: string;
}

export interface Article {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  actionText: string;
  active: boolean;
  order: number;
  layoutConfig?: ArticleLayoutConfig;
}

export interface CustomSectionConfig {
  title?: string;
  bio?: string;
  bannerText?: string;
  bannerButtonText?: string;
  bannerUrl?: string;
  bannerEnabled?: boolean;
  articleFilterType?: 'all' | 'testimonial' | 'product';
  // Typography, alignment & style options (profile / bio / text blocks)
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontFamily?: 'serif' | 'sans';
  fontWeight?: 'light' | 'normal' | 'bold';
  titleSize?: 'h2' | 'h3' | 'h4';
  maxWidth?: 'sm' | 'md' | 'lg' | 'full';
  showAvatar?: boolean;
  showSocials?: boolean;
}

export interface PublicProfile {
  name: string;
  bio: string;
  avatarUrl: string;
  primaryColor: string;
  secondaryColor: string;
  productsSectionTitle?: string;
  // Dynamic Section Layout & Visibility
  sectionsOrder?: string[];
  hiddenSections?: string[];
  customSections?: Record<string, CustomSectionConfig>;
  // Action Pill Banner
  actionBannerEnabled?: boolean;
  actionBannerText?: string;
  actionBannerButtonText?: string;
  actionBannerUrl?: string;
  // Social Media
  whatsapp?: string;
  instagram?: string;
  tiktok?: string;
  email?: string;
  emailJsConfig?: {
    serviceId: string;
    templateId: string;
    publicKey: string;
  };
  qrCodes?: QrCode[];
}

const CACHE_KEY_PROFILE = 'glow_public_profile';
const CACHE_KEY_ARTICLES = 'glow_articles';

export const useSettingsStore = defineStore('settings', () => {
  // Stale-While-Revalidate: Load initial cached state from localStorage if available
  const getCachedProfile = (): PublicProfile => {
    try {
      const cached = localStorage.getItem(CACHE_KEY_PROFILE);
      if (cached) {
        return JSON.parse(cached) as PublicProfile;
      }
    } catch {
      // Ignore localStorage parse error
    }
    return {
      name: 'Maria Chifeac',
      bio: 'Welcome to my beauty shop!',
      avatarUrl: '',
      primaryColor: '#341414',
      secondaryColor: '#855457',
      productsSectionTitle: 'I Miei Prodotti Preferiti',
      sectionsOrder: ['profile', 'articles', 'actionBanner', 'products'],
      hiddenSections: [],
      actionBannerEnabled: true,
      actionBannerText: 'Acquista qui con codice sconto la tua Skin Care e integrazione personalizzata',
      actionBannerButtonText: 'Skin Care',
      actionBannerUrl: '',
      whatsapp: '',
      instagram: '',
      email: '',
      emailJsConfig: {
        serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
        templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
        publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
      },
      qrCodes: [],
    };
  };

  const getCachedArticles = (): Article[] => {
    try {
      const cached = localStorage.getItem(CACHE_KEY_ARTICLES);
      if (cached) {
        return JSON.parse(cached) as Article[];
      }
    } catch {
      // Ignore localStorage parse error
    }
    return [];
  };

  const setCachedArticles = (arts: Article[]) => {
    try {
      localStorage.setItem(CACHE_KEY_ARTICLES, JSON.stringify(arts));
    } catch {
      // Ignore localStorage save error
    }
  };

  const profile = ref<PublicProfile>(getCachedProfile());
  const articles = ref<Article[]>(getCachedArticles());
  const loading = ref(false);
  const logger = useSecureLogger();

  const applyTheme = (p: PublicProfile) => {
    if (p.primaryColor) setCssVar('primary', p.primaryColor);
    if (p.secondaryColor) setCssVar('secondary', p.secondaryColor);
  };

  // Apply cached theme immediately
  applyTheme(profile.value);

  let unsubscribeProfile: (() => void) | null = null;
  let unsubscribeArticles: (() => void) | null = null;

  const subscribeToProfile = () => {
    if (unsubscribeProfile) return;

    loading.value = true;
    const docRef = doc(db, 'settings', 'public_profile');

    unsubscribeProfile = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as PublicProfile;
          profile.value = { ...profile.value, ...data };
          applyTheme(profile.value);
          // Update cache with fresh data (Stale-While-Revalidate)
          try {
            localStorage.setItem(CACHE_KEY_PROFILE, JSON.stringify(profile.value));
          } catch {
            // Ignore quota exceeded
          }
          logger.info('Settings updated from realtime listener');
        }
        loading.value = false;
      },
      (error) => {
        logger.error('Error in profile subscription', error);
        loading.value = false;
      },
    );
  };

  const subscribeToArticles = () => {
    if (unsubscribeArticles) return;

    const articlesRef = collection(db, 'articles');
    const q = query(articlesRef, orderBy('order', 'asc'));

    unsubscribeArticles = onSnapshot(
      q,
      (snapshot) => {
        articles.value = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Article, 'id'>),
        }));

        // Cache articles locally
        try {
          localStorage.setItem(CACHE_KEY_ARTICLES, JSON.stringify(articles.value));
        } catch {
          // Ignore quota exceeded
        }

        if (articles.value.length === 0) {
          void seedDefaultArticles();
        }
      },
      (error) => {
        logger.error('Error in articles subscription', error);
      },
    );
  };

  const unsubscribeAll = () => {
    if (unsubscribeProfile) {
      unsubscribeProfile();
      unsubscribeProfile = null;
    }
    if (unsubscribeArticles) {
      unsubscribeArticles();
      unsubscribeArticles = null;
    }
  };

  const updateProfile = async (updates: Partial<PublicProfile>) => {
    loading.value = true;
    try {
      const docRef = doc(db, 'settings', 'public_profile');
      const newData = { ...profile.value, ...updates };
      // Optimistic update & local cache
      profile.value = newData;
      applyTheme(newData);
      try {
        localStorage.setItem(CACHE_KEY_PROFILE, JSON.stringify(newData));
      } catch {
        // Ignore quota
      }

      await setDoc(docRef, newData, { merge: true });
      logger.info('Settings saved');
    } catch (error) {
      logger.error('Error updating settings', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
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

          const MAX_SIZE = 500;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.7 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const processQrImage = async (file: File): Promise<string> => {
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

          const MAX_SIZE = 800;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const addQrCode = async (name: string, file: File) => {
    loading.value = true;
    try {
      const url = await processQrImage(file);
      const newQr: QrCode = {
        id: uid(),
        name,
        url,
        createdAt: Date.now(),
      };

      const currentQrs = profile.value.qrCodes || [];
      await updateProfile({ qrCodes: [...currentQrs, newQr] });
      return newQr;
    } catch (e) {
      logger.error('Error adding QR code', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateQrCode = async (qrId: string, newName: string) => {
    loading.value = true;
    try {
      const currentQrs = profile.value.qrCodes || [];
      const index = currentQrs.findIndex((q) => q.id === qrId);

      if (index !== -1) {
        const updatedQrs = [...currentQrs];
        const oldQr = updatedQrs[index];
        if (oldQr) {
          const updatedQr: QrCode = {
            id: oldQr.id,
            name: newName,
            url: oldQr.url,
            createdAt: oldQr.createdAt,
          };
          updatedQrs[index] = updatedQr;

          await updateProfile({ qrCodes: updatedQrs });
        }
      }
    } catch (e) {
      logger.error('Error updating QR code', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const removeQrCode = async (qrId: string) => {
    loading.value = true;
    try {
      const currentQrs = profile.value.qrCodes || [];
      const newQrs = currentQrs.filter((q) => q.id !== qrId);
      await updateProfile({ qrCodes: newQrs });
    } catch (e) {
      logger.error('Error removing QR code', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // --- ARTICLES --- //

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

  const addArticle = async (article: Omit<Article, 'id'>) => {
    loading.value = true;
    try {
      const articlesRef = collection(db, 'articles');
      await addDoc(articlesRef, article);
    } catch (e) {
      logger.error('Error adding article', e);
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
    } catch (e) {
      logger.error('Error updating article', e);
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
    } catch (e) {
      logger.error('Error deleting article', e);
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
      logger.info('Articles order updated successfully');
    } catch (e) {
      logger.error('Error updating articles order', e);
      throw e;
    }
  };

  const seedDefaultArticles = async () => {
    // Check if we already have articles
    if (articles.value.length > 0) return;

    const defaultArticle: Omit<Article, 'id'> = {
      title: 'Skin Consultation',
      description: 'Scopri la tua routine personalizzata con il Dr. Simon Ourian',
      imageUrl: 'https://placehold.co/1200x600/e0e0e0/333333?text=Skin+Consultation',
      linkUrl: 'https://simonourianmd.com/beautyrosebyrosy/SkinConsultation/Home',
      actionText: 'Fai il Test della Pelle',
      active: true,
      order: 1,
    };

    await addArticle(defaultArticle);
  };

  return {
    profile,
    articles,
    loading,
    subscribeToProfile,
    subscribeToArticles,
    unsubscribeAll,
    unsubscribeFromProfile: unsubscribeAll, // Alias for backward compatibility if needed
    updateProfile,
    uploadAvatar,
    addQrCode,
    updateQrCode,
    removeQrCode,
    processBannerImage,
    addArticle,
    updateArticle,
    deleteArticle,
    updateArticlesOrder,
  };
});
