import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db } from 'src/boot/firebase';
import {
  doc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { setCssVar, uid } from 'quasar';
import { useSecureLogger } from 'src/shared/logger';
import { useArticlesStore } from 'stores/articles';

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
  fontFamily?: string;
  titleFont?: string;
  bodyFont?: string;
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
      titleFont: 'Playfair Display',
      bodyFont: 'Figtree',
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

  const articlesStore = useArticlesStore();
  const profile = ref<PublicProfile>(getCachedProfile());
  const loading = ref(false);
  const logger = useSecureLogger();

  const applyTheme = (p: PublicProfile) => {
    if (p.primaryColor) setCssVar('primary', p.primaryColor);
    if (p.secondaryColor) setCssVar('secondary', p.secondaryColor);

    if (typeof document !== 'undefined') {
      const titleFont = p.titleFont || p.fontFamily || 'Playfair Display';
      const bodyFont = p.bodyFont || 'Figtree';
      const isTitleSerif = ['Playfair Display', 'Cormorant Garamond', 'Cinzel'].includes(titleFont);
      const isBodySerif = ['Playfair Display', 'Cormorant Garamond', 'Cinzel'].includes(bodyFont);
      document.documentElement.style.setProperty(
        '--site-title-font',
        `"${titleFont}", ${isTitleSerif ? 'serif' : 'sans-serif'}`
      );
      document.documentElement.style.setProperty(
        '--site-body-font',
        `"${bodyFont}", ${isBodySerif ? 'serif' : 'sans-serif'}`
      );
    }
  };

  // Apply cached theme immediately
  applyTheme(profile.value);

  let unsubscribeProfile: (() => void) | null = null;

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

  const unsubscribeAll = () => {
    if (unsubscribeProfile) {
      unsubscribeProfile();
      unsubscribeProfile = null;
    }
    articlesStore.unsubscribeAll();
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

  // Delegated to articlesStore for backwards compatibility
  const articles = computed({
    get: () => articlesStore.articles,
    set: (val: Article[]) => {
      articlesStore.articles = val;
    },
  });

  return {
    profile,
    loading,
    applyTheme,
    subscribeToProfile,
    unsubscribeAll,
    unsubscribeFromProfile: unsubscribeAll,
    updateProfile,
    uploadAvatar,
    addQrCode,
    updateQrCode,
    removeQrCode,
    // Delegated to articlesStore for backwards compatibility
    articles,
    subscribeToArticles: articlesStore.subscribeToArticles,
    processBannerImage: articlesStore.processBannerImage,
    addArticle: articlesStore.addArticle,
    updateArticle: articlesStore.updateArticle,
    deleteArticle: articlesStore.deleteArticle,
    updateArticlesOrder: articlesStore.updateArticlesOrder,
  };
});
