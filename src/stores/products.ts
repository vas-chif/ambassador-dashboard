/**
 * @file products.ts
 * @description Products store managing product data and real-time updates.
 * @author Vasile Chifeac (AI Agent)
 * @created 2026-02-06
 * @modified 2026-02-06
 *
 * @dependencies
 * - pinia
 * - firebase/firestore
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { db } from 'src/boot/firebase';
import type { Unsubscribe } from 'firebase/firestore';
import {
  collection,
  onSnapshot,
  query,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { useSecureLogger } from 'src/shared/logger';
import type { Product } from 'src/types/product';

export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([]);
  const loading = ref(false);
  const logger = useSecureLogger();
  let unsubscribe: Unsubscribe | null = null;

  const subscribeToProducts = () => {
    if (unsubscribe) return; // Already subscribed

    loading.value = true;
    logger.info('Subscribing to products updates');

    const q = query(collection(db, 'products'));

    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        products.value = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Product,
        );
        loading.value = false;
        logger.debug('Products updated', { count: products.value.length });
      },
      (error) => {
        logger.error('Products subscription error', error);
        loading.value = false;
      },
    );
  };

  const unsubscribeFromProducts = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
      logger.info('Unsubscribed from products');
    }
  };

  const addProduct = async (product: Partial<Product>) => {
    loading.value = true;
    try {
      const colRef = collection(db, 'products');
      await addDoc(colRef, product);
      logger.info('Product added', { name: product.name });
    } catch (error: unknown) {
      logger.error('Error adding product', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    loading.value = true;
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, updates);
      logger.info('Product updated', { id });
    } catch (error: unknown) {
      logger.error('Error updating product', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deleteProduct = async (id: string) => {
    loading.value = true;
    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
      logger.info('Product deleted', { id });
    } catch (error: unknown) {
      logger.error('Error deleting product', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const uploadProductImage = async (file: File): Promise<string> => {
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

          // Max dimensions
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

          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.7 quality
          // This significantly reduces the string size for Firestore
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedDataUrl);
        };

        img.onerror = () => reject(new Error('Failed to load image for compression'));
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  return {
    products,
    loading,
    subscribeToProducts,
    unsubscribeFromProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
  };
});
