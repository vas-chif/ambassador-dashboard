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

import { useQuasar } from 'quasar';
const $q = useQuasar();

const openLink = (url: string) => {
  window.open(url, '_blank');
};
</script>

<template>
  <div :class="$q.screen.lt.sm ? 'q-pa-none q-mb-xl' : 'q-pa-md q-mb-lg'">
    <div class="text-h4 text-center q-mb-lg font-serif" v-if="title">{{ title }}</div>

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
        <div v-for="product in displayProducts" :key="product.id" class="col-12 col-sm-6 col-md-4">
          <q-card class="product-card shadow-3" :bordered="$q.screen.gt.xs" :square="$q.screen.xs">
            <q-img
              :src="product.images?.[0] || 'https://placehold.co/300x300'"
              :ratio="1"
              fit="contain"
              class="bg-white"
            />

            <q-card-section class="flex-grow-1">
              <div class="text-overline text-orange-9" style="font-size: 16px; line-height: 1.2">
                {{ product.category }}
              </div>
              <div
                class="text-h5 q-mt-xs q-mb-xs text-primary"
                style="font-size: 26px; font-weight: bold; line-height: 1.2"
              >
                {{ product.name }}
              </div>
              <!-- Description (HTML) -->
              <div class="text-grey-6" style="font-size: 22px" v-html="product.description"></div>
            </q-card-section>

            <div class="q-mt-auto">
              <q-separator />

              <q-list v-if="product.externalUrl">
                <q-item clickable @click="openLink(product.externalUrl)">
                  <q-item-section avatar>
                    <q-icon color="primary" name="shopping_bag" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label style="font-size: 18px">Acquista Ora</q-item-label>
                    <q-item-label caption style="font-size: 14px">Vai al negozio</q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-icon name="open_in_new" color="grey" />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.product-card {
  height: 100% !important;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
.font-serif {
  font-family: 'Playfair Display', serif;
}
:deep(hr) {
  border: 0;
  border-top: 1px solid #ccc;
  margin: 1rem 0;
}
</style>
