<script setup lang="ts">
/**
 * @file ProductListTable.vue
 * @description Product List Table Component.
 * @author Vasile Chifeac (AI Agent)
 * @created 2026-02-06
 */

import { onMounted, onUnmounted } from 'vue';
import { useProductsStore } from 'stores/products';

const store = useProductsStore();

onMounted(() => {
  store.subscribeToProducts();
});

onUnmounted(() => {
  store.unsubscribeFromProducts();
});

const columns = [
  { name: 'image', label: 'Image', align: 'left' as const, field: 'images' },
  { name: 'name', label: 'Name', align: 'left' as const, field: 'name', sortable: true },
  {
    name: 'category',
    label: 'Category',
    align: 'left' as const,
    field: 'category',
    sortable: true,
  },

  { name: 'stock', label: 'Stock', align: 'right' as const, field: 'stock', sortable: true },
  { name: 'actions', label: 'Actions', align: 'center' as const, field: 'actions' },
];

const emit = defineEmits(['edit', 'delete']);

import { useQuasar } from 'quasar';
const $q = useQuasar();

import type { Product } from 'src/types/product';

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
  <q-table :rows="store.products" :columns="columns" row-key="id" :loading="store.loading">
    <template v-slot:body-cell-image="props">
      <q-td :props="props">
        <q-avatar rounded size="40px">
          <img :src="props.value?.[0] || 'https://placehold.co/100'" />
        </q-avatar>
      </q-td>
    </template>

    <template v-slot:body-cell-actions="props">
      <q-td :props="props">
        <q-btn flat round color="primary" icon="edit" size="sm" @click="emit('edit', props.row)" />
        <q-btn
          flat
          round
          color="negative"
          icon="delete"
          size="sm"
          @click="confirmDelete(props.row)"
        />
      </q-td>
    </template>
  </q-table>
</template>
