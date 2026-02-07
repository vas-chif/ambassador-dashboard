<script setup lang="ts">
/**
 * @file ProductListTable.vue
 * @description Product List Table Component with Drag & Drop Reordering.
 * @author Vasile Chifeac (AI Agent)
 * @created 2026-02-06
 */

import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useProductsStore } from 'stores/products';
import draggable from 'vuedraggable';
import type { Product } from 'src/types/product';

const store = useProductsStore();

onMounted(() => {
  store.subscribeToProducts();
});

onUnmounted(() => {
  store.unsubscribeFromProducts();
});

const emit = defineEmits(['edit', 'delete']);

import { useQuasar } from 'quasar';
const $q = useQuasar();

// Use a ref for draggable products to allow visual reordering
const draggableProducts = ref<Product[]>([]);

// Sync with store
watch(
  () => store.products,
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

    <table class="product-table">
      <thead>
        <tr>
          <th style="width: 40px"></th>
          <th class="text-left">Image</th>
          <th class="text-left">Name</th>
          <th class="text-left">Category</th>
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
            <td>{{ row.name }}</td>
            <td>{{ row.category }}</td>
            <td class="text-center">
              <q-btn flat round color="primary" icon="edit" size="sm" @click="emit('edit', row)" />
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                size="sm"
                @click="confirmDelete(row)"
              />
            </td>
          </tr>
        </template>
      </draggable>
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
