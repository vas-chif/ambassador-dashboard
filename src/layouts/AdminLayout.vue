<script setup lang="ts">
/**
 * @file AdminLayout.vue
 * @description Main layout for the Admin Dashboard.
 * @author Vasile Chifeac (AI Agent)
 * @created 2026-02-06
 * @modified 2026-02-06
 */

import { ref } from 'vue';
import { useAuthStore } from 'stores/auth';
import { useRouter } from 'vue-router';

const leftDrawerOpen = ref(false);
const authStore = useAuthStore();
const router = useRouter();

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const logout = async () => {
  await authStore.logout();
  await router.push('/admin/login');
};

const menuItems = [
  { icon: 'dashboard', label: 'Dashboard', to: '/admin/dashboard' },
  { icon: 'people', label: 'Ambassadors', to: '/admin/ambassadors' },
  { icon: 'inventory_2', label: 'Products', to: '/admin/products' },
  { icon: 'settings', label: 'Settings', to: '/admin/settings' },
];
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-white text-grey-8">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Beauty Shop Admin </q-toolbar-title>

        <div>
          <q-btn flat round icon="notifications" />
          <q-btn flat round icon="logout" @click="logout" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list>
        <q-item-label header> Management </q-item-label>

        <q-item v-for="link in menuItems" :key="link.label" clickable tag="a" :to="link.to">
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ link.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped lang="scss">
/* Admin specific overrides if needed */
</style>
