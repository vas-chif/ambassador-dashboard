<script setup lang="ts">
/**
 * @file ProfileSettingsTab.vue
 * @description Tab per la gestione dei dati anagrafici, biografia, avatar e link social dell'ambassador.
 * @author Vasile Chifeac (AI Agent)
 */

import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useSettingsStore } from 'stores/settings';
import { useSecureLogger } from 'src/shared/logger';

const store = useSettingsStore();
const $q = useQuasar();
const logger = useSecureLogger();

const avatarFile = ref<File | null>(null);

const onFileSelected = async (file: File | null) => {
  if (file) {
    try {
      $q.loading.show({ message: 'Caricamento avatar in corso...' });
      const url = await store.uploadAvatar(file);
      await store.updateProfile({ avatarUrl: url });
      $q.loading.hide();
      $q.notify({ type: 'positive', message: 'Foto profilo aggiornata con successo' });
      avatarFile.value = null;
    } catch (e: unknown) {
      logger.error('Errore durante l\'upload dell\'avatar:', e);
      $q.loading.hide();
      $q.notify({ type: 'negative', message: 'Caricamento non riuscito' });
    }
  }
};
</script>

<template>
  <div class="q-gutter-y-lg">
    <!-- Avatar Section -->
    <div class="row items-center q-gutter-x-lg">
      <q-avatar size="100px" class="shadow-2">
        <img
          :src="store.profile.avatarUrl || 'https://placehold.co/200'"
          style="object-fit: cover; width: 100%; height: 100%"
        />
      </q-avatar>
      <div class="col">
        <div class="text-subtitle2 q-mb-sm">Foto Profilo / Avatar</div>
        <q-file
          v-model="avatarFile"
          outlined
          dense
          label="Cambia Immagine del Profilo"
          accept="image/*"
          class="full-width"
          @update:model-value="onFileSelected"
        >
          <template #prepend>
            <q-icon name="cloud_upload" />
          </template>
        </q-file>
      </div>
    </div>

    <!-- Basic Info -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-input
          :model-value="store.profile.name"
          label="Nome Ambassador / Salone *"
          outlined
          @update:model-value="store.profile.name = String($event)"
        />
      </div>
      <div class="col-12 col-md-6">
        <q-input
          :model-value="store.profile.email"
          label="Email Pubblica"
          outlined
          @update:model-value="store.profile.email = String($event)"
        />
      </div>
      <div class="col-12">
        <q-input
          :model-value="store.profile.bio"
          label="Biografia / Presentazione"
          type="textarea"
          outlined
          rows="3"
          @update:model-value="store.profile.bio = String($event)"
        />
      </div>
    </div>

    <!-- Social Links -->
    <div class="text-subtitle1 text-weight-bold q-mt-md">Canali Social & WhatsApp</div>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-4">
        <q-input
          :model-value="store.profile.whatsapp"
          label="Numero WhatsApp (con prefisso, es. +39...)"
          outlined
          dense
          @update:model-value="store.profile.whatsapp = String($event)"
        >
          <template #prepend>
            <q-icon name="fa-brands fa-whatsapp" color="positive" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-4">
        <q-input
          :model-value="store.profile.instagram"
          label="Username Instagram (o link)"
          outlined
          dense
          @update:model-value="store.profile.instagram = String($event)"
        >
          <template #prepend>
            <q-icon name="fa-brands fa-instagram" color="pink" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-4">
        <q-input
          :model-value="store.profile.tiktok"
          label="Username TikTok (o link)"
          outlined
          dense
          @update:model-value="store.profile.tiktok = String($event)"
        >
          <template #prepend>
            <q-icon name="fa-brands fa-tiktok" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Section Titles & Banner -->
    <div class="text-subtitle1 text-weight-bold q-mt-md">Impostazioni Vetrina Predefinite</div>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-input
          :model-value="store.profile.productsSectionTitle"
          label="Titolo Sezione Prodotti"
          outlined
          dense
          @update:model-value="store.profile.productsSectionTitle = String($event)"
        />
      </div>
      <div class="col-12 col-md-6">
        <q-input
          :model-value="store.profile.actionBannerButtonText"
          label="Testo Bottone Banner"
          outlined
          dense
          @update:model-value="store.profile.actionBannerButtonText = String($event)"
        />
      </div>
      <div class="col-12">
        <q-input
          :model-value="store.profile.actionBannerText"
          label="Testo Banner Promozionale"
          outlined
          dense
          @update:model-value="store.profile.actionBannerText = String($event)"
        />
      </div>
      <div class="col-12">
        <q-input
          :model-value="store.profile.actionBannerUrl"
          label="Link Destinazione Banner (opzionale)"
          outlined
          dense
          hint="Se vuoto, invia direttamente un messaggio a WhatsApp"
          @update:model-value="store.profile.actionBannerUrl = String($event)"
        />
      </div>
      <div class="col-12">
        <q-toggle
          :model-value="store.profile.actionBannerEnabled ?? true"
          label="Banner Promozionale Abilitato"
          color="positive"
          @update:model-value="store.profile.actionBannerEnabled = Boolean($event)"
        />
      </div>
    </div>
  </div>
</template>

