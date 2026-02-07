<script setup lang="ts">
/**
 * @file ProductGrid.vue
 * @description Product Grid Widget for public pages.
 * @author Vasile Chifeac (AI Agent)
 * @created 2026-02-06
 * @modified 2026-02-06
 */

import { computed, onMounted } from 'vue';
import { useProductsStore } from 'stores/products';

const props = defineProps<{
  title?: string;
  limit?: number;
  category?: string;
}>();

const store = useProductsStore();

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

const openLink = (url: string) => {
  window.open(url, '_blank');
};
</script>

<template>
  <div class="q-pa-xs q-pa-md-md">
    <div class="text-h4 text-center q-mb-lg font-serif" v-if="title">{{ title }}</div>

    <div class="row q-col-gutter-sm q-col-gutter-md-md">
      <div v-for="product in displayProducts" :key="product.id" class="col-12 col-sm-6 col-md-4">
        <q-card
          class="product-card column no-wrap cursor-pointer"
          flat
          bordered
          @click="product.externalUrl ? openLink(product.externalUrl) : null"
        >
          <q-img
            :src="product.images?.[0] || 'https://placehold.co/300x300'"
            :ratio="1"
            fit="contain"
            class="bg-white"
          />

          <q-card-section class="q-pt-sm col-grow column justify-between">
            <div>
              <div
                class="text-primary ellipsis-2-lines q-mb-xs"
                style="font-size: 26px; font-weight: bold; line-height: 1.2"
              >
                {{ product.name }}
              </div>
              <div class="text-grey-8 q-mb-sm" style="font-size: 24px">{{ product.category }}</div>
              <!-- Description (HTML) -->
              <div
                class="text-grey-6 ellipsis-3-lines"
                style="font-size: 22px"
                v-html="product.description"
              ></div>
            </div>

            <!-- Price and Cart removed as per request -->
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.product-card {
  height: 100%;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
.font-serif {
  font-family: 'Playfair Display', serif;
}
</style>
