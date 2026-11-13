<script setup lang="ts">
/**
 * @file AdminProducts.vue
 * @description User-Friendly Product Management (Refactored).
 * @author Vasile Chifeac (AI Agent)
 * @created 2026-02-06
 */

import { ref } from 'vue';
import ProductListTable from 'components/admin/ProductListTable.vue';
import ProductFormDialog from 'components/admin/ProductFormDialog.vue';
import type { Product } from 'src/types/product';

import { useProductsStore } from 'stores/products';
import { useQuasar } from 'quasar';

const showAddDialog = ref(false);
const editingProduct = ref<Product | null>(null);
const store = useProductsStore();
const $q = useQuasar();

const openAddDialog = () => {
  editingProduct.value = null;
  showAddDialog.value = true;
};

const handleEdit = (product: Product) => {
  editingProduct.value = product;
  showAddDialog.value = true;
};

const handleDelete = (product: Product) => {
  store
    .deleteProduct(product.id)
    .then(() => {
      $q.notify({ type: 'positive', message: 'Product deleted' });
    })
    .catch((error) => {
      console.error(error);
      $q.notify({ type: 'negative', message: 'Failed to delete' });
    });
};

const handleDuplicate = async (product: Product) => {
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
    });
  } catch (error: unknown) {
    console.error(error);
    $q.notify({ type: 'negative', message: 'Errore durante la duplicazione del prodotto' });
  }
};

const handleSave = async (productData: Partial<Product>) => {
  try {
    if (editingProduct.value) {
      await store.updateProduct(editingProduct.value.id, productData);
      $q.notify({ type: 'positive', message: 'Product updated successfully' });
    } else {
      await store.addProduct(productData);
      $q.notify({ type: 'positive', message: 'Product added successfully' });
    }
    showAddDialog.value = false;
  } catch (error: unknown) {
    console.error(error);
    $q.notify({ type: 'negative', message: 'Error saving product' });
  }
};
</script>

<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h4">Products ({{ store.products.length }})</div>
      <q-btn color="primary" icon="add" label="Add Product" @click="openAddDialog" />
    </div>

    <!-- Debug Info -->
    <div v-if="store.products.length === 0" class="text-grey q-mb-md">
      No products found. (Loading: {{ store.loading }})
    </div>

    <!-- Product Table -->
    <ProductListTable
      @edit="handleEdit"
      @duplicate="handleDuplicate"
      @delete="handleDelete"
    />

    <!-- Add Product Wizard/Dialog -->
    <ProductFormDialog v-model="showAddDialog" :initial-data="editingProduct" @save="handleSave" />
  </q-page>
</template>
