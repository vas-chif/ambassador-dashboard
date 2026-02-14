/**
 * @file routes.ts
 * @description Application Routing Configuration.
 * @author Vasile Chifeac (AI Agent)
 * @created 2026-02-06
 * @modified 2026-02-06
 */

import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // Admin Routes
  {
    path: '/admin',
    meta: { requiresAuth: true },
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', component: () => import('pages/admin/AdminDashboard.vue') },
      { path: 'products', component: () => import('pages/admin/AdminProducts.vue') },
      { path: 'ambassadors', component: () => import('pages/admin/AdminAmbassadors.vue') },
      { path: 'articles', component: () => import('pages/admin/AdminArticles.vue') },
      { path: 'settings', component: () => import('pages/admin/AdminSettings.vue') },
    ],
  },
  {
    path: '/admin/login',
    // Using a blank layout or MainLayout.
    // Ideally we create a SimpleLayout, but for now MainLayout is likely provided by scaffold.
    component: () => import('layouts/BlankLayout.vue'),
    children: [{ path: '', component: () => import('pages/admin/AdminLogin.vue') }],
  },

  // Public / Ambassador Routes
  {
    path: '/',
    component: () => import('layouts/AmbassadorLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/LandingPage.vue'),
      },
      {
        path: ':ambassadorId',
        component: () => import('pages/AmbassadorPage.vue'),
      },
      {
        path: ':ambassadorId/editor',
        component: () => import('pages/EditorPage.vue'),
        // Add auth guard here for real app
      },
    ],
  },

  // Fallback
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
