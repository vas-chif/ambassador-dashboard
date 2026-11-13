<script setup lang="ts">
/**
 * @file AdminPreview.vue
 * @description True-Viewport Visual Builder Engine & Live Device Simulator.
 * @author Vasile Chifeac (AI Agent)
 */

import { ref, computed } from 'vue';

// Device Preview Mode: 'mobile' | 'tablet' | 'desktop'
const deviceMode = ref<'mobile' | 'tablet' | 'desktop'>('desktop');
const iframeRef = ref<HTMLIFrameElement | null>(null);
const isReloading = ref(false);

// Calculate correct URL for the iframe regardless of hash or history mode
const previewUrl = computed(() => {
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  // If hash routing is active
  if (window.location.hash) {
    return `${origin}${pathname}#/?preview_mode=true`;
  }
  return `${origin}${pathname}?preview_mode=true`;
});

// Device frame container classes and inline dimensions
const containerStyle = computed(() => {
  if (deviceMode.value === 'mobile') {
    return {
      width: '393px',
      height: '840px',
      maxWidth: '100%',
    };
  }
  if (deviceMode.value === 'tablet') {
    return {
      width: '768px',
      height: '86vh',
      maxWidth: '100%',
    };
  }
  // Desktop
  return {
    width: '100%',
    height: '88vh',
  };
});

const reloadPreview = () => {
  isReloading.value = true;
  if (iframeRef.value) {
    iframeRef.value.src = previewUrl.value;
  }
  setTimeout(() => {
    isReloading.value = false;
  }, 600);
};

const openPublicSite = () => {
  window.open('/', '_blank');
};
</script>

<template>
  <q-page class="preview-page bg-grey-2 column">
    <!-- 1. Floating Top HUD Bar -->
    <div class="preview-hud-bar row items-center justify-between q-px-md q-py-sm bg-white shadow-1">
      <!-- Title & Live Badge -->
      <div class="row items-center q-gutter-sm">
        <q-avatar size="36px" color="primary" text-color="white" icon="visibility" />
        <div>
          <div class="row items-center q-gutter-xs">
            <span class="text-subtitle1 text-weight-bold">Visual Builder & Anteprima Reale</span>
            <q-badge color="positive" text-color="white" label="Live Interattivo" class="q-ml-xs" />
          </div>
          <div class="text-caption text-grey-7">
            Passa il mouse sulle sezioni nell'anteprima per riordinare, mostrare/nascondere o duplicare
          </div>
        </div>
      </div>

      <!-- Device Switcher Pills -->
      <div class="device-switcher row items-center q-gutter-xs bg-grey-2 q-pa-xs rounded-borders">
        <q-btn
          dense
          flat
          round
          :color="deviceMode === 'mobile' ? 'primary' : 'grey-7'"
          :class="{ 'bg-white shadow-1': deviceMode === 'mobile' }"
          icon="smartphone"
          @click="deviceMode = 'mobile'"
        >
          <q-tooltip>Mobile Reale (393px - iPhone 16)</q-tooltip>
        </q-btn>
        <q-btn
          dense
          flat
          round
          :color="deviceMode === 'tablet' ? 'primary' : 'grey-7'"
          :class="{ 'bg-white shadow-1': deviceMode === 'tablet' }"
          icon="tablet"
          @click="deviceMode = 'tablet'"
        >
          <q-tooltip>Tablet (768px - iPad)</q-tooltip>
        </q-btn>
        <q-btn
          dense
          flat
          round
          :color="deviceMode === 'desktop' ? 'primary' : 'grey-7'"
          :class="{ 'bg-white shadow-1': deviceMode === 'desktop' }"
          icon="desktop_windows"
          @click="deviceMode = 'desktop'"
        >
          <q-tooltip>Desktop (100% Full Width)</q-tooltip>
        </q-btn>
      </div>

      <!-- Action Buttons -->
      <div class="row items-center q-gutter-sm">
        <q-btn
          flat
          round
          dense
          color="grey-8"
          icon="refresh"
          :loading="isReloading"
          @click="reloadPreview"
        >
          <q-tooltip>Ricarica Anteprima</q-tooltip>
        </q-btn>

        <q-btn
          outline
          color="primary"
          icon="open_in_new"
          label="Apri Vetrina Pubblica"
          no-caps
          @click="openPublicSite"
        />
      </div>
    </div>

    <!-- 2. True-Viewport Sandbox Canvas -->
    <div class="preview-canvas-workspace col flex flex-center q-pa-md">
      <!-- Device Outer Frame -->
      <div
        class="device-frame-container shadow-6 transition-smooth"
        :class="{
          'phone-frame': deviceMode === 'mobile',
          'tablet-frame': deviceMode === 'tablet',
          'desktop-frame': deviceMode === 'desktop',
        }"
        :style="containerStyle"
      >
        <!-- Phone Speaker & Camera Island Simulation -->
        <div v-if="deviceMode === 'mobile'" class="phone-dynamic-island">
          <div class="island-pill"></div>
        </div>

        <!-- The True-Viewport Iframe -->
        <iframe
          ref="iframeRef"
          :src="previewUrl"
          class="preview-iframe full-width full-height"
          frameborder="0"
          title="Beauty Ambassador Live Preview"
        ></iframe>
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.preview-page {
  min-height: calc(100vh - 50px);
}

.preview-hud-bar {
  border-bottom: 1px solid #e5e7eb;
  z-index: 10;
}

.preview-canvas-workspace {
  overflow: auto;
  position: relative;
  background-color: #e5e7eb;
}

.device-frame-container {
  background: white;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Smartphone Frame Styling (iPhone 16 Authentic Viewport) */
.phone-frame {
  border: 12px solid #111827;
  border-radius: 44px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);

  .phone-dynamic-island {
    background: #111827;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;

    .island-pill {
      width: 76px;
      height: 18px;
      background: #000;
      border-radius: 9999px;
    }
  }
}

/* Tablet Frame Styling */
.tablet-frame {
  border: 10px solid #1f2937;
  border-radius: 28px;
}

/* Desktop Frame Styling */
.desktop-frame {
  border: 1px solid #d1d5db;
  border-radius: 8px;
}

.preview-iframe {
  border: none;
  flex: 1;
  background: white;
}

.transition-smooth {
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
