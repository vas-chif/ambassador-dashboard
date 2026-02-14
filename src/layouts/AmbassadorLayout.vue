<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useSettingsStore } from 'stores/settings';
import ContactDialog from 'components/widgets/ContactDialog.vue';

const settings = useSettingsStore();
const showContactDialog = ref(false);

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
        <q-toolbar-title
          class="text-center font-serif"
          :class="$q.screen.gt.xs ? 'text-h5' : 'text-subtitle1'"
        >
          <!-- {{ settings.profile.name || 'Beauty Ambassador' }} -->
          SIMON OURIAN M.D. by {{ settings.profile.name }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-secondary text-white row items-center justify-around q-py-md q-mt-xl">
      <!-- Copyright (Right) -->
      <div class="text-caption">© {{ new Date().getFullYear() }} {{ settings.profile.name }}</div>
      <!-- Social Media Links (Left) -->
      <div class="row items-center q-gutter-sm text-caption">
        <div>Contatti:</div>

        <q-btn
          v-if="settings.profile.whatsapp"
          round
          flat
          color="white"
          icon="fa-brands fa-whatsapp"
          type="a"
          :href="'https://wa.me/' + settings.profile.whatsapp.replace('+', '')"
          target="_blank"
          size="sm"
        >
          <q-tooltip>WhatsApp</q-tooltip>
        </q-btn>
        <q-btn
          v-if="settings.profile.tiktok"
          round
          flat
          color="white"
          icon="fa-brands fa-tiktok"
          type="a"
          :href="
            settings.profile.tiktok.startsWith('http')
              ? settings.profile.tiktok
              : 'https://tiktok.com/@' + settings.profile.tiktok.replace('@', '')
          "
          target="_blank"
          size="sm"
        >
          <q-tooltip>TikTok</q-tooltip>
        </q-btn>
        <q-btn
          v-if="settings.profile.instagram"
          round
          flat
          color="white"
          icon="fa-brands fa-instagram"
          type="a"
          :href="
            settings.profile.instagram.startsWith('http')
              ? settings.profile.instagram
              : 'https://instagram.com/' + settings.profile.instagram.replace('@', '')
          "
          target="_blank"
          size="sm"
        >
          <q-tooltip>Instagram</q-tooltip>
        </q-btn>
        <q-btn
          v-if="settings.profile.email"
          round
          flat
          color="white"
          icon="email"
          @click="showContactDialog = true"
          size="sm"
        >
          <q-tooltip>Email</q-tooltip>
        </q-btn>
      </div>

      <!-- Admin Area Link (Centered Below) -->
      <div class="text-center q-mt-sm">
        <q-btn
          flat
          dense
          size="sm"
          color="grey-6"
          icon="lock"
          label="Admin Area"
          to="/admin/login"
          target="_blank"
          type="a"
          class="opacity-50 hover-opacity-100"
        />
      </div>
    </q-footer>

    <!-- Contact Dialog -->
    <ContactDialog v-model="showContactDialog" />
  </q-layout>
</template>

<style scoped lang="scss">
.font-serif {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  letter-spacing: 1px;
}
</style>
