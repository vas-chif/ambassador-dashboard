<script setup lang="ts">
/**
 * @file ProductGrid.vue
 * @description Product Grid Widget for public pages and Visual Builder with in-place edit & reorder.
 * Refactored to modular architecture (§0.2 / §0.3 AGENTS.md).
 * @author Vasile Chifeac (AI Agent)
 */

import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useProductsStore } from 'stores/products';
import { useQuasar } from 'quasar';
import type { Product } from 'src/types/product';
import ProductDetailDialog from './ProductDetailDialog.vue';

const props = defineProps<{
  title?: string;
  limit?: number;
  category?: string;
}>();

const emit = defineEmits<{
  (e: 'edit-product', product: Product): void;
}>();

const store = useProductsStore();
const route = useRoute();
const $q = useQuasar();

const isPreview = computed(() => route.query.preview_mode === 'true');

// Dialog State
const showDetailDialog = ref(false);
const selectedProduct = ref<Product | null>(null);

// Drag & Drop Reordering State
const draggedIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);

onMounted(() => {
  store.subscribeToProducts();
});

const displayProducts = computed(() => {
  let list = store.products;
  if (props.category) {
    list = list.filter((p) => p.category === props.category);
  }
  if (props.limit) {
    list = list.slice(0, props.limit);
  }
  return list;
});

const openDetailDialog = (product: Product) => {
  selectedProduct.value = product;
  showDetailDialog.value = true;
};

// Drag and drop reordering
const handleDragStart = (idx: number, event: DragEvent) => {
  draggedIndex.value = idx;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(idx));
  }
};

const handleDragOver = (idx: number) => {
  dragOverIndex.value = idx;
};

const handleDrop = async (targetIdx: number) => {
  if (draggedIndex.value === null || draggedIndex.value === targetIdx) {
    draggedIndex.value = null;
    dragOverIndex.value = null;
    return;
  }

  const list = [...displayProducts.value];
  const [removed] = list.splice(draggedIndex.value, 1);
  if (removed) {
    list.splice(targetIdx, 0, removed);
    await store.updateProductsOrder(list);
    $q.notify({
      type: 'positive',
      message: 'Ordine prodotti aggiornato!',
      icon: 'check',
      timeout: 1000,
    });
  }

  draggedIndex.value = null;
  dragOverIndex.value = null;
};

const handleDragEnd = () => {
  draggedIndex.value = null;
  dragOverIndex.value = null;
};

const moveProduct = async (idx: number, direction: 'prev' | 'next') => {
  const targetIdx = direction === 'prev' ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= displayProducts.value.length) return;

  const list = [...displayProducts.value];
  const current = list[idx];
  const target = list[targetIdx];
  if (current && target) {
    list[idx] = target;
    list[targetIdx] = current;
    await store.updateProductsOrder(list);
    $q.notify({
      type: 'positive',
      message: 'Posizione prodotto aggiornata',
      icon: 'swap_horiz',
      timeout: 900,
    });
  }
};
</script>

<template>
  <div :class="$q.screen.lt.sm ? 'q-pa-none q-mb-xl' : 'q-pa-md q-mb-lg'">
    <div v-if="title" class="text-h4 text-center q-mb-lg font-serif">{{ title }}</div>

    <div :class="['row', $q.screen.lt.sm ? 'q-col-gutter-y-md' : 'q-col-gutter-lg']">
      <!-- Skeleton Loading Cards -->
      <template v-if="store.loading && store.products.length === 0">
        <div v-for="i in 3" :key="`skeleton-${i}`" class="col-12 col-sm-6 col-md-4">
          <q-card class="product-card shadow-3">
            <q-skeleton height="200px" />
            <q-card-section class="flex-grow-1">
              <q-skeleton type="text" class="text-h5" />
              <q-skeleton type="text" width="60%" class="q-mt-sm" />
              <q-skeleton type="text" class="q-mt-md" />
              <q-skeleton type="text" width="80%" />
            </q-card-section>
            <div class="q-mt-auto q-pa-md">
              <q-skeleton type="QBtn" />
            </div>
          </q-card>
        </div>
      </template>

      <!-- Actual Product Cards -->
      <template v-else>
        <div
          v-for="(product, index) in displayProducts"
          :key="product.id"
          class="col-12 col-sm-6 col-md-4"
          :class="{
            'product-dragging': draggedIndex === index,
            'product-drag-over': dragOverIndex === index,
          }"
          :draggable="isPreview"
          @dragstart="handleDragStart(index, $event)"
          @dragover.prevent="handleDragOver(index)"
          @drop.prevent="handleDrop(index)"
          @dragend="handleDragEnd"
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
                  @click.stop="moveProduct(index, 'prev')"
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
                  :disable="index === displayProducts.length - 1"
                  @click.stop="moveProduct(index, 'next')"
                >
                  <q-tooltip>Sposta dopo</q-tooltip>
                </q-btn>

                <q-separator vertical dark class="q-mx-xs" style="height: 14px" />

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
              @click="openDetailDialog(product)"
            />

            <!-- Card Content -->
            <q-card-section class="flex-grow-1 cursor-pointer" @click="openDetailDialog(product)">
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

              <q-list>
                <q-item clickable @click="openDetailDialog(product)">
                  <q-item-section avatar>
                    <q-icon color="primary" name="info" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label style="font-size: 18px">Saperne di più</q-item-label>
                    <q-item-label caption style="font-size: 14px">Dettagli & Istruzioni</q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-icon name="chevron_right" color="grey" />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card>
        </div>
      </template>
    </div>

    <!-- Product Detail Modal Dialog Component -->
    <ProductDetailDialog
      v-model="showDetailDialog"
      :product="selectedProduct"
    />
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

.font-serif {
  font-family: 'Playfair Display', serif;
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
