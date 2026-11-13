<script setup lang="ts">
/**
 * @file BrandingSettingsTab.vue
 * @description Tab per la gestione della palette colori, branding ed eleganza visiva della vetrina.
 * @author Vasile Chifeac (AI Agent)
 */

import { useQuasar } from 'quasar';
import { useSettingsStore } from 'stores/settings';

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
          @update:model-value="store.profile.primaryColor = String($event)"
        >
          <template #append>
            <q-icon name="colorize" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-color
                  :model-value="store.profile.primaryColor"
                  @update:model-value="store.profile.primaryColor = String($event)"
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
          @update:model-value="store.profile.secondaryColor = String($event)"
        >
          <template #append>
            <q-icon name="colorize" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-color
                  :model-value="store.profile.secondaryColor"
                  @update:model-value="store.profile.secondaryColor = String($event)"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>

    <!-- Live Preview Box -->
    <div class="q-mt-md q-pa-lg rounded-borders border" :style="{ backgroundColor: '#fcfcfc' }">
      <div class="text-caption text-grey-7 q-mb-sm">Anteprima Contrasto Brand:</div>
      <div class="row items-center q-gutter-md">
        <q-btn
          unelevated
          label="Pulsante Primario"
          :style="{ backgroundColor: store.profile.primaryColor, color: '#ffffff' }"
        />
        <q-btn
          outline
          label="Pulsante Accento"
          :style="{ color: store.profile.secondaryColor, borderColor: store.profile.secondaryColor }"
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
