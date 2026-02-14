/**
 * @file useProductInteractions.ts
 * @description Composable to handle local interactions (like, save, rate) for products.
 * @author Vasile Chifeac (AI Agent)
 * @created 2026-02-14
 */

import { ref, onMounted } from 'vue';
import { LocalStorage } from 'quasar';

export const useProductInteractions = () => {
  const likedProducts = ref<string[]>([]);
  const savedProducts = ref<string[]>([]);
  const productRatings = ref<Record<string, number>>({});

  const loadInteractions = () => {
    likedProducts.value = LocalStorage.getItem('likedProducts') || [];
    savedProducts.value = LocalStorage.getItem('savedProducts') || [];
    productRatings.value = LocalStorage.getItem('productRatings') || {};
  };

  const saveInteractions = () => {
    LocalStorage.set('likedProducts', likedProducts.value);
    LocalStorage.set('savedProducts', savedProducts.value);
    LocalStorage.set('productRatings', productRatings.value);
  };

  const toggleLike = (productId: string) => {
    const index = likedProducts.value.indexOf(productId);
    if (index === -1) {
      likedProducts.value.push(productId);
    } else {
      likedProducts.value.splice(index, 1);
    }
    saveInteractions();
  };

  const isLiked = (productId: string) => {
    return likedProducts.value.includes(productId);
  };

  const toggleSave = (productId: string) => {
    const index = savedProducts.value.indexOf(productId);
    if (index === -1) {
      savedProducts.value.push(productId);
    } else {
      savedProducts.value.splice(index, 1);
    }
    saveInteractions();
  };

  const isSaved = (productId: string) => {
    return savedProducts.value.includes(productId);
  };

  const setRating = (productId: string, rating: number) => {
    productRatings.value[productId] = rating;
    saveInteractions();
  };

  const getRating = (productId: string) => {
    return productRatings.value[productId] || 0;
  };

  // Web Share API Wrapper
  const shareProduct = async (product: {
    title: string;
    text?: string | undefined;
    url?: string;
  }) => {
    if (navigator.share) {
      try {
        const shareData: ShareData = {
          title: product.title,
          url: product.url || window.location.href,
        };
        if (product.text) {
          shareData.text = product.text;
        }

        await navigator.share(shareData);
        return true;
      } catch (err) {
        console.error('Error sharing', err);
        return false;
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(product.url || window.location.href);
        return 'copied';
      } catch (err) {
        console.error('Failed to copy', err);
        return false;
      }
    }
  };

  onMounted(() => {
    loadInteractions();
  });

  return {
    likedProducts,
    savedProducts,
    productRatings,
    toggleLike,
    isLiked,
    toggleSave,
    isSaved,
    setRating,
    getRating,
    shareProduct,
  };
};
