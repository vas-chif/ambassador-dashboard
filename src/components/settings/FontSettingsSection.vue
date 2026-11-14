<script setup lang="ts">
/**
 * @file FontSettingsSection.vue
 * @description Modulo per la selezione dei font del brand e del profilo (Titoli e Corpo testo).
 * Conforme alle regole di modularità e limiti dimensionali (§0.2 e §0.3 AGENTS.md).
 * @author Vasile Chifeac (AI Agent)
 */

import { computed } from 'vue';
import { useQuasar } from 'quasar';
import { useSettingsStore } from 'stores/settings';

const store = useSettingsStore();
const $q = useQuasar();

interface FontOption {
  id: string;
  name: string;
  category: 'serif' | 'sans';
  categoryLabel: string;
  tagline: string;
  sampleText: string;
}

const titleFonts: FontOption[] = [
  {
    id: 'Playfair Display',
    name: 'Playfair Display',
    category: 'serif',
    categoryLabel: 'Serif Elegante',
    tagline: 'Editoriale, alta moda e fascino senza tempo',
    sampleText: 'Bellezza & Cura',
  },
  {
    id: 'Cormorant Garamond',
    name: 'Cormorant Garamond',
    category: 'serif',
    categoryLabel: 'Serif Lusso',
    tagline: 'Raffinato, alta cosmetica e spa esclusiva',
    sampleText: 'Armonia & Benessere',
  },
  {
    id: 'Cinzel',
    name: 'Cinzel',
    category: 'serif',
    categoryLabel: 'Serif Classico',
    tagline: 'Monumentale, nobiliare, profumeria di nicchia',
    sampleText: 'PURE LUXURY',
  },
  {
    id: 'Plus Jakarta Sans',
    name: 'Plus Jakarta Sans',
    category: 'sans',
    categoryLabel: 'Sans Moderno',
    tagline: 'Contemporaneo, fresco, beauty tech',
    sampleText: 'Skincare Routine',
  },
  {
    id: 'Montserrat',
    name: 'Montserrat',
    category: 'sans',
    categoryLabel: 'Sans Geometrico',
    tagline: 'Audace, energico, impatto visivo netto',
    sampleText: 'GLOW & CARE',
  },
  {
    id: 'Figtree',
    name: 'Figtree',
    category: 'sans',
    categoryLabel: 'Sans Pulito',
    tagline: 'Minimalista, amichevole e rilassante',
    sampleText: 'Naturale & Semplice',
  },
];

const bodyFonts: FontOption[] = [
  {
    id: 'Figtree',
    name: 'Figtree',
    category: 'sans',
    categoryLabel: 'Consigliato',
    tagline: 'Massima leggibilità per schede e descrizioni',
    sampleText: 'Formule dermatologiche clinicamente testate.',
  },
  {
    id: 'Plus Jakarta Sans',
    name: 'Plus Jakarta Sans',
    category: 'sans',
    categoryLabel: 'Moderno',
    tagline: 'Pulizia geometrica perfetta su mobile',
    sampleText: 'Formule dermatologiche clinicamente testate.',
  },
  {
    id: 'Inter',
    name: 'Inter',
    category: 'sans',
    categoryLabel: 'Neutro',
    tagline: 'Chiarezza tipografica universale',
    sampleText: 'Formule dermatologiche clinicamente testate.',
  },
  {
    id: 'Playfair Display',
    name: 'Playfair Display',
    category: 'serif',
    categoryLabel: 'Total Luxury',
    tagline: 'Per uno stile classico continuo e letterario',
    sampleText: 'Formule dermatologiche clinicamente testate.',
  },
];

const currentTitleFont = computed(() => store.profile.titleFont || 'Playfair Display');
const currentBodyFont = computed(() => store.profile.bodyFont || 'Figtree');

const selectTitleFont = (font: FontOption) => {
  store.profile.titleFont = font.id;
  store.applyTheme(store.profile);
  $q.notify({
    message: `Font titoli impostato su "${font.name}"`,
    color: 'primary',
    icon: 'font_download',
    timeout: 1000,
  });
};

const selectBodyFont = (font: FontOption) => {
  store.profile.bodyFont = font.id;
  store.applyTheme(store.profile);
  $q.notify({
    message: `Font testo impostato su "${font.name}"`,
    color: 'secondary',
    icon: 'text_fields',
    timeout: 1000,
  });
};
</script>

<template>
  <div class="q-gutter-y-lg">
    <!-- Sezione 1: Font dei Titoli -->
    <div>
      <div class="row items-center justify-between q-mb-xs">
        <div>
          <div class="text-subtitle1 text-weight-bold">Font dei Titoli (Heading & Brand Name)</div>
          <div class="text-caption text-grey-7">
            Determina la personalità del nome salone, dei titoli delle sezioni e degli articoli.
          </div>
        </div>
        <q-chip outline color="primary" class="text-weight-bold" icon="style">
          Attivo: {{ currentTitleFont }}
        </q-chip>
      </div>

      <div class="row q-col-gutter-sm q-mt-xs">
        <div
          v-for="font in titleFonts"
          :key="font.id"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-card
            flat
            bordered
            class="font-card cursor-pointer q-pa-md transition-all relative-position"
            :class="{
              'font-card--active': currentTitleFont === font.id,
              'bg-grey-1': currentTitleFont !== font.id,
            }"
            @click="selectTitleFont(font)"
          >
            <!-- Checkmark se selezionato -->
            <q-badge
              v-if="currentTitleFont === font.id"
              floating
              color="primary"
              rounded
            >
              <q-icon name="check" size="12px" />
            </q-badge>

            <div class="row items-center justify-between q-mb-xs">
              <span class="text-subtitle2 text-weight-bold">{{ font.name }}</span>
              <q-badge
                outline
                :color="font.category === 'serif' ? 'amber-9' : 'teal-8'"
                class="text-caption"
              >
                {{ font.categoryLabel }}
              </q-badge>
            </div>

            <!-- Anteprima visiva con il font reale -->
            <div
              class="font-sample q-my-sm text-primary"
              :style="{ fontFamily: `&quot;${font.id}&quot;, ${font.category}` }"
            >
              {{ font.sampleText }}
            </div>

            <div class="text-caption text-grey-6 text-italic">
              {{ font.tagline }}
            </div>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Sezione 2: Font per il Corpo del Testo -->
    <div>
      <div class="row items-center justify-between q-mb-xs">
        <div>
          <div class="text-subtitle1 text-weight-bold">Font Corpo del Testo (Descrizioni & Dettagli)</div>
          <div class="text-caption text-grey-7">
            Utilizzato per bio, descrizioni prodotti, schede articoli e testi informativi.
          </div>
        </div>
        <q-chip outline color="secondary" class="text-weight-bold" icon="text_format">
          Attivo: {{ currentBodyFont }}
        </q-chip>
      </div>

      <div class="row q-col-gutter-sm q-mt-xs">
        <div
          v-for="font in bodyFonts"
          :key="font.id"
          class="col-12 col-sm-6 col-md-3"
        >
          <q-card
            flat
            bordered
            class="font-card cursor-pointer q-pa-md transition-all relative-position"
            :class="{
              'font-card--active-secondary': currentBodyFont === font.id,
              'bg-grey-1': currentBodyFont !== font.id,
            }"
            @click="selectBodyFont(font)"
          >
            <q-badge
              v-if="currentBodyFont === font.id"
              floating
              color="secondary"
              rounded
            >
              <q-icon name="check" size="12px" />
            </q-badge>

            <div class="row items-center justify-between q-mb-xs">
              <span class="text-subtitle2 text-weight-bold">{{ font.name }}</span>
              <q-badge outline color="grey-7" class="text-caption">
                {{ font.categoryLabel }}
              </q-badge>
            </div>

            <div
              class="font-body-sample q-my-xs text-grey-9"
              :style="{ fontFamily: `&quot;${font.id}&quot;, ${font.category}` }"
            >
              {{ font.sampleText }}
            </div>

            <div class="text-caption text-grey-6 text-italic">
              {{ font.tagline }}
            </div>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.font-card {
  border-radius: 10px;
  border: 1px solid #e0e0e0;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--q-primary, #341414);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }
}

.font-card--active {
  border: 2px solid var(--q-primary, #341414) !important;
  background-color: #ffffff !important;
  box-shadow: 0 4px 14px rgba(52, 20, 20, 0.12);
}

.font-card--active-secondary {
  border: 2px solid var(--q-secondary, #855457) !important;
  background-color: #ffffff !important;
  box-shadow: 0 4px 14px rgba(133, 84, 87, 0.12);
}

.font-sample {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
}

.font-body-sample {
  font-size: 13px;
  line-height: 1.4;
}

.transition-all {
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}
</style>
