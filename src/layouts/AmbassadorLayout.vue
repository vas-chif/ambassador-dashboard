<script setup lang="ts">
import { useSettingsStore } from 'stores/settings';
import { onMounted, onUnmounted } from 'vue';

const settings = useSettingsStore();

onMounted(() => {
  settings.subscribeToProfile();
});

onUnmounted(() => {
  settings.unsubscribeFromProfile();
});
</script>

<template>
  <q-layout view="hhh lpR fff">
    <q-header elevated class="bg-primary text-white" reveal>
      <q-toolbar>
        <q-toolbar-title class="text-center font-serif text-h5">
          {{ settings.profile.name || 'Beauty Ambassador' }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-secondary text-white q-py-lg">
      <div class="text-center column items-center q-gutter-y-sm">
        <div class="text-caption">© {{ new Date().getFullYear() }} {{ settings.profile.name }}</div>

        <q-btn
          flat
          dense
          size="sm"
          color="grey-5"
          icon="lock"
          label="Admin Area"
          to="/admin/login"
          class="opacity-50 hover-opacity-100"
        />
      </div>
    </q-footer>
  </q-layout>
</template>

<style scoped lang="scss">
.font-serif {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  letter-spacing: 1px;
}
</style>
