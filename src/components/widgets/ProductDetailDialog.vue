<script setup lang="ts">
/**
 * @file ProductDetailDialog.vue
 * @description Dialog modale luxury per dettagli, istruzioni, recensioni e acquisto del prodotto.
 * Layout responsive adattabile a tutti i display (2 colonne su desktop/tablet, 1 colonna fluida su mobile).
 * Estratto da ProductGrid per modularità (§0.2 / §0.3 AGENTS.md).
 * @author Vasile Chifeac (AI Agent)
 */

import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useProductsStore } from 'stores/products';
import { useProductInteractions } from 'src/composables/useProductInteractions';
import type { Product } from 'src/types/product';

const props = defineProps<{
  modelValue: boolean;
  product: Product | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const $q = useQuasar();
const store = useProductsStore();
const { toggleLike, isLiked, toggleSave, isSaved, setRating, getRating, shareProduct } =
  useProductInteractions();

const activeImageIndex = ref(0);
watch(() => props.product?.id, () => { activeImageIndex.value = 0; });

const currentImageUrl = computed(() => {
  if (!props.product?.images?.length) return 'https://placehold.co/400x400';
  return props.product.images[activeImageIndex.value] || props.product.images[0];
});

const handleShare = async (prod: Product) => {
  const result = await shareProduct({
    title: prod.name,
    text: `Guarda ${prod.name}!`,
    url: prod.externalUrl || window.location.href,
  });
  if (result === 'copied') {
    $q.notify({ type: 'info', message: 'Link copiato negli appunti!' });
  }
};

const handleRate = async (val: number) => {
  if (!props.product) return;
  if (getRating(props.product.id) > 0) {
    $q.notify({ type: 'warning', message: 'Hai già votato questo prodotto!' });
    return;
  }
  try {
    await store.rateProduct(props.product.id, val);
    setRating(props.product.id, val);
    $q.notify({ type: 'positive', message: 'Grazie per il tuo voto!' });
  } catch {
    $q.notify({ type: 'negative', message: 'Errore durante l\'invio del voto' });
  }
};

const handleToggleLike = async (prod: Product) => {
  const isNowLiked = toggleLike(prod.id);
  try {
    await store.toggleProductLike(prod.id, isNowLiked);
  } catch { /* Fallback local */ }
};

const handleToggleSave = async (prod: Product) => {
  const isNowSaved = toggleSave(prod.id);
  try {
    await store.toggleProductSave(prod.id, isNowSaved);
  } catch { /* Fallback local */ }
};

const openExternalLink = (url?: string) => {
  if (url) window.open(url, '_blank');
};
</script>

<template>
  <q-dialog
    :model-value="modelValue"
    maximized
    no-focus-restore
    transition-show="slide-up"
    transition-hide="slide-down"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card v-if="product" class="column no-wrap bg-grey-2 product-dialog-card">
      <!-- Top Luxury Header Toolbar -->
      <q-toolbar class="bg-primary text-white shadow-1 product-dialog-toolbar">
        <q-btn flat round dense icon="arrow_back" v-close-popup>
          <q-tooltip>Torna indietro</q-tooltip>
        </q-btn>
        <q-toolbar-title class="text-subtitle1 text-md-h6 font-serif ellipsis">
          {{ product.name }}
        </q-toolbar-title>
        <q-btn flat round dense icon="share" @click="handleShare(product)">
          <q-tooltip>Condividi</q-tooltip>
        </q-btn>
      </q-toolbar>

      <!-- Scrollable Main Content: Responsive spacing so card never touches header -->
      <q-card-section class="col overflow-auto q-pa-sm q-pa-sm-md q-pa-md-lg">
        <div class="row justify-center items-start full-width q-my-xs q-my-md-sm">
          <!-- Centered Responsive Luxury Product Card -->
          <div class="col-12 col-md-11 col-lg-10 bg-white shadow-2 product-card-container">
            <div class="row">
              <!-- Left Column: Product Showcase & Gallery -->
              <div class="col-12 col-md-6 product-image-wrapper column justify-center items-center q-pa-md q-pa-lg-lg bg-warm-luxury">
                <div class="image-inner-container full-width text-center">
                  <q-img
                    :src="currentImageUrl"
                    :ratio="1"
                    fit="contain"
                    class="rounded-borders product-main-img"
                    style="max-height: 440px; width: 100%;"
                  >
                    <template #loading>
                      <q-spinner-dots color="primary" size="40px" />
                    </template>
                  </q-img>
                </div>

                <!-- Gallery Thumbnails (if multiple images exist) -->
                <div v-if="product.images && product.images.length > 1" class="row q-gutter-xs justify-center q-mt-md">
                  <q-btn
                    v-for="(img, idx) in product.images"
                    :key="idx"
                    flat
                    dense
                    round
                    class="thumbnail-btn"
                    :class="{ 'thumbnail-active': activeImageIndex === idx }"
                    @click="activeImageIndex = idx"
                  >
                    <q-avatar size="44px" rounded>
                      <q-img :src="img" :ratio="1" fit="cover" />
                    </q-avatar>
                  </q-btn>
                </div>
              </div>

              <!-- Right Column: Product Info & Details -->
              <div class="col-12 col-md-6 q-pa-md q-pa-lg-xl column justify-between product-info-wrapper">
                <div>
                  <!-- Category & Stock Status -->
                  <div class="row items-center justify-between q-mb-xs">
                    <span class="text-overline text-orange-9 text-weight-bold letter-spacing-1">
                      {{ product.category || 'Trattamento Esclusivo' }}
                    </span>
                    <q-badge
                      v-if="product.stock !== undefined"
                      :color="product.stock > 0 ? 'positive' : 'grey-6'"
                      outline
                      class="text-caption"
                    >
                      {{ product.stock > 0 ? 'Disponibile' : 'Esaurito' }}
                    </q-badge>
                  </div>

                  <!-- Product Name -->
                  <div class="text-h4 text-primary font-serif q-mb-sm text-weight-bold line-height-tight">
                    {{ product.name }}
                  </div>

                  <!-- Price & Rating Row -->
                  <div class="row items-center q-gutter-x-md q-mb-md">
                    <div v-if="product.price" class="text-h5 text-primary text-weight-bold">
                      €{{ product.price.toFixed(2) }}
                      <span
                        v-if="product.originalPrice && product.originalPrice > product.price"
                        class="text-body2 text-grey-6 text-strike q-ml-xs"
                      >
                        €{{ product.originalPrice.toFixed(2) }}
                      </span>
                    </div>

                    <!-- Stars Summary -->
                    <div v-if="product.ratingCount && product.ratingCount > 0" class="row items-center">
                      <span class="text-subtitle1 text-orange text-weight-bold q-mr-xs">
                        {{ product.ratingAverage?.toFixed(1) }}
                      </span>
                      <q-rating
                        :model-value="product.ratingAverage || 0"
                        max="5"
                        size="1.2em"
                        color="orange"
                        readonly
                        icon="star_border"
                        icon-selected="star"
                      />
                      <span class="text-caption text-grey-6 q-ml-xs">({{ product.ratingCount }} voti)</span>
                    </div>
                  </div>

                  <!-- Description -->
                  <div class="product-description-text text-body1 text-grey-8 q-mb-md" v-html="product.description"></div>

                  <q-separator class="q-my-md" />

                  <!-- Instructions -->
                  <div v-if="product.instructions" class="q-mb-md">
                    <div class="text-subtitle1 text-weight-bold text-dark q-mb-xs">
                      Istruzioni & Dettagli
                    </div>
                    <div class="text-body2 text-grey-7" v-html="product.instructions"></div>
                  </div>
                  <div v-else class="text-italic text-caption text-grey-6 q-mb-md">
                    Nessuna istruzione aggiuntiva disponibile.
                  </div>
                </div>

                <!-- Desktop Quick Purchase Button -->
                <div v-if="product.externalUrl" class="gt-xs q-mt-md">
                  <q-btn
                    color="primary"
                    label="Acquista Ora"
                    icon="shopping_bag"
                    unelevated
                    rounded
                    class="full-width q-py-sm text-weight-bold"
                    @click="openExternalLink(product.externalUrl)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Bottom Sticky Footer Actions -->
      <q-separator />
      <q-card-actions class="bg-white q-py-sm q-px-md row items-center justify-between no-wrap">
        <!-- Interaction Buttons Left -->
        <div class="row q-gutter-x-sm items-center">
          <!-- Like Button with Count -->
          <div class="row items-center">
            <q-btn
              round
              flat
              :icon="isLiked(product.id) ? 'favorite' : 'favorite_border'"
              :color="isLiked(product.id) ? 'red' : 'grey'"
              @click="handleToggleLike(product)"
            >
              <q-tooltip>{{ isLiked(product.id) ? 'Rimuovi Mi Piace' : 'Mi Piace' }}</q-tooltip>
            </q-btn>
            <span v-if="product.likesCount && product.likesCount > 0" class="text-caption text-grey-7 q-mr-xs">
              {{ product.likesCount }}
            </span>
          </div>

          <!-- Save Button with Count -->
          <div class="row items-center">
            <q-btn
              round
              flat
              :icon="isSaved(product.id) ? 'bookmark' : 'bookmark_border'"
              :color="isSaved(product.id) ? 'primary' : 'grey'"
              @click="handleToggleSave(product)"
            >
              <q-tooltip>{{ isSaved(product.id) ? 'Rimuovi dai Salvati' : 'Salva nei Preferiti' }}</q-tooltip>
            </q-btn>
            <span v-if="product.savesCount && product.savesCount > 0" class="text-caption text-grey-7 q-mr-xs">
              {{ product.savesCount }}
            </span>
          </div>

          <!-- Share -->
          <q-btn round flat icon="share" color="grey" @click="handleShare(product)">
            <q-tooltip>Condividi</q-tooltip>
          </q-btn>
        </div>

        <!-- Rating & Buy Now Right -->
        <div class="row q-gutter-x-md items-center">
          <!-- Rating Component (Interactive) -->
          <div class="column items-center q-mr-sm">
            <q-rating
              :model-value="getRating(product.id)"
              size="sm"
              color="orange"
              icon="star_border"
              icon-selected="star"
              :readonly="getRating(product.id) > 0"
              @update:model-value="handleRate"
            />
            <div class="text-caption text-grey-6">
              {{ getRating(product.id) > 0 ? 'Votato' : 'Vota' }}
            </div>
          </div>

          <!-- Mobile Buy Now Button -->
          <q-btn
            v-if="product.externalUrl"
            color="primary"
            label="Acquista Ora"
            icon="shopping_bag"
            unelevated
            rounded
            class="q-px-lg lt-sm"
            @click="openExternalLink(product.externalUrl)"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.font-serif {
  font-family: 'Playfair Display', serif;
}
.letter-spacing-1 {
  letter-spacing: 0.08em;
}
.line-height-tight {
  line-height: 1.25;
}
.bg-warm-luxury {
  background-color: #faf8f5;
}
.product-card-container {
  max-width: 1040px;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
}
.product-dialog-toolbar {
  min-height: 56px;
}
.thumbnail-btn {
  padding: 2px;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  &.thumbnail-active {
    border-color: var(--q-primary);
  }
}
.product-main-img {
  transition: transform 0.3s ease;
}
</style>
