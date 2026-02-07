import { boot } from 'quasar/wrappers';
import { useAuthStore } from 'stores/auth';

export default boot(async () => {
  const authStore = useAuthStore();
  // Wait for Firebase to determine auth state
  await authStore.init();
});
