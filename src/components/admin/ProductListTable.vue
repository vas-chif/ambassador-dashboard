<script setup lang="ts">
/**
 * @file ProductListTable.vue
 * @description Product List Table Component with Drag & Drop Reordering.
 * @author Vasile Chifeac (AI Agent)
 * @created 2026-02-06
 */

import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useProductsStore } from 'stores/products';
import draggable from 'vuedraggable';
import type { Product } from 'src/types/product';
import { useQuasar } from 'quasar';

const store = useProductsStore();
const $q = useQuasar();

onMounted(() => {
  store.subscribeToProducts();
});

onUnmounted(() => {
  store.unsubscribeFromProducts();
});

const emit = defineEmits(['edit', 'duplicate', 'delete']);

// Search & Filter State
const searchQuery = ref('');
const selectedCategory = ref<string>('all');

const availableCategories = computed(() => {
  const cats = store.products.map((p) => p.category).filter(Boolean);
  return ['all', ...Array.from(new Set(cats))];
});

const isFiltering = computed(() => !!searchQuery.value.trim() || selectedCategory.value !== 'all');

const filteredProducts = computed(() => {
  return store.products.filter((p) => {
    const q = searchQuery.value.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q));
    const matchesCategory =
      selectedCategory.value === 'all' || p.category === selectedCategory.value;
    return matchesSearch && matchesCategory;
  });
});

// Use a ref for draggable products to allow visual reordering
const draggableProducts = ref<Product[]>([]);

// Sync with filtered store products
watch(
  filteredProducts,
  (newProducts) => {
    draggableProducts.value = [...newProducts];
  },
  { immediate: true },
);

const handleReorder = async () => {
  // Update order based on array indices
  const updatePromises = draggableProducts.value.map(async (product, index) => {
    if (product.order !== index) {
      await store.updateProductOrder(product.id, index);
    }
  });

  try {
    await Promise.all(updatePromises);
    $q.notify({ type: 'positive', message: 'Product order updated', position: 'top' });
  } catch (error) {
    console.error('Error updating order:', error);
    $q.notify({ type: 'negative', message: 'Failed to update order', position: 'top' });
  }
};

const toggleVisibility = async (product: Product) => {
  const newActive = product.active === false;
  try {
    await store.updateProduct(product.id, { active: newActive });
    $q.notify({
      type: newActive ? 'positive' : 'warning',
      message: newActive
        ? `"${product.name}" ora visibile ai clienti`
        : `"${product.name}" nascosto dalla vetrina`,
      timeout: 1000,
    });
  } catch {
    $q.notify({ type: 'negative', message: 'Errore durante l\'aggiornamento dello stato' });
  }
};

const confirmDelete = (product: Product) => {
  $q.dialog({
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
    persistent: true,
    ok: {
      label: 'Delete',
      color: 'negative',
      flat: true,
    },
    cancel: {
      label: 'Cancel',
      color: 'primary',
      flat: true,
    },
  })
    .onOk(() => {
      emit('delete', product);
    })
    .onCancel(() => {});
};
</script>

<template>
  <div class="product-table-container">
    <q-banner v-if="store.loading" class="bg-primary text-white q-mb-md">
      <template v-slot:avatar>
        <q-spinner color="white" size="20px" />
      </template>
      Loading products...
    </q-banner>

    <!-- Search & Category Filters -->
    <div class="row items-center q-col-gutter-sm q-mb-md">
      <!-- Search Input -->
      <div class="col-12 col-sm-7 col-md-8">
        <q-input
          v-model="searchQuery"
          dense
          outlined
          clearable
          placeholder="Cerca prodotto per nome o descrizione..."
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <!-- Category Filter -->
      <div class="col-12 col-sm-5 col-md-4">
        <q-select
          v-model="selectedCategory"
          :options="availableCategories"
          dense
          outlined
          emit-value
          map-options
          :display-value="selectedCategory === 'all' ? 'Tutte le Categorie' : selectedCategory"
        >
          <template #prepend>
            <q-icon name="filter_list" />
          </template>
        </q-select>
      </div>
    </div>

    <!-- Drag Reorder Notice -->
    <div v-if="isFiltering" class="text-caption text-orange-9 q-mb-sm">
      <q-icon name="info" class="q-mr-xs" />
      Filtro attivo: per modificare l'ordine dei prodotti tramite trascinamento, reimposta i filtri su tutti i prodotti.
    </div>

    <table class="product-table">
      <thead>
        <tr>
          <th style="width: 40px"></th>
          <th class="text-left">Image</th>
          <th class="text-left">Name</th>
          <th class="text-left">Category</th>
          <th class="text-center" style="width: 170px">Gradimento & Statistiche</th>
          <th class="text-center" style="width: 120px">Actions</th>
        </tr>
      </thead>
      <draggable
        v-model="draggableProducts"
        @end="handleReorder"
        tag="tbody"
        item-key="id"
        handle=".drag-handle"
      >
        <template #item="{ element: row }">
          <tr :key="row.id" class="product-row">
            <td class="text-center drag-handle">
              <q-icon name="drag_indicator" color="grey-6" size="sm" />
            </td>
            <td>
              <q-avatar rounded size="40px">
                <img :src="row.images?.[0] || 'https://placehold.co/100'" />
              </q-avatar>
            </td>
            <td>
              <div class="row items-center q-gutter-x-xs">
                <span class="text-weight-medium">{{ row.name }}</span>
                <q-chip
                  v-if="row.active === false"
                  dense
                  color="negative"
                  text-color="white"
                  size="xs"
                  class="text-weight-bold"
                >
                  Nascosto
                </q-chip>
              </div>
            </td>
            <td>{{ row.category }}</td>
            <td class="text-center">
              <div class="row items-center justify-center q-gutter-x-sm no-wrap">
                <!-- Likes -->
                <div class="row items-center q-gutter-x-xs" title="Mi Piace totali">
                  <q-icon name="favorite" color="red" size="16px" />
                  <span class="text-caption text-weight-bold">{{ row.likesCount || 0 }}</span>
                </div>
                <!-- Saves -->
                <div class="row items-center q-gutter-x-xs" title="Salvati nei preferiti">
                  <q-icon name="bookmark" color="primary" size="16px" />
                  <span class="text-caption text-weight-bold">{{ row.savesCount || 0 }}</span>
                </div>
                <!-- Rating -->
                <div class="row items-center q-gutter-x-xs" title="Valutazione media e voti">
                  <q-icon name="star" color="orange" size="16px" />
                  <span class="text-caption text-weight-bold">{{ row.ratingAverage || '-' }}</span>
                  <span v-if="row.ratingCount" class="text-caption text-grey-6" style="font-size: 10px">
                    ({{ row.ratingCount }})
                  </span>
                </div>
              </div>
            </td>
            <td class="text-center">
              <div class="row items-center justify-center no-wrap q-gutter-x-xs">
                <q-btn
                  flat
                  round
                  :color="row.active === false ? 'negative' : 'grey-7'"
                  :icon="row.active === false ? 'visibility_off' : 'visibility'"
                  size="sm"
                  @click="toggleVisibility(row)"
                >
                  <q-tooltip>{{ row.active === false ? 'Mostra Prodotto ai Clienti' : 'Nascondi Prodotto ai Clienti' }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="secondary"
                  icon="content_copy"
                  size="sm"
                  @click="emit('duplicate', row)"
                >
                  <q-tooltip>Duplica Prodotto</q-tooltip>
                </q-btn>
                <q-btn flat round color="primary" icon="edit" size="sm" @click="emit('edit', row)">
                  <q-tooltip>Modifica Prodotto</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="confirmDelete(row)"
                >
                  <q-tooltip>Elimina Prodotto</q-tooltip>
                </q-btn>
              </div>
            </td>
          </tr>
        </template>
      </draggable>

      <!-- Empty State -->
      <tbody v-if="draggableProducts.length === 0">
        <tr>
          <td colspan="6" class="text-center q-pa-lg text-grey-7">
            <q-icon name="search_off" size="32px" color="grey-5" class="q-mb-xs block mx-auto" />
            Nessun prodotto trovato per i criteri di ricerca selezionati.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.product-table-container {
  width: 100%;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: white;
}

.product-table thead {
  background-color: #f5f5f5;
}

.product-table th {
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.87);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  text-align: left;
}

.product-table td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  vertical-align: middle;
}

.product-row {
  transition: background-color 0.2s;
}

.product-row:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.drag-handle {
  cursor: move;
  user-select: none;
}

.drag-handle:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>
