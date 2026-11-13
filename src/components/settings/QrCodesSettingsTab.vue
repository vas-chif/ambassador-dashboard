<script setup lang="ts">
/**
 * @file QrCodesSettingsTab.vue
 * @description Tab per la gestione, caricamento, modifica e download dei QR Code del salone/vetrina.
 * @author Vasile Chifeac (AI Agent)
 */

import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useSettingsStore } from 'stores/settings';
import type { QrCode } from 'stores/settings';
import { useSecureLogger } from 'src/shared/logger';

const store = useSettingsStore();
const $q = useQuasar();
const logger = useSecureLogger();

const newQrName = ref('');
const newQrFile = ref<File | null>(null);
const showZoom = ref(false);
const showEdit = ref(false);
const selectedQr = ref<QrCode | null>(null);
const editQrName = ref('');

const openEditQr = (qr: QrCode) => {
  selectedQr.value = qr;
  editQrName.value = qr.name;
  showEdit.value = true;
};

const handleUpdateQr = async () => {
  if (!selectedQr.value || !editQrName.value) return;
  try {
    await store.updateQrCode(selectedQr.value.id, editQrName.value);
    $q.notify({ type: 'positive', message: 'Nome QR Code aggiornato' });
    showEdit.value = false;
  } catch (e: unknown) {
    logger.error('Errore aggiornamento QR Code:', e);
    $q.notify({ type: 'negative', message: 'Aggiornamento non riuscito' });
  }
};

const handleAddQr = async () => {
  if (!newQrName.value || !newQrFile.value) {
    $q.notify({ type: 'warning', message: 'Inserisci sia il nome che l\'immagine del QR Code' });
    return;
  }
  try {
    $q.loading.show({ message: 'Caricamento QR Code in corso...' });
    await store.addQrCode(newQrName.value, newQrFile.value);
    $q.loading.hide();
    $q.notify({ type: 'positive', message: 'QR Code aggiunto con successo' });
    newQrName.value = '';
    newQrFile.value = null;
  } catch (e: unknown) {
    logger.error('Errore aggiunta QR Code:', e);
    $q.loading.hide();
    $q.notify({ type: 'negative', message: 'Caricamento non riuscito' });
  }
};

const confirmDeleteQr = (qr: QrCode) => {
  $q.dialog({
    title: 'Conferma Eliminazione',
    message: `Sei sicuro di voler eliminare il QR Code "${qr.name}"?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await store.removeQrCode(qr.id);
        $q.notify({ type: 'positive', message: 'QR Code rimosso' });
      } catch (e: unknown) {
        logger.error('Errore rimozione QR Code:', e);
        $q.notify({ type: 'negative', message: 'Rimozione non riuscita' });
      }
    })();
  });
};

const openZoom = (qr: QrCode) => {
  selectedQr.value = qr;
  showZoom.value = true;
};

const downloadQr = async (qr: QrCode) => {
  try {
    const response = await fetch(qr.url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${qr.name.replace(/\s+/g, '_')}_qrcode.png`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (e: unknown) {
    logger.error('Errore download QR Code:', e);
    window.open(qr.url, '_blank');
  }
};
</script>

<template>
  <div>
    <!-- Add New QR Code Form -->
    <q-card flat bordered class="q-pa-md q-mb-lg bg-grey-1">
      <div class="text-subtitle1 text-weight-bold q-mb-sm">Aggiungi Nuovo QR Code</div>
      <div class="row q-col-gutter-md items-center">
        <div class="col-12 col-md-5">
          <q-input
            v-model="newQrName"
            label="Etichetta / Nome QR (es. Tavolo 1, Instagram, Menu)"
            outlined
            dense
          />
        </div>
        <div class="col-12 col-md-5">
          <q-file
            v-model="newQrFile"
            label="Seleziona Immagine QR"
            outlined
            dense
            accept="image/*"
          >
            <template #prepend>
              <q-icon name="qr_code" />
            </template>
          </q-file>
        </div>
        <div class="col-12 col-md-2">
          <q-btn
            color="primary"
            icon="add"
            label="Salva"
            unelevated
            class="full-width"
            @click="handleAddQr"
          />
        </div>
      </div>
    </q-card>

    <!-- QR Codes List -->
    <div class="text-subtitle1 text-weight-bold q-mb-md">I Tuoi QR Code Attivi</div>
    <div v-if="!store.profile.qrCodes || store.profile.qrCodes.length === 0" class="text-grey-6 q-pa-md text-center">
      Nessun QR Code presente. Aggiungine uno usando il form sopra.
    </div>

    <div v-else class="row q-col-gutter-md">
      <div
        v-for="qr in store.profile.qrCodes"
        :key="qr.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card bordered flat class="q-pa-md column items-center text-center">
          <q-img
            :src="qr.url"
            style="width: 140px; height: 140px"
            class="cursor-pointer shadow-1 rounded-borders"
            @click="openZoom(qr)"
          >
            <q-tooltip>Clicca per ingrandire</q-tooltip>
          </q-img>
          <div class="text-subtitle2 text-weight-bold q-mt-sm">{{ qr.name }}</div>

          <div class="row q-gutter-xs q-mt-md">
            <q-btn flat round size="sm" icon="zoom_in" color="primary" @click="openZoom(qr)">
              <q-tooltip>Ingrandisci</q-tooltip>
            </q-btn>
            <q-btn flat round size="sm" icon="download" color="primary" @click="downloadQr(qr)">
              <q-tooltip>Scarica File</q-tooltip>
            </q-btn>
            <q-btn flat round size="sm" icon="edit" color="grey-8" @click="openEditQr(qr)">
              <q-tooltip>Rinomina</q-tooltip>
            </q-btn>
            <q-btn flat round size="sm" icon="delete" color="negative" @click="confirmDeleteQr(qr)">
              <q-tooltip>Elimina</q-tooltip>
            </q-btn>
          </div>
        </q-card>
      </div>
    </div>

    <!-- Zoom Dialog -->
    <q-dialog v-model="showZoom">
      <q-card v-if="selectedQr" class="q-pa-md text-center" style="max-width: 400px">
        <div class="text-h6 q-mb-sm">{{ selectedQr.name }}</div>
        <q-img :src="selectedQr.url" style="width: 280px; height: 280px" class="rounded-borders" />
        <q-card-actions align="center" class="q-mt-sm">
          <q-btn flat label="Chiudi" color="grey-7" v-close-popup />
          <q-btn unelevated color="primary" icon="download" label="Scarica" @click="downloadQr(selectedQr)" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Edit Dialog -->
    <q-dialog v-model="showEdit">
      <q-card style="min-width: 320px" class="q-pa-md">
        <div class="text-h6 q-mb-md">Rinomina QR Code</div>
        <q-input v-model="editQrName" label="Nome QR Code" outlined dense class="q-mb-md" />
        <q-card-actions align="right">
          <q-btn flat label="Annulla" color="grey-7" v-close-popup />
          <q-btn unelevated color="primary" label="Salva" @click="handleUpdateQr" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
