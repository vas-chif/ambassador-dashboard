<script setup lang="ts">
/**
 * @file SectionToolbar.vue
 * @description Toolbar fluttuante in-place per la gestione immediata delle sezioni nella Live Preview.
 * @author Vasile Chifeac (AI Agent)
 */

import { computed } from 'vue';

const props = defineProps<{
  section: string;
  index: number;
  totalSections: number;
  isHidden: boolean;
  isCustom: boolean;
  sectionType: 'profile' | 'articles' | 'actionBanner' | 'products';
  label: string;
  icon: string;
}>();

const emit = defineEmits<{
  (e: 'toggle-visibility', section: string): void;
  (e: 'move-up', index: number): void;
  (e: 'move-down', index: number): void;
  (e: 'duplicate', section: string, index: number): void;
  (e: 'quick-add', type: 'articles' | 'products'): void;
  (e: 'open-settings', section: string): void;
  (e: 'remove', section: string, index: number): void;
}>();

const canQuickAdd = computed(() => props.sectionType === 'articles' || props.sectionType === 'products');
const quickAddLabel = computed(() => props.sectionType === 'articles' ? '+ Aggiungi Articolo' : '+ Aggiungi Prodotto');
</script>

<template>
  <div class="visual-builder-toolbar row items-center no-wrap shadow-4">
    <!-- Section Badge -->
    <div class="section-tag row items-center q-px-sm text-white">
      <q-icon :name="icon" size="14px" class="q-mr-xs" />
      <span class="text-caption text-weight-bold">{{ label }}</span>
      <span v-if="isHidden" class="q-ml-xs text-negative text-weight-bold">
        • Nascosto
      </span>
    </div>

    <q-separator vertical dark class="q-mx-xs" style="height: 18px" />

    <!-- 1. Eye Button (Visibility) -->
    <q-btn
      dense
      flat
      round
      size="sm"
      :icon="isHidden ? 'visibility_off' : 'visibility'"
      :color="isHidden ? 'negative' : 'white'"
      @click="emit('toggle-visibility', section)"
    >
      <q-tooltip>{{ isHidden ? 'Mostra sezione ai clienti' : 'Nascondi sezione ai clienti' }}</q-tooltip>
    </q-btn>

    <!-- 2. Move Up Button -->
    <q-btn
      dense
      flat
      round
      size="sm"
      icon="arrow_upward"
      color="white"
      :disable="index === 0"
      @click="emit('move-up', index)"
    >
      <q-tooltip>Sposta Sezione Su</q-tooltip>
    </q-btn>

    <!-- 3. Move Down Button -->
    <q-btn
      dense
      flat
      round
      size="sm"
      icon="arrow_downward"
      color="white"
      :disable="index === totalSections - 1"
      @click="emit('move-down', index)"
    >
      <q-tooltip>Sposta Sezione Giù</q-tooltip>
    </q-btn>

    <!-- 4. Duplicate Button -->
    <q-btn
      dense
      flat
      round
      size="sm"
      icon="content_copy"
      color="white"
      @click="emit('duplicate', section, index)"
    >
      <q-tooltip>Duplica Sezione</q-tooltip>
    </q-btn>

    <!-- 5. Quick Add Item (+ Articolo / + Prodotto) -->
    <q-btn
      v-if="canQuickAdd"
      dense
      flat
      round
      size="sm"
      icon="add_circle"
      color="positive"
      @click="emit('quick-add', sectionType === 'articles' ? 'articles' : 'products')"
    >
      <q-tooltip>{{ quickAddLabel }}</q-tooltip>
    </q-btn>

    <!-- 6. Settings Gear Button -->
    <q-btn
      dense
      flat
      round
      size="sm"
      icon="tune"
      color="white"
      @click="emit('open-settings', section)"
    >
      <q-tooltip>Impostazioni & Personalizzazione Blocco</q-tooltip>
    </q-btn>

    <!-- 7. Delete Button (Custom / Duplicated Sections only) -->
    <q-btn
      v-if="isCustom"
      dense
      flat
      round
      size="sm"
      icon="delete"
      color="negative"
      @click="emit('remove', section, index)"
    >
      <q-tooltip>Elimina Sezione Aggiunta</q-tooltip>
    </q-btn>
  </div>
</template>

<style scoped lang="scss">
.visual-builder-toolbar {
  position: absolute;
  top: 10px;
  right: 16px;
  z-index: 80;
  background: rgba(17, 24, 39, 0.92);
  backdrop-filter: blur(8px);
  border-radius: 9999px;
  padding: 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  opacity: 0.88;
  transform: translateY(0);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  .section-tag {
    font-size: 0.78rem;
    letter-spacing: 0.02em;
  }
}

@media (max-width: 600px) {
  .visual-builder-toolbar {
    top: 6px;
    right: 8px;
    padding: 2px 6px;
  }
}
</style>

