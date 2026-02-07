import { defineStore } from 'pinia';
import { ref } from 'vue';
import { db } from 'src/boot/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { setCssVar } from 'quasar';
import { useSecureLogger } from 'src/shared/logger';

export interface PublicProfile {
  name: string;
  bio: string;
  avatarUrl: string;
  primaryColor: string;
  secondaryColor: string;
  // Tesserino Fields
  // Social Media
  whatsapp?: string;
  instagram?: string;
  email?: string;
  emailJsConfig?: {
    serviceId: string;
    templateId: string;
    publicKey: string;
  };
}

export const useSettingsStore = defineStore('settings', () => {
  const profile = ref<PublicProfile>({
    name: 'Maria Chifeac',
    bio: 'Welcome to my beauty shop!',
    avatarUrl: '',
    primaryColor: '#341414',
    secondaryColor: '#855457',
    whatsapp: '',
    instagram: '',
    email: '',
    emailJsConfig: {
      serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
      templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
      publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
    },
  });

  const loading = ref(false);
  const logger = useSecureLogger();

  const applyTheme = (p: PublicProfile) => {
    if (p.primaryColor) setCssVar('primary', p.primaryColor);
    if (p.secondaryColor) setCssVar('secondary', p.secondaryColor);
  };

  let unsubscribe: (() => void) | null = null;

  const subscribeToProfile = () => {
    if (unsubscribe) return; // Already subscribed

    loading.value = true;
    const docRef = doc(db, 'settings', 'public_profile');

    unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as PublicProfile;
          profile.value = { ...profile.value, ...data };
          applyTheme(profile.value);
          logger.info('Settings updated from realtime listener');
        } else {
          // Create default if missing on first load
          // trigger updateProfile(profile.value) but avoid infinite loop if it fails
          // For now, just keep default state
        }
        loading.value = false;
      },
      (error) => {
        logger.error('Error in profile subscription', error);
        loading.value = false;
      },
    );
  };

  const unsubscribeFromProfile = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };

  const updateProfile = async (updates: Partial<PublicProfile>) => {
    loading.value = true;
    try {
      const docRef = doc(db, 'settings', 'public_profile');
      const newData = { ...profile.value, ...updates };
      // Optimistic update
      profile.value = newData;
      applyTheme(newData);

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

          // Max dimensions for Avatar (smaller)
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

          // Compress to JPEG with 0.7 quality (matched to products strategy)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  return {
    profile,
    loading,
    subscribeToProfile,
    unsubscribeFromProfile,
    updateProfile,
    uploadAvatar,
  };
});
