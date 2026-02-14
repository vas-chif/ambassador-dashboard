<script setup lang="ts">
/**
 * @file ProductGrid.vue
 * @description Product Grid Widget for public pages with detailed dialog and interactions.
 * @author Vasile Chifeac (AI Agent)
 * @created 2026-02-06
 * @modified 2026-02-14
 */

import { computed, onMounted, ref } from 'vue';
import { useProductsStore } from 'stores/products';
import { useProductInteractions } from 'src/composables/useProductInteractions';
import { useQuasar } from 'quasar';
import type { Product } from 'src/types/product';

const props = defineProps<{
  title?: string;
  limit?: number;
  category?: string;
}>();

const store = useProductsStore();
const $q = useQuasar();
const { toggleLike, isLiked, toggleSave, isSaved, setRating, getRating, shareProduct } =
  useProductInteractions();

// Dialog State
const showDetailDialog = ref(false);
const selectedProduct = ref<Product | null>(null);

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

const handleShare = async (product: Product) => {
  const result = await shareProduct({
    title: product.name,
    text: `Check out ${product.name}!`,
    url: product.externalUrl || window.location.href,
  });

  if (result === 'copied') {
    $q.notify({ type: 'info', message: 'Link copied to clipboard!' });
  }
};

const handleRate = async (val: number) => {
  if (!selectedProduct.value) return;

  // Check if already rated locally
  if (getRating(selectedProduct.value.id) > 0) {
    $q.notify({ type: 'warning', message: 'Hai già votato questo prodotto!' });
    return;
  }

  try {
    // 1. Persist to Firestore (Public)
    await store.rateProduct(selectedProduct.value.id, val);

    // 2. Persist locally (Private - so user sees their vote)
    setRating(selectedProduct.value.id, val);

    $q.notify({ type: 'positive', message: 'Grazie per il tuo voto!' });
  } catch (e) {
    console.error(e);
    $q.notify({ type: 'negative', message: 'Errore durante il voto' });
  }
};

const openExternalLink = (url?: string) => {
  if (url) window.open(url, '_blank');
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
              class="bg-white cursor-pointer"
              @click="openDetailDialog(product)"
            />

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
                class="row items-center q-mb-sm"
                v-if="product.ratingCount && product.ratingCount > 0"
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
                    <q-item-label caption style="font-size: 14px"
                      >Dettagli & Istruzioni</q-item-label
                    >
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

    <!-- PRODUCT DETAIL DIALOG -->
    <q-dialog
      v-model="showDetailDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="column no-wrap bg-grey-1" v-if="selectedProduct">
        <!-- Dialog Header -->
        <q-toolbar class="bg-primary text-white">
          <q-btn flat round dense icon="close" v-close-popup />
          <q-toolbar-title>{{ selectedProduct.name }}</q-toolbar-title>
          <q-btn flat round dense icon="share" @click="handleShare(selectedProduct)">
            <q-tooltip>Condividi</q-tooltip>
          </q-btn>
        </q-toolbar>

        <q-card-section class="col overflow-auto q-pa-none">
          <div class="row justify-center">
            <div class="col-12 col-md-8 col-lg-6 bg-white shadow-1">
              <!-- Product Image -->
              <q-img
                :src="selectedProduct.images?.[0] || 'https://placehold.co/300x300'"
                :ratio="1"
                fit="contain"
                class="bg-white"
                style="max-height: 400px"
              />

              <div class="q-pa-lg">
                <!-- Title & Category -->
                <div class="text-overline text-orange-9">{{ selectedProduct.category }}</div>
                <div class="text-h4 text-primary q-mb-sm font-serif">
                  {{ selectedProduct.name }}
                </div>

                <!-- Dialog Rating Summary -->
                <div class="row items-center q-mb-md" v-if="selectedProduct.ratingCount">
                  <span class="text-h6 text-orange q-mr-xs">{{
                    selectedProduct.ratingAverage
                  }}</span>
                  <q-rating
                    :model-value="selectedProduct.ratingAverage || 0"
                    max="5"
                    size="1.5em"
                    color="orange"
                    readonly
                    icon="star_border"
                    icon-selected="star"
                  />
                  <span class="text-grey-6 q-ml-sm">({{ selectedProduct.ratingCount }} voti)</span>
                </div>

                <!-- Main Description -->
                <div
                  class="text-body1 text-grey-8 q-mb-lg"
                  v-html="selectedProduct.description"
                ></div>

                <q-separator class="q-my-lg" />

                <!-- Instructions (New Field) -->
                <div v-if="selectedProduct.instructions">
                  <div class="text-h6 q-mb-sm">Istruzioni & Dettagli</div>
                  <div class="text-body2 text-grey-7" v-html="selectedProduct.instructions"></div>
                </div>
                <div v-else class="text-italic text-grey">
                  Nessuna istruzione aggiuntiva disponibile.
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- Dialog Footer (Actions) -->
        <q-separator />
        <q-card-actions class="bg-white q-pa-md row items-center justify-between no-wrap">
          <!-- Interaction Buttons Left -->
          <div class="row q-gutter-x-sm items-center">
            <!-- Like Button -->
            <q-btn
              round
              flat
              :icon="isLiked(selectedProduct.id) ? 'favorite' : 'favorite_border'"
              :color="isLiked(selectedProduct.id) ? 'red' : 'grey'"
              @click="toggleLike(selectedProduct.id)"
            >
              <q-tooltip>Mi Piace</q-tooltip>
            </q-btn>

            <!-- Save Button -->
            <q-btn
              round
              flat
              :icon="isSaved(selectedProduct.id) ? 'bookmark' : 'bookmark_border'"
              :color="isSaved(selectedProduct.id) ? 'primary' : 'grey'"
              @click="toggleSave(selectedProduct.id)"
            >
              <q-tooltip>Salva</q-tooltip>
            </q-btn>

            <!-- Share (duplicate for convenience) -->
            <q-btn round flat icon="share" color="grey" @click="handleShare(selectedProduct)">
              <q-tooltip>Condividi</q-tooltip>
            </q-btn>
          </div>

          <!-- Rating & Buy Now Right -->
          <div class="row q-gutter-x-md items-center">
            <!-- Rating Component (Interactive) -->
            <div class="column items-center q-mr-sm" v-if="$q.screen.gt.xs">
              <q-rating
                :model-value="getRating(selectedProduct.id)"
                @update:model-value="handleRate"
                size="sm"
                color="orange"
                icon="star_border"
                icon-selected="star"
                :readonly="getRating(selectedProduct.id) > 0"
              />
              <div class="text-caption text-grey-6">
                {{ getRating(selectedProduct.id) > 0 ? 'Votato' : 'Vota' }}
              </div>
            </div>

            <!-- Buy Now Button -->
            <q-btn
              v-if="selectedProduct.externalUrl"
              color="primary"
              label="Acquista Ora"
              icon="shopping_bag"
              unelevated
              rounded
              class="q-px-lg"
              @click="openExternalLink(selectedProduct.externalUrl)"
            />
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>
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
