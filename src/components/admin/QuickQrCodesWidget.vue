<script setup lang="ts">
/**
 * @file QuickQrCodesWidget.vue
 * @description Widget Dashboard per la visualizzazione immediata, ingrandimento per scansione,
 * download e stampa rapida dei QR Code senza accedere a Impostazioni.
 * Rispetta le regole di modularità e limiti dimensionali (§0.2 / §0.3 AGENTS.md).
 * @author Vasile Chifeac (AI Agent)
 */

import { computed, ref } from 'vue';
import { useSettingsStore } from 'stores/settings';
import type { QrCode } from 'stores/settings';
import { useQuasar } from 'quasar';
import { useSecureLogger } from 'src/shared/logger';

const store = useSettingsStore();
const $q = useQuasar();
const logger = useSecureLogger();

const qrList = computed<QrCode[]>(() => store.profile.qrCodes || []);

// Modal Zoom State
const showZoomDialog = ref(false);
const activeQr = ref<QrCode | null>(null);

const openZoom = (qr: QrCode) => {
  activeQr.value = qr;
  showZoomDialog.value = true;
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
    $q.notify({
      type: 'positive',
      message: `Download di "${qr.name}" completato`,
      icon: 'download',
      timeout: 1200,
    });
  } catch (e: unknown) {
    logger.error('Errore download QR Code:', e);
    window.open(qr.url, '_blank');
  }
};

const printQr = (qr: QrCode) => {
  const w = window.open('', '_blank');
  if (!w) {
    $q.notify({ type: 'warning', message: 'Abilita i popup per stampare' });
    return;
  }
  w.document.write(`
    <html><head><title>${qr.name} - QR Code</title>
    <style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:90vh;font-family:sans-serif;text-align:center}
    .c{border:2px solid #341414;border-radius:16px;padding:28px;max-width:320px;box-shadow:0 4px 12px rgba(0,0,0,0.1)}
    img{width:240px;height:240px;object-fit:contain;margin-bottom:12px}h2{color:#341414;margin:0 0 12px}p{color:#666;margin:0;font-size:13px}</style>
    </head><body><div class="c"><h2>${qr.name}</h2><img src="${qr.url}" alt="${qr.name}" onload="window.print();window.close();"/><p>Inquadra con la fotocamera</p></div></body></html>
  `);
  w.document.close();
};

const copyQrLink = async (qr: QrCode) => {
  try {
    await navigator.clipboard.writeText(qr.url);
    $q.notify({
      type: 'positive',
      message: 'Link immagine QR copiato negli appunti!',
      icon: 'content_copy',
      timeout: 1200,
    });
  } catch {
    $q.notify({ type: 'warning', message: 'Impossibile copiare negli appunti' });
  }
};
</script>

<template>
  <div class="quick-qr-widget q-mb-lg">
    <!-- Header Widget -->
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center q-gutter-x-sm">
        <q-avatar size="38px" icon="qr_code_2" color="primary" text-color="white" />
        <div>
          <div class="text-h6 text-weight-bold text-primary" style="line-height: 1.2">
            I Tuoi QR Code Salone & Vetrina
          </div>
          <div class="text-caption text-grey-7">
            Scannerizza al volo dal bancone, scarica in alta risoluzione o stampa per i clienti
          </div>
        </div>
      </div>

      <q-btn
        flat
        no-caps
        dense
        color="primary"
        icon="settings"
        label="Gestisci in Impostazioni"
        to="/admin/settings"
        class="text-weight-bold text-caption"
      />
    </div>

    <!-- Empty State -->
    <q-card
      v-if="qrList.length === 0"
      flat
      bordered
      class="q-pa-lg text-center bg-grey-1 rounded-borders"
    >
      <q-icon name="qr_code_scanner" size="48px" color="grey-5" class="q-mb-sm" />
      <div class="text-subtitle1 text-grey-8 text-weight-medium">
        Nessun QR Code ancora registrato
      </div>
      <div class="text-caption text-grey-6 q-mb-md">
        Carica i QR Code del tuo salone (WhatsApp, Instagram, Menu trattamenti o Link Vetrina) nelle impostazioni per visualizzarli qui.
      </div>
      <q-btn
        unelevated
        color="primary"
        icon="add"
        label="Carica Nuovo QR Code"
        to="/admin/settings"
        size="sm"
        class="rounded-borders"
      />
    </q-card>

    <!-- QR Codes Grid -->
    <div v-else class="row q-col-gutter-md">
      <div
        v-for="qr in qrList"
        :key="qr.id"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <q-card
          bordered
          flat
          class="qr-quick-card full-height column justify-between shadow-1 hover-elevation transition-easy"
        >
          <!-- Top Card Image Container (Clickable for Immediate Zoom) -->
          <div
            class="qr-img-wrapper cursor-pointer bg-white relative-position flex flex-center q-pa-md"
            @click="openZoom(qr)"
          >
            <q-img
              :src="qr.url"
              fit="contain"
              style="width: 160px; height: 160px"
              class="rounded-borders"
            >
              <template #error>
                <div class="absolute-full flex flex-center bg-grey-2 text-grey-6">
                  <q-icon name="broken_image" size="36px" />
                </div>
              </template>
            </q-img>

            <!-- Floating Scan Overlay Pill -->
            <div class="scan-pill absolute-bottom q-mb-sm">
              <q-badge color="primary" text-color="white" class="q-px-sm q-py-xs shadow-2 cursor-pointer">
                <q-icon name="fullscreen" size="14px" class="q-mr-xs" />
                Ingrandisci per Scannerizzare
              </q-badge>
            </div>
          </div>

          <!-- Bottom Card Content & Actions -->
          <div class="q-pa-sm bg-grey-1 border-top">
            <div class="text-subtitle2 text-weight-bold text-center text-primary ellipsis q-mb-xs">
              {{ qr.name }}
            </div>

            <!-- Quick Action Toolbar -->
            <div class="row justify-center items-center q-gutter-x-xs no-wrap">
              <!-- Direct Scan / Zoom Button -->
              <q-btn
                dense
                unelevated
                size="sm"
                color="primary"
                icon="qr_code_scanner"
                label="Scansiona"
                no-caps
                class="q-px-xs text-weight-bold"
                @click="openZoom(qr)"
              >
                <q-tooltip>Mostra a tutto schermo per far inquadrare</q-tooltip>
              </q-btn>

              <!-- Download Button -->
              <q-btn
                dense
                flat
                round
                size="sm"
                color="grey-8"
                icon="download"
                @click="downloadQr(qr)"
              >
                <q-tooltip>Scarica Immagine PNG</q-tooltip>
              </q-btn>

              <!-- Print Button -->
              <q-btn
                dense
                flat
                round
                size="sm"
                color="grey-8"
                icon="print"
                @click="printQr(qr)"
              >
                <q-tooltip>Stampa QR Code</q-tooltip>
              </q-btn>

              <!-- Copy Link Button -->
              <q-btn
                dense
                flat
                round
                size="sm"
                color="grey-8"
                icon="link"
                @click="copyQrLink(qr)"
              >
                <q-tooltip>Copia Link URL</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card>
      </div>
    </div>

    <!-- Scan & Zoom Dialog -->
    <q-dialog v-model="showZoomDialog" transition-show="scale" transition-hide="scale">
      <q-card v-if="activeQr" class="q-pa-lg text-center" style="max-width: 440px; width: 90vw; border-radius: 16px">
        <!-- Close Button -->
        <div class="row justify-between items-center q-mb-sm">
          <div class="text-h6 text-primary text-weight-bold font-serif">{{ activeQr.name }}</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </div>

        <!-- High-Res Scan Target -->
        <div class="scan-frame q-pa-md bg-white rounded-borders shadow-2 inline-block q-my-md">
          <q-img
            :src="activeQr.url"
            fit="contain"
            style="width: 280px; height: 280px"
          />
        </div>

        <div class="text-caption text-grey-8 q-mb-lg">
          <q-icon name="smartphone" size="18px" color="primary" class="q-mr-xs" />
          Fai inquadrare con la fotocamera dello smartphone per aprire istantaneamente.
        </div>

        <!-- Actions in Dialog -->
        <div class="row justify-center q-gutter-sm">
          <q-btn
            unelevated
            color="primary"
            icon="print"
            label="Stampa"
            no-caps
            class="q-px-md"
            @click="printQr(activeQr)"
          />
          <q-btn
            outline
            color="primary"
            icon="download"
            label="Scarica PNG"
            no-caps
            class="q-px-md"
            @click="downloadQr(activeQr)"
          />
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped lang="scss">
.qr-quick-card {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);

  .qr-img-wrapper {
    position: relative;
    transition: background-color 0.2s ease;
    &:hover {
      background-color: #faf8f6 !important;
    }
  }

  .scan-pill {
    opacity: 0.92;
    transition: transform 0.2s ease;
  }

  &:hover .scan-pill {
    transform: scale(1.05);
  }
}

.hover-elevation:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(52, 20, 20, 0.12) !important;
}

.border-top {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.scan-frame {
  border: 3px solid var(--q-primary, #341414);
}
</style>
