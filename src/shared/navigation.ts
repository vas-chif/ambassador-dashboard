/**
 * @file navigation.ts
 * @description Single source of truth for admin navigation and dashboard items.
 * @author Vasile Chifeac (AI Agent)
 */

import type { AdminNavigationItem } from 'src/types/navigation';

export const ADMIN_NAV_ITEMS: AdminNavigationItem[] = [
  { icon: 'dashboard', label: 'Dashboard', to: '/admin/dashboard', color: 'indigo-7' },
  { icon: 'people', label: 'Ambassadors', to: '/admin/ambassadors', color: 'blue-7' },
  { icon: 'inventory_2', label: 'Products', to: '/admin/products', color: 'deep-purple-7' },
  { icon: 'article', label: 'Articles', to: '/admin/articles', color: 'orange-8' },
  { icon: 'settings', label: 'Settings', to: '/admin/settings', color: 'grey-8' },
];
