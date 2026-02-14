<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSettingsStore } from 'stores/settings';
import { useRouter } from 'vue-router';

import type { Article } from 'stores/settings';

const store = useSettingsStore();
const router = useRouter();

const slide = ref(1);

const articles = computed(() => {
  return (store.articles || [])
    .filter((a: Article) => a.active)
    .sort((a: Article, b: Article) => (a.order || 0) - (b.order || 0))
    .map((a: Article, index: number) => ({ ...a, slideIndex: index + 1 })); // Slide names must be unique
});

const openLink = (url: string) => {
  if (!url) return;
  if (url.startsWith('http')) {
    window.open(url, '_blank');
  } else {
    void router.push(url);
  }
};
</script>

<template>
  <div v-if="articles.length > 0" class="full-width q-mb-xl">
    <q-separator class="q-mb-lg" />

    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <q-carousel
          v-model="slide"
          swipeable
          animated
          thumbnails
          infinite
          :autoplay="10000"
          height="500px"
          class="bg-white shadow-2 rounded-borders overflow-hidden"
          padding
          arrows
          control-color="primary"
        >
          <q-carousel-slide
            v-for="article in articles"
            :key="article.id"
            :name="article.slideIndex"
            class="q-pa-none"
            :img-src="article.imageUrl"
          >
            <div class="row full-height">
              <!-- Left: Image -->
              <div class="col-12 col-md-4 full-height relative-position">
                <q-img
                  :src="article.imageUrl"
                  class="full-height full-width"
                  fit="cover"
                  position="center"
                />
              </div>

              <!-- Right: Content -->
              <div class="col-12 col-md-8 full-height bg-white text-black q-pa-lg">
                <div class="column full-height justify-between">
                  <!-- Top Left: Title -->
                  <div
                    class="text-h3 text-weight-bold text-primary font-serif self-start text-left"
                  >
                    {{ article.title }}
                  </div>

                  <!-- Center: Description -->
                  <div
                    class="text-h6 text-grey-8 text-weight-light self-center text-center q-px-md description-clamped"
                  >
                    {{ article.description }}
                  </div>

                  <!-- Bottom Right: Button -->
                  <div class="self-end q-pb-xl">
                    <q-btn
                      color="primary"
                      text-color="white"
                      :label="article.actionText || 'Scopri di più'"
                      icon-right="arrow_forward"
                      unelevated
                      size="lg"
                      class="q-px-xl"
                      @click="openLink(article.linkUrl)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </q-carousel-slide>
        </q-carousel>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-serif {
  font-family: 'Playfair Display', serif;
}

.description-clamped {
  display: -webkit-box;
  -webkit-line-clamp: 5;
  line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 150px; /* Safety height */
}

/* Adjust for carousel thumbnails */
:deep(.q-carousel__control--thumbnails) {
  background: white;
  padding-bottom: 4px;
}
</style>
