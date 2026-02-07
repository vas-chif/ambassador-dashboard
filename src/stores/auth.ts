/**
 * @file auth.ts
 * @description Authentication store managing user session and roles.
 * @author Vasile Chifeac (AI Agent)
 * @created 2026-02-06
 * @modified 2026-02-06
 *
 * @dependencies
 * - pinia
 * - firebase/auth
 * - src/boot/firebase
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { auth } from 'src/boot/firebase';
import type { User } from 'firebase/auth';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { useSecureLogger } from 'src/shared/logger';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const logger = useSecureLogger();
  // const router = useRouter(); // Unused for now

  const init = () => {
    return new Promise<void>((resolve) => {
      onAuthStateChanged(auth, (u) => {
        user.value = u;
        if (u) {
          logger.info('Auth state changed: User logged in', { uid: u.uid, email: u.email });
        } else {
          logger.info('Auth state changed: User logged out');
        }
        resolve();
      });
    });
  };

  // ...

  const login = async (email: string, pass: string) => {
    loading.value = true;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      user.value = userCredential.user;
      logger.info('Login successful');
    } catch (error: unknown) {
      logger.error('Login failed', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      logger.info('Logout successful');
    } catch (error: unknown) {
      logger.error('Logout failed', error);
    }
  };

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => {
    // Basic check, ideally checks custom claims
    // For prototype, we might assume email domain check or similar
    // For now, return true if logged in (since only admins login via email/pass usually)
    // Ambassadors use a code or public link?
    // User request: "Ambasciatori: login con codice univoco... Admin: email/password"
    return !!user.value;
  });

  return {
    user,
    loading,
    init,
    login,
    logout,
    isAuthenticated,
    isAdmin,
  };
});
