<script setup lang="ts">
/**
 * @file BrandingSettingsTab.vue
 * @description Tab per la gestione della palette colori, branding, tipografia ed eleganza visiva della vetrina.
 * Composto modularmente con FontSettingsSection in conformità a §0.2 e §0.3.
 * @author Vasile Chifeac (AI Agent)
 */

import { useQuasar } from 'quasar';
import { useSettingsStore } from 'stores/settings';
import FontSettingsSection from 'components/settings/FontSettingsSection.vue';

const store = useSettingsStore();
const $q = useQuasar();

const palettes = [
  { name: 'Classic Blue', primary: '#1976D2', secondary: '#26A69A' },
  { name: 'Luxury Gold', primary: '#101010', secondary: '#D4AF37' },
  { name: 'Nature', primary: '#2E7D32', secondary: '#81C784' },
  { name: 'Sunset', primary: '#E65100', secondary: '#FFB74D' },
  { name: 'Berry', primary: '#880E4F', secondary: '#EC407A' },
  { name: 'Ocean', primary: '#01579B', secondary: '#4FC3F7' },
];

const applyPalette = (p: { name: string; primary: string; secondary: string }) => {
  store.profile.primaryColor = p.primary;
  store.profile.secondaryColor = p.secondary;
  store.applyTheme(store.profile);
  $q.notify({
    message: `Palette "${p.name}" applicata!`,
    color: 'primary',
    timeout: 1000,
    icon: 'palette',
  });
};
</script>

<template>
  <div class="q-gutter-y-lg">
    <!-- Palettes -->
    <div>
      <div class="text-subtitle1 text-weight-bold q-mb-sm">Palette Pronte Consigliate</div>
      <div class="row q-col-gutter-sm">
        <div v-for="p in palettes" :key="p.name" class="col-6 col-sm-4 col-md-2">
          <q-card
            flat
            bordered
            class="cursor-pointer text-center q-pa-sm hover-scale transition-easy"
            @click="applyPalette(p)"
          >
            <div class="row q-gutter-xs justify-center q-mb-xs">
              <div :style="{ backgroundColor: p.primary, width: '20px', height: '20px', borderRadius: '50%' }" />
              <div :style="{ backgroundColor: p.secondary, width: '20px', height: '20px', borderRadius: '50%' }" />
            </div>
            <div class="text-caption text-weight-medium">{{ p.name }}</div>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Custom Colors -->
    <div class="text-subtitle1 text-weight-bold q-mt-md">Colori Personalizzati</div>
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-6">
        <q-input
          :model-value="store.profile.primaryColor"
          label="Colore Primario"
          outlined
          @update:model-value="
            store.profile.primaryColor = String($event);
            store.applyTheme(store.profile);
          "
        >
          <template #append>
            <q-icon name="colorize" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-color
                  :model-value="store.profile.primaryColor"
                  @update:model-value="
                    store.profile.primaryColor = String($event);
                    store.applyTheme(store.profile);
                  "
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div class="col-12 col-md-6">
        <q-input
          :model-value="store.profile.secondaryColor"
          label="Colore Secondario / Accento"
          outlined
          @update:model-value="
            store.profile.secondaryColor = String($event);
            store.applyTheme(store.profile);
          "
        >
          <template #append>
            <q-icon name="colorize" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-color
                  :model-value="store.profile.secondaryColor"
                  @update:model-value="
                    store.profile.secondaryColor = String($event);
                    store.applyTheme(store.profile);
                  "
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>

    <q-separator class="q-my-md" />

    <!-- Tipografia & Font Selection Sub-Component -->
    <FontSettingsSection />

    <q-separator class="q-my-md" />

    <!-- Live Preview Box -->
    <div class="q-mt-md q-pa-lg rounded-borders border bg-white shadow-1">
      <div class="text-caption text-grey-7 text-uppercase text-weight-bold q-mb-sm">
        Anteprima Contrasto Brand & Tipografia:
      </div>

      <!-- Live Title Sample -->
      <div
        class="text-h4 text-weight-bold q-mb-xs transition-easy"
        :style="{
          color: store.profile.primaryColor,
          fontFamily: `&quot;${store.profile.titleFont || 'Playfair Display'}&quot;, serif`,
        }"
      >
        {{ store.profile.name || 'Maria Chifeac' }} — Glow and Care Space
      </div>

      <!-- Live Body Sample -->
      <p
        class="text-body1 text-grey-8 q-mb-md transition-easy"
        :style="{
          fontFamily: `&quot;${store.profile.bodyFont || 'Figtree'}&quot;, sans-serif`,
        }"
      >
        Credo che la bellezza autentica nasca dalla cura quotidiana, dalla scelta di formule pure e da una routine pensata su misura per te.
      </p>

      <div class="row items-center q-gutter-md">
        <q-btn
          unelevated
          label="Pulsante Primario"
          :style="{
            backgroundColor: store.profile.primaryColor,
            color: '#ffffff',
            fontFamily: `&quot;${store.profile.bodyFont || 'Figtree'}&quot;, sans-serif`,
          }"
        />
        <q-btn
          outline
          label="Pulsante Accento"
          :style="{
            color: store.profile.secondaryColor,
            borderColor: store.profile.secondaryColor,
            fontFamily: `&quot;${store.profile.bodyFont || 'Figtree'}&quot;, sans-serif`,
          }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.hover-scale:hover {
  transform: translateY(-2px);
  border-color: var(--q-primary, #341414);
}
.transition-easy {
  transition: all 0.2s ease;
}
</style>
