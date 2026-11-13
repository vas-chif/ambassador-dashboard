<script setup lang="ts">
/**
 * @file AdminSettings.vue
 * @description Pagina di amministrazione per le impostazioni e risorse del salone.
 * Architettura a schede modulari decomposta in conformità a §0.2 e §0.3.
 * @author Vasile Chifeac (AI Agent)
 */

import { ref, onMounted, onUnmounted } from 'vue';
import { useSettingsStore } from 'stores/settings';
import { useQuasar } from 'quasar';
import { useSecureLogger } from 'src/shared/logger';

// Sub-componenti modulari delle Tab
import ProfileSettingsTab from 'components/settings/ProfileSettingsTab.vue';
import BrandingSettingsTab from 'components/settings/BrandingSettingsTab.vue';
import QrCodesSettingsTab from 'components/settings/QrCodesSettingsTab.vue';
import EmailConfigTab from 'components/settings/EmailConfigTab.vue';

const store = useSettingsStore();
const $q = useQuasar();
const logger = useSecureLogger();

const activeTab = ref('profile');
const saving = ref(false);

onMounted(() => {
  store.subscribeToProfile();
});

onUnmounted(() => {
  store.unsubscribeFromProfile();
});

const saveSettings = async () => {
  saving.value = true;
  try {
    await store.updateProfile(store.profile);
    $q.notify({ type: 'positive', message: 'Impostazioni salvate con successo' });
  } catch (e: unknown) {
    logger.error('Errore durante il salvataggio delle impostazioni:', e);
    $q.notify({ type: 'negative', message: 'Salvataggio non riuscito' });
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <q-page class="q-pa-md max-width-container">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-primary">Impostazioni & Risorse</div>
        <div class="text-caption text-grey-7">Gestisci l'identità del tuo profilo, i colori del brand e i codici QR.</div>
      </div>
      <q-btn
        color="primary"
        icon="save"
        label="Salva Tutte le Modifiche"
        unelevated
        :loading="saving"
        class="q-px-lg shadow-2 text-weight-bold"
        @click="saveSettings"
      />
    </div>

    <q-card flat bordered class="rounded-borders overflow-hidden shadow-1">
      <q-tabs
        v-model="activeTab"
        class="text-grey-8 bg-grey-1"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="profile" icon="person" label="Profilo & Social" />
        <q-tab name="branding" icon="palette" label="Colori & Branding" />
        <q-tab name="qr" icon="qr_code" label="QR Code Vetrina" />
        <q-tab name="email" icon="mail" label="Modulo EmailJS" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated class="q-pa-lg">
        <q-tab-panel name="profile" class="q-pa-none">
          <ProfileSettingsTab />
        </q-tab-panel>

        <q-tab-panel name="branding" class="q-pa-none">
          <BrandingSettingsTab />
        </q-tab-panel>

        <q-tab-panel name="qr" class="q-pa-none">
          <QrCodesSettingsTab />
        </q-tab-panel>

        <q-tab-panel name="email" class="q-pa-none">
          <EmailConfigTab />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<style scoped>
.max-width-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
