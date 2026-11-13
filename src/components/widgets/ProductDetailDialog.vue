<script setup lang="ts">
/**
 * @file ProductDetailDialog.vue
 * @description Dialog modale a schermo intero per i dettagli, istruzioni, recensioni e acquisto del prodotto.
 * Estratto da ProductGrid per modularità (§0.2 / §0.3 AGENTS.md).
 * @author Vasile Chifeac (AI Agent)
 */

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
    <q-card v-if="product" class="column no-wrap bg-grey-1">
      <!-- Dialog Header -->
      <q-toolbar class="bg-primary text-white">
        <q-btn flat round dense icon="close" v-close-popup />
        <q-toolbar-title>{{ product.name }}</q-toolbar-title>
        <q-btn flat round dense icon="share" @click="handleShare(product)">
          <q-tooltip>Condividi</q-tooltip>
        </q-btn>
      </q-toolbar>

      <q-card-section class="col overflow-auto q-pa-none">
        <div class="row justify-center">
          <div class="col-12 col-md-8 col-lg-6 bg-white shadow-1">
            <!-- Product Image -->
            <q-img
              :src="product.images?.[0] || 'https://placehold.co/300x300'"
              :ratio="1"
              fit="contain"
              class="bg-white"
              style="max-height: 400px"
            />

            <div class="q-pa-lg">
              <!-- Title & Category -->
              <div class="text-overline text-orange-9">{{ product.category }}</div>
              <div class="text-h4 text-primary q-mb-sm font-serif">
                {{ product.name }}
              </div>

              <!-- Dialog Rating Summary -->
              <div v-if="product.ratingCount" class="row items-center q-mb-md">
                <span class="text-h6 text-orange q-mr-xs">{{ product.ratingAverage }}</span>
                <q-rating
                  :model-value="product.ratingAverage || 0"
                  max="5"
                  size="1.5em"
                  color="orange"
                  readonly
                  icon="star_border"
                  icon-selected="star"
                />
                <span class="text-grey-6 q-ml-sm">({{ product.ratingCount }} voti)</span>
              </div>

              <!-- Main Description -->
              <div
                class="text-body1 text-grey-8 q-mb-lg"
                v-html="product.description"
              ></div>

              <q-separator class="q-my-lg" />

              <!-- Instructions -->
              <div v-if="product.instructions">
                <div class="text-h6 q-mb-sm">Istruzioni & Dettagli</div>
                <div class="text-body2 text-grey-7" v-html="product.instructions"></div>
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
          <div v-if="$q.screen.gt.xs" class="column items-center q-mr-sm">
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

          <!-- Buy Now Button -->
          <q-btn
            v-if="product.externalUrl"
            color="primary"
            label="Acquista Ora"
            icon="shopping_bag"
            unelevated
            rounded
            class="q-px-lg"
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
</style>
