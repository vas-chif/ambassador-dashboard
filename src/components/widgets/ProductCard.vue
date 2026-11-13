<script setup lang="ts">
/**
 * @file ProductCard.vue
 * @description Modulo autonomo per la singola card prodotto con supporto al Visual Builder (spostamento rapido, drag & drop, modifica in-place) e interazioni utente (like, save, rating).
 * Rispetta le regole di modularità e limiti dimensionali (§0.2 / §0.3 AGENTS.md).
 * @author Vasile Chifeac (AI Agent)
 */

import { useQuasar } from 'quasar';
import type { Product } from 'src/types/product';

defineProps<{
  product: Product;
  index: number;
  totalProducts: number;
  isPreview: boolean;
  isLiked: boolean;
  isSaved: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
}>();

const emit = defineEmits<{
  (e: 'open-detail', product: Product): void;
  (e: 'edit-product', product: Product): void;
  (e: 'duplicate-product', product: Product): void;
  (e: 'toggle-like', product: Product): void;
  (e: 'toggle-save', product: Product): void;
  (e: 'move-prev', index: number): void;
  (e: 'move-next', index: number): void;
  (e: 'drag-start', index: number, event: DragEvent): void;
  (e: 'drag-over', index: number): void;
  (e: 'drop', index: number): void;
  (e: 'drag-end'): void;
}>();

const $q = useQuasar();
</script>

<template>
  <div
    class="col-12 col-sm-6 col-md-4"
    :class="{
      'product-dragging': isDragging,
      'product-drag-over': isDragOver,
    }"
    :draggable="isPreview"
    @dragstart="emit('drag-start', index, $event)"
    @dragover.prevent="emit('drag-over', index)"
    @drop.prevent="emit('drop', index)"
    @dragend="emit('drag-end')"
  >
    <q-card
      class="product-card shadow-3 relative-position"
      :bordered="$q.screen.gt.xs"
      :square="$q.screen.xs"
    >
      <!-- In-Place Visual Builder Action Pill on Card (Preview Mode Only) -->
      <div
        v-if="isPreview"
        class="product-action-pill absolute-top-right q-ma-sm"
        style="z-index: 25"
        @click.stop
      >
        <div class="row items-center no-wrap bg-grey-10 text-white rounded-borders shadow-4 q-px-xs q-py-none">
          <!-- Drag Handle -->
          <q-btn
            flat
            dense
            round
            size="xs"
            icon="drag_indicator"
            color="grey-4"
            class="cursor-grab q-mr-xs"
          >
            <q-tooltip>Trascina per ordinare</q-tooltip>
          </q-btn>

          <!-- Move Left / Prev -->
          <q-btn
            flat
            dense
            round
            size="xs"
            icon="chevron_left"
            color="white"
            :disable="index === 0"
            @click.stop="emit('move-prev', index)"
          >
            <q-tooltip>Sposta prima</q-tooltip>
          </q-btn>

          <!-- Move Right / Next -->
          <q-btn
            flat
            dense
            round
            size="xs"
            icon="chevron_right"
            color="white"
            :disable="index === totalProducts - 1"
            @click.stop="emit('move-next', index)"
          >
            <q-tooltip>Sposta dopo</q-tooltip>
          </q-btn>

          <q-separator vertical dark class="q-mx-xs" style="height: 14px" />

          <!-- Duplicate Product Button -->
          <q-btn
            flat
            dense
            round
            size="xs"
            icon="content_copy"
            color="secondary"
            @click.stop="emit('duplicate-product', product)"
          >
            <q-tooltip>Duplica questo prodotto</q-tooltip>
          </q-btn>

          <!-- Quick Edit Product Button -->
          <q-btn
            flat
            dense
            round
            size="xs"
            icon="edit"
            color="primary"
            class="bg-white text-primary text-weight-bold"
            @click.stop="emit('edit-product', product)"
          >
            <q-tooltip>Modifica questo prodotto</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Product Image -->
      <q-img
        :src="product.images?.[0] || 'https://placehold.co/300x300'"
        :ratio="1"
        fit="contain"
        class="bg-white cursor-pointer"
        @click="emit('open-detail', product)"
      />

      <!-- Card Content -->
      <q-card-section class="flex-grow-1 cursor-pointer" @click="emit('open-detail', product)">
        <div class="text-overline text-orange-9" style="font-size: 16px; line-height: 1.2">
          {{ product.category }}
        </div>
        <div
          class="text-h5 q-mt-xs q-mb-xs text-primary"
          style="font-size: 26px; font-weight: bold; line-height: 1.2"
        >
          {{ product.name }}
        </div>

        <!-- Public Rating Preview (Amazon Style) -->
        <div
          v-if="product.ratingCount && product.ratingCount > 0"
          class="row items-center q-mb-sm"
        >
          <q-rating
            :model-value="product.ratingAverage || 0"
            max="5"
            size="1.2em"
            color="orange"
            readonly
          />
          <span class="text-grey-7 q-ml-sm text-caption">
            {{ product.ratingAverage }} ({{ product.ratingCount }})
          </span>
        </div>

        <!-- Short Description (HTML) -->
        <div
          class="text-grey-6 ellipsis-3-lines"
          style="font-size: 18px"
          v-html="product.description"
        ></div>
      </q-card-section>

      <div class="q-mt-auto">
        <q-separator />

        <div class="row items-center justify-between q-px-sm q-py-xs bg-grey-1">
          <!-- Quick Like & Save -->
          <div class="row items-center q-gutter-x-none">
            <q-btn
              dense
              flat
              round
              size="sm"
              :icon="isLiked ? 'favorite' : 'favorite_border'"
              :color="isLiked ? 'red' : 'grey-6'"
              @click.stop="emit('toggle-like', product)"
            >
              <q-tooltip>{{ isLiked ? 'Rimuovi Mi Piace' : 'Mi Piace' }}</q-tooltip>
            </q-btn>
            <span
              v-if="product.likesCount && product.likesCount > 0"
              class="text-caption text-grey-7 q-mr-xs text-weight-medium"
              style="font-size: 11px"
            >
              {{ product.likesCount }}
            </span>

            <q-btn
              dense
              flat
              round
              size="sm"
              :icon="isSaved ? 'bookmark' : 'bookmark_border'"
              :color="isSaved ? 'primary' : 'grey-6'"
              @click.stop="emit('toggle-save', product)"
            >
              <q-tooltip>{{ isSaved ? 'Rimuovi dai Salvati' : 'Salva nei Preferiti' }}</q-tooltip>
            </q-btn>
            <span
              v-if="product.savesCount && product.savesCount > 0"
              class="text-caption text-grey-7 text-weight-medium"
              style="font-size: 11px"
            >
              {{ product.savesCount }}
            </span>
          </div>

          <!-- Open Detail Link -->
          <q-btn
            flat
            dense
            no-caps
            color="primary"
            icon-right="chevron_right"
            label="Dettagli"
            class="text-weight-bold"
            size="sm"
            @click="emit('open-detail', product)"
          />
        </div>
      </div>
    </q-card>
  </div>
</template>

<style scoped lang="scss">
.product-card {
  height: 100% !important;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.product-action-pill {
  transition: opacity 0.2s ease, transform 0.2s ease;
  &:hover {
    transform: scale(1.04);
  }
}

.product-dragging {
  opacity: 0.45;
  border: 2px dashed #9e9e9e;
  transform: scale(0.98);
}

.product-drag-over {
  border: 2px solid var(--q-primary, #341414);
  box-shadow: 0 0 16px rgba(52, 20, 20, 0.3) !important;
  transform: scale(1.02);
}

.ellipsis-3-lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

:deep(hr) {
  border: 0;
  border-top: 1px solid #ccc;
  margin: 1rem 0;
}
</style>

