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
import { useProductInteractions } from 'src/composables/useProductInteractions';
import { useQuasar } from 'quasar';
import type { Product } from 'src/types/product';
import ProductDetailDialog from './ProductDetailDialog.vue';
import ProductCard from './ProductCard.vue';

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
const { toggleLike, isLiked, toggleSave, isSaved, likedProducts, savedProducts } =
  useProductInteractions();

const isPreview = computed(() => route.query.preview_mode === 'true');
const activeFilter = ref<'all' | 'saved' | 'liked'>('all');

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
  if (activeFilter.value === 'saved') {
    list = list.filter((p) => isSaved(p.id));
  } else if (activeFilter.value === 'liked') {
    list = list.filter((p) => isLiked(p.id));
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

const handleToggleLike = async (prod: Product) => {
  const isNowLiked = toggleLike(prod.id);
  try {
    await store.toggleProductLike(prod.id, isNowLiked);
  } catch {
    // Fallback in local storage
  }
};

const handleToggleSave = async (prod: Product) => {
  const isNowSaved = toggleSave(prod.id);
  try {
    await store.toggleProductSave(prod.id, isNowSaved);
  } catch {
    // Fallback in local storage
  }
};

const handleDuplicateProduct = async (product: Product) => {
  try {
    const clone: Partial<Product> = { ...product };
    delete clone.id;
    await store.addProduct({
      ...clone,
      name: `${product.name} (Copia)`,
      order: store.products.length,
      likesCount: 0,
      savesCount: 0,
    });
    $q.notify({
      type: 'positive',
      message: `Prodotto "${product.name}" duplicato con successo!`,
      icon: 'content_copy',
      timeout: 1500,
    });
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Errore durante la duplicazione del prodotto',
    });
  }
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

    <!-- Filter Pills (All / Saved / Liked) -->
    <div class="row justify-center items-center q-gutter-xs q-mb-md">
      <q-btn
        unelevated
        rounded
        no-caps
        size="sm"
        :color="activeFilter === 'all' ? 'primary' : 'grey-2'"
        :text-color="activeFilter === 'all' ? 'white' : 'grey-9'"
        class="text-weight-bold q-px-md"
        @click="activeFilter = 'all'"
      >
        Tutti i Prodotti ({{ store.products.length }})
      </q-btn>
      <q-btn
        unelevated
        rounded
        no-caps
        size="sm"
        :color="activeFilter === 'saved' ? 'primary' : 'grey-2'"
        :text-color="activeFilter === 'saved' ? 'white' : 'grey-9'"
        icon="bookmark"
        class="text-weight-bold q-px-md"
        @click="activeFilter = 'saved'"
      >
        I Miei Salvati
        <q-badge
          v-if="savedProducts.length > 0"
          :color="activeFilter === 'saved' ? 'white' : 'primary'"
          :text-color="activeFilter === 'saved' ? 'primary' : 'white'"
          rounded
          class="q-ml-xs text-weight-bold"
        >
          {{ savedProducts.length }}
        </q-badge>
      </q-btn>
      <q-btn
        unelevated
        rounded
        no-caps
        size="sm"
        :color="activeFilter === 'liked' ? 'primary' : 'grey-2'"
        :text-color="activeFilter === 'liked' ? 'white' : 'grey-9'"
        icon="favorite"
        class="text-weight-bold q-px-md"
        @click="activeFilter = 'liked'"
      >
        I Più Amati
        <q-badge
          v-if="likedProducts.length > 0"
          :color="activeFilter === 'liked' ? 'white' : 'red'"
          :text-color="activeFilter === 'liked' ? 'red' : 'white'"
          rounded
          class="q-ml-xs text-weight-bold"
        >
          {{ likedProducts.length }}
        </q-badge>
      </q-btn>
    </div>

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

      <!-- Empty Filter State -->
      <div v-else-if="displayProducts.length === 0" class="col-12 text-center q-py-xl">
        <q-icon
          :name="activeFilter === 'saved' ? 'bookmark_border' : 'favorite_border'"
          size="48px"
          color="grey-5"
          class="q-mb-sm"
        />
        <div class="text-h6 text-grey-7">Nessun prodotto trovato in questa vista</div>
        <div class="text-caption text-grey-6 q-mb-md">
          {{ activeFilter === 'saved' ? 'Non hai ancora salvato nessun prodotto con il segnalibro 🔖' : 'Non hai ancora aggiunto prodotti ai tuoi preferiti ❤️' }}
        </div>
        <q-btn
          unelevated
          rounded
          color="primary"
          label="Mostra Tutti i Prodotti"
          size="sm"
          @click="activeFilter = 'all'"
        />
      </div>

      <!-- Actual Product Cards (Modular ProductCard Component) -->
      <template v-else>
        <ProductCard
          v-for="(product, index) in displayProducts"
          :key="product.id"
          :product="product"
          :index="index"
          :total-products="displayProducts.length"
          :is-preview="isPreview"
          :is-liked="isLiked(product.id)"
          :is-saved="isSaved(product.id)"
          :is-dragging="draggedIndex === index"
          :is-drag-over="dragOverIndex === index"
          @open-detail="openDetailDialog"
          @edit-product="emit('edit-product', $event)"
          @duplicate-product="handleDuplicateProduct"
          @toggle-like="handleToggleLike"
          @toggle-save="handleToggleSave"
          @move-prev="moveProduct($event, 'prev')"
          @move-next="moveProduct($event, 'next')"
          @drag-start="handleDragStart"
          @drag-over="handleDragOver"
          @drop="handleDrop"
          @drag-end="handleDragEnd"
        />
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
.font-serif {
  font-family: 'Playfair Display', serif;
}
</style>
