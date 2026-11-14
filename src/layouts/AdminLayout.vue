<script setup lang="ts">
/**
 * @file AdminLayout.vue
 * @description Main layout for the Admin Dashboard.
 * @author Vasile Chifeac (AI Agent)
 * @created 2026-02-06
 * @modified 2026-02-06
 */

import { ref, onMounted } from 'vue';
import { useAuthStore } from 'stores/auth';
import { useSettingsStore } from 'stores/settings';
import { useRouter, useRoute } from 'vue-router';

import { ADMIN_NAV_ITEMS } from 'src/shared/navigation';

const leftDrawerOpen = ref(false);
const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const router = useRouter();
const route = useRoute();

onMounted(() => {
  settingsStore.subscribeToProfile();
});

const isRouteActive = (target: string) => {
  if (route.path === target) return true;
  if (target !== '/admin' && target !== '/admin/dashboard' && route.path.startsWith(target)) {
    return true;
  }
  return false;
};

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const logout = async () => {
  await authStore.logout();
  await router.push('/admin/login');
};

const menuItems = ADMIN_NAV_ITEMS;
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-white text-grey-8">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          {{ settingsStore.profile.name ? settingsStore.profile.name + ' — Console' : 'Console Ambassador' }}
        </q-toolbar-title>

        <div class="row items-center q-gutter-xs">
          <q-btn flat round icon="visibility" to="/admin/preview">
            <q-tooltip>Live Preview & Visual Manager</q-tooltip>
          </q-btn>
          <q-btn flat round icon="logout" @click="logout">
            <q-tooltip>Logout</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list class="q-pt-sm">
        <q-item-label header class="text-weight-bold text-uppercase text-grey-6 text-caption q-px-md">
          Management
        </q-item-label>

        <q-item
          v-for="link in menuItems"
          :key="link.label"
          clickable
          :to="link.to"
          :active="isRouteActive(link.to)"
          active-class="admin-nav-item--active"
          class="admin-nav-item q-mx-sm q-my-xs rounded-borders transition-fast"
        >
          <q-item-section avatar class="q-pr-sm min-width-auto">
            <q-icon
              :name="link.icon"
              :color="isRouteActive(link.to) ? 'primary' : 'grey-7'"
              size="22px"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label
              :class="isRouteActive(link.to) ? 'text-primary text-weight-bold' : 'text-grey-8 text-weight-medium'"
            >
              {{ link.label }}
            </q-item-label>
          </q-item-section>

          <q-item-section v-if="isRouteActive(link.to)" side class="q-pl-none">
            <div class="active-dot-indicator" />
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
.min-width-auto {
  min-width: 36px;
}

.transition-fast {
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.admin-nav-item {
  border-radius: 8px;
  border-left: 3px solid transparent;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
}

.admin-nav-item--active {
  background: rgba(52, 20, 20, 0.08) !important;
  border-left: 4px solid var(--q-primary, #341414) !important;
}

.active-dot-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--q-primary, #341414);
}
</style>
