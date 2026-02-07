/**
 * @file ambassador.ts
 * @description Ambassador store managing profile and layout data.
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
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { useSecureLogger } from 'src/shared/logger';
import type { AmbassadorProfile, WidgetConfig } from 'src/types/ambassador';

export const useAmbassadorStore = defineStore('ambassador', () => {
  const currentAmbassador = ref<AmbassadorProfile | null>(null);
  const layout = ref<WidgetConfig[]>([]);
  const loading = ref(false);
  const logger = useSecureLogger();
  let unsubscribeLayout: Unsubscribe | null = null;

  const loadAmbassador = async (id: string) => {
    loading.value = true;
    try {
      const docRef = doc(db, 'ambassadors', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        currentAmbassador.value = { id: snap.id, ...snap.data() } as AmbassadorProfile;
        logger.info('Ambassador loaded', { id });

        // Subscribe to layout changes for real-time updates
        subscribeToLayout(id);
      } else {
        logger.warn('Ambassador not found', { id });
        currentAmbassador.value = null;
      }
    } catch (error: unknown) {
      logger.error('Error loading ambassador', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const subscribeToLayout = (ambassadorId: string) => {
    if (unsubscribeLayout) unsubscribeLayout();

    const layoutRef = doc(db, 'ambassadors', ambassadorId, 'config', 'layout');
    unsubscribeLayout = onSnapshot(
      layoutRef,
      (snap) => {
        if (snap.exists()) {
          layout.value = snap.data().widgets || [];
          logger.debug('Layout updated', { count: layout.value.length });
        } else {
          layout.value = [];
        }
      },
      (error: unknown) => {
        logger.error('Layout subscription error', error);
      },
    );
  };

  const unload = () => {
    if (unsubscribeLayout) {
      unsubscribeLayout();
      unsubscribeLayout = null;
    }
    currentAmbassador.value = null;
    layout.value = [];
  };

  const updateTheme = async (themeColor: string) => {
    if (!currentAmbassador.value) return;
    try {
      const docRef = doc(db, 'ambassadors', currentAmbassador.value.id);
      await setDoc(docRef, { themeColor }, { merge: true });
      currentAmbassador.value.themeColor = themeColor;
      logger.info('Theme updated', { id: currentAmbassador.value.id, themeColor });
    } catch (error: unknown) {
      logger.error('Error updating theme', error);
      throw error;
    }
  };

  return {
    currentAmbassador,
    layout,
    loading,
    loadAmbassador,
    unload,
    updateTheme,
  };
});
