<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSettingsStore } from 'stores/settings';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

import type { Article } from 'stores/settings';

const props = withDefaults(
  defineProps<{
    filterType?: 'all' | 'testimonial' | 'product';
    sectionId?: string;
  }>(),
  {
    filterType: 'all',
    sectionId: 'articles',
  },
);

const emit = defineEmits<{
  (e: 'edit-article', article: Article): void;
}>();

const store = useSettingsStore();
const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const isPreview = computed(() => route.query.preview_mode === 'true');

const slide = ref(1);

const articles = computed(() => {
  let list = (store.articles || []).filter((a: Article) => a.active);
  if (props.filterType && props.filterType !== 'all') {
    list = list.filter((a: Article) => (a.layoutConfig?.articleType || 'testimonial') === props.filterType);
  }
  return list
    .sort((a: Article, b: Article) => (a.order || 0) - (b.order || 0))
    .map((a: Article, index: number) => ({ ...a, slideIndex: index + 1 })); // Slide names must be unique
});

const currentArticle = computed(() => {
  if (articles.value.length === 0) return null;
  return articles.value.find((a) => a.slideIndex === slide.value) || articles.value[0];
});

const openLink = (url?: string) => {
  if (!url) return;
  if (url.startsWith('http')) {
    window.open(url, '_blank');
  } else {
    void router.push(url);
  }
};

const carouselHeight = computed(() => {
  if ($q.screen.lt.md) {
    return 'clamp(280px, 42vh, 360px)';
  }
  return 'clamp(420px, 54vh, 580px)';
});

const getTextAlignClass = (article: Article) => {
  const tAlign = article.layoutConfig?.textAlign;
  if (tAlign === 'left') return 'text-left items-start';
  if (tAlign === 'right') return 'text-right items-end';
  return 'text-center items-center';
};
</script>

<template>
  <div v-if="articles.length > 0" class="article-showcase-section full-width q-mb-xl">
    <!-- 1. FULL-WIDTH TOP IMAGE CAROUSEL (Edge-to-Edge Showcase) -->
    <div class="carousel-full-width-wrapper relative-position full-width overflow-hidden">
      <!-- In-Place Quick Edit Current Article (Preview Mode Only) -->
      <div
        v-if="isPreview && currentArticle"
        class="carousel-quick-edit-action absolute-top-right q-ma-md"
        style="z-index: 30"
      >
        <q-btn
          unelevated
          color="primary"
          text-color="white"
          icon="edit"
          label="Modifica Articolo"
          class="shadow-4 text-caption text-weight-bold q-px-sm"
          size="sm"
          no-caps
          @click.stop="emit('edit-article', currentArticle)"
        >
          <q-tooltip>Modifica foto, testi o link dell'articolo visibile</q-tooltip>
        </q-btn>
      </div>

      <q-carousel
        v-model="slide"
        swipeable
        animated
        infinite
        :autoplay="9000"
        :height="carouselHeight"
        class="bg-warm-luxury full-width"
        arrows
        control-color="primary"
        transition-prev="slide-right"
        transition-next="slide-left"
      >
        <q-carousel-slide
          v-for="article in articles"
          :key="article.id"
          :name="article.slideIndex"
          class="q-pa-none flex flex-center full-height full-width overflow-hidden bg-warm-luxury"
        >
          <div class="carousel-image-frame full-width full-height relative-position flex flex-center">
            <q-img
              :src="article.imageUrl"
              class="full-width full-height"
              fit="contain"
              position="center"
              loading="lazy"
            >
              <template #error>
                <div class="absolute-full flex flex-center bg-grey-2 text-grey-6">
                  <q-icon name="image_not_supported" size="48px" />
                </div>
              </template>
            </q-img>
          </div>
        </q-carousel-slide>
      </q-carousel>
    </div>

    <!-- 2. SYNCHRONIZED STORY & ACTION PANEL (Directly Underneath the Carousel) -->
    <div v-if="currentArticle" class="carousel-story-container q-px-md q-pt-lg q-pb-md">
      <transition name="fade" mode="out-in">
        <div :key="currentArticle.id" class="column items-center text-center">
          <!-- Article Title -->
          <h3
            :class="`text-h4 text-primary font-serif text-weight-bold q-mb-sm carousel-story-title ${getTextAlignClass(currentArticle)}`"
          >
            {{ currentArticle.title }}
          </h3>

          <!-- Article Full Description (Unclamped, elegant spacing) -->
          <div
            :class="`text-body1 text-grey-8 text-weight-light carousel-story-description q-mb-md ${getTextAlignClass(currentArticle)}`"
          >
            {{ currentArticle.description }}
          </div>

          <!-- Action CTA Button -->
          <div class="row justify-center q-my-sm">
            <q-btn
              color="primary"
              text-color="white"
              :label="currentArticle.actionText || 'Scopri di più'"
              icon-right="arrow_forward"
              unelevated
              rounded
              class="carousel-story-btn text-weight-medium q-px-xl q-py-xs shadow-3"
              size="md"
              @click="openLink(currentArticle.linkUrl)"
            />
          </div>
        </div>
      </transition>

      <!-- 3. INTERACTIVE THUMBNAILS GALLERY STRIP -->
      <div v-if="articles.length > 1" class="thumbnails-gallery-strip row justify-center items-center q-gutter-sm q-mt-md">
        <div
          v-for="art in articles"
          :key="art.id"
          class="thumbnail-card cursor-pointer transition-easy"
          :class="{ 'thumbnail-active': slide === art.slideIndex }"
          @click="slide = art.slideIndex"
        >
          <q-img
            :src="art.imageUrl"
            class="rounded-borders thumbnail-img"
            fit="cover"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.font-serif {
  font-family: 'Playfair Display', serif;
}

/* Warm Luxury Background for Crisp Image Contrast */
.bg-warm-luxury {
  background: radial-gradient(circle at center, #ffffff 0%, #f7f5f0 100%) !important;
}

.carousel-full-width-wrapper {
  width: 100%;
  max-width: 100%;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.carousel-image-frame {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

/* Story & Action Panel Underneath */
.carousel-story-container {
  max-width: 860px;
  margin: 0 auto;
}

.carousel-story-title {
  letter-spacing: -0.01em;
  line-height: 1.25;
}

.carousel-story-description {
  font-size: 1.05rem;
  line-height: 1.65;
  white-space: pre-line;
  max-width: 740px;
}

.carousel-story-btn {
  letter-spacing: 0.03em;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(52, 20, 20, 0.2) !important;
  }
}

/* Thumbnails Strip */
.thumbnails-gallery-strip {
  padding-top: 8px;
}

.thumbnail-card {
  width: 68px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  opacity: 0.6;
  transition: all 0.25s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  &.thumbnail-active {
    opacity: 1;
    border-color: var(--q-primary, #341414);
    box-shadow: 0 4px 12px rgba(52, 20, 20, 0.25);
    transform: scale(1.08);
  }
}

.thumbnail-img {
  width: 100%;
  height: 100%;
}

/* Smooth Fade Transition for Text Panel */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 600px) {
  .carousel-story-title {
    font-size: 1.45rem;
  }
  .carousel-story-description {
    font-size: 0.92rem;
    line-height: 1.5;
  }
  .thumbnail-card {
    width: 52px;
    height: 38px;
  }
}
</style>
