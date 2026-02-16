<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSettingsStore } from 'stores/settings';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

import type { Article } from 'stores/settings';

const store = useSettingsStore();
const router = useRouter();
const $q = useQuasar();

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
        <!-- MOBILE: Vertical Full-Card Carousel -->
        <q-carousel
          v-if="$q.screen.lt.md"
          v-model="slide"
          swipeable
          animated
          infinite
          :autoplay="10000"
          height="600px"
          class="bg-white shadow-2 rounded-borders overflow-hidden mobile-carousel"
          control-color="primary"
          arrows
          navigation
        >
          <q-carousel-slide
            v-for="article in articles"
            :key="article.id"
            :name="article.slideIndex"
            class="q-pa-none"
          >
            <div class="column full-height">
              <!-- Top: Image (40%) -->
              <div class="mobile-carousel-image">
                <q-img
                  :src="article.imageUrl"
                  class="full-width full-height"
                  fit="cover"
                  position="center"
                />
              </div>

              <!-- Bottom: Content (60%) -->
              <div class="mobile-carousel-content column q-px-xl q-py-md bg-white">
                <!-- Title -->
                <div class="text-h6 text-weight-bold text-primary font-serif q-mb-sm text-center">
                  {{ article.title }}
                </div>

                <!-- Description -->
                <div
                  class="text-body2 text-grey-8 q-mb-md mobile-description-clamp"
                  style="line-height: 1.4"
                >
                  {{ article.description }}
                </div>

                <!-- Button (Fixed at Bottom) -->
                <div class="row justify-center q-mt-auto">
                  <q-btn
                    color="primary"
                    text-color="white"
                    :label="article.actionText || 'Scopri di più'"
                    icon-right="arrow_forward"
                    unelevated
                    size="md"
                    class="q-px-lg"
                    @click="openLink(article.linkUrl)"
                  />
                </div>
              </div>
            </div>
          </q-carousel-slide>
        </q-carousel>

        <!-- DESKTOP: Horizontal Split Carousel -->
        <q-carousel
          v-else
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
              <div class="col-12 col-md-4 carousel-image-col relative-position">
                <q-img
                  :src="article.imageUrl"
                  class="full-height full-width"
                  fit="cover"
                  position="center"
                />
              </div>

              <!-- Right: Content -->
              <div
                class="col-12 col-md-8 carousel-content-col bg-white text-black carousel-padding"
              >
                <div class="column full-height justify-between">
                  <!-- Top Left: Title -->
                  <div
                    class="carousel-title text-weight-bold text-primary font-serif self-start text-left"
                  >
                    {{ article.title }}
                  </div>

                  <!-- Center: Description -->
                  <div
                    class="carousel-description text-grey-8 text-weight-light self-center text-center carousel-desc-padding description-clamped"
                  >
                    {{ article.description }}
                  </div>

                  <!-- Bottom: Button -->
                  <div class="carousel-button-container carousel-button-padding">
                    <q-btn
                      color="primary"
                      text-color="white"
                      :label="article.actionText || 'Scopri di più'"
                      icon-right="arrow_forward"
                      unelevated
                      class="carousel-button"
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

/* MOBILE CAROUSEL: Vertical Full-Card Layout */
.mobile-carousel-image {
  height: 40%;
  min-height: 40%;
  flex-shrink: 0;
}

.carousel-button-padding {
  padding-bottom: 3.5rem;
}

.carousel-button-container {
  display: flex;
  justify-content: center;
  width: 100%;
  padding-bottom: 2rem; /* Add padding to lift button above arrows */
  z-index: 10;
  position: relative;
}

.mobile-description-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 5;
  line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

/* Mobile-first: Stack layout (for desktop carousel on mobile) */

.carousel-title {
  font-size: 1.5rem;
  line-height: 1.2;
}

.carousel-description {
  font-size: 0.9rem;
}

.carousel-button {
  padding: 0.5rem 1.5rem;
  font-size: 0.9rem;
}

.description-clamped {
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Reduced to 2 lines on mobile */
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 60px;
}

/* Desktop: Side-by-side layout */
@media (min-width: 1024px) {
  .carousel-image-col,
  .carousel-content-col {
    height: 100%;
  }

  .carousel-content-col {
    overflow-y: visible;
  }

  .carousel-padding {
    padding: 2rem;
  }

  .carousel-desc-padding {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .carousel-button-padding {
    padding-bottom: 3rem;
  }

  .carousel-button-container {
    justify-content: flex-end; /* Right-align button on desktop */
  }

  .carousel-title {
    font-size: 3rem;
  }

  .carousel-description {
    font-size: 1.25rem;
  }

  .carousel-button {
    padding: 0.75rem 2rem;
    font-size: 1rem;
  }

  .description-clamped {
    -webkit-line-clamp: 5;
    line-clamp: 5;
    max-height: 150px;
  }
}

/* Adjust for carousel thumbnails */
:deep(.q-carousel__control--thumbnails) {
  background: white;
  padding-bottom: 4px;
}
</style>
