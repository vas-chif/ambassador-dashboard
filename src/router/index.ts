import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    // Dynamic import to avoid circular dependency if store uses router
    const { useAuthStore } = await import('stores/auth');
    const authStore = useAuthStore();

    // Wait for auth to init (simplified)
    // In a real app we might want to ensure Firebase auth is settled.
    // authStore.init() is called in App.vue or boot file ideally.

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const isAuthenticated = authStore.isAuthenticated;

    if (requiresAuth && !isAuthenticated) {
      next('/admin/login');
    } else if (to.path === '/admin/login' && isAuthenticated) {
      next('/admin/dashboard');
    } else {
      next();
    }
  });

  return Router;
});
