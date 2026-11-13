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

const openLink = (url: string) => {
  if (!url) return;
  if (url.startsWith('http')) {
    window.open(url, '_blank');
  } else {
    void router.push(url);
  }
};

const getDisplayMode = (article: Article): 'below' | 'split-right' | 'split-left' | 'overlay' => {
  return article.layoutConfig?.displayMode || 'below';
};

const currentArticle = computed(() => {
  return articles.value.find((a) => a.slideIndex === slide.value) || articles.value[0];
});

const desktopCarouselHeight = computed(() => {
  if (!currentArticle.value) return '660px';
  const mode = getDisplayMode(currentArticle.value);
  if (mode === 'below') {
    return 'clamp(640px, 80vh, 850px)';
  }
  if (mode === 'overlay') {
    return 'clamp(520px, 70vh, 720px)';
  }
  return 'clamp(520px, 68vh, 700px)';
});

const getQuadrantPlacementClass = (article: Article) => {
  const v = article.layoutConfig?.verticalAlign || 'middle';
  const h = article.layoutConfig?.horizontalAlign || 'center';
  const vClass = v === 'top' ? 'items-start' : v === 'bottom' ? 'items-end overlay-bottom-spacing' : 'items-center';
  const hClass = h === 'left' ? 'justify-start' : h === 'right' ? 'justify-end' : 'justify-center';
  return `${vClass} ${hClass} q-pa-lg`;
};

const getOverlayWidthClass = (article: Article) => {
  const w = article.layoutConfig?.boxWidth || 'md';
  if (w === 'sm') return 'overlay-width-sm';
  if (w === 'lg') return 'overlay-width-lg';
  if (w === 'full') return 'full-width';
  return 'overlay-width-md';
};

const getContentColClass = (article: Article) => {
  const width = article.layoutConfig?.boxWidth;
  if (width === 'sm') return 'col-md-5';
  if (width === 'lg') return 'col-md-9';
  if (width === 'full') return 'col-md-10';
  return 'col-md-7';
};

const getImageColClass = (article: Article) => {
  const width = article.layoutConfig?.boxWidth;
  if (width === 'sm') return 'col-md-7';
  if (width === 'lg') return 'col-md-3';
  if (width === 'full') return 'col-md-2';
  return 'col-md-5';
};

const getJustifyClass = (article: Article) => {
  const vAlign = article.layoutConfig?.verticalAlign;
  if (vAlign === 'top') return 'justify-start q-gutter-y-md';
  if (vAlign === 'middle') return 'justify-center q-gutter-y-md';
  if (vAlign === 'bottom') return 'justify-end q-gutter-y-md';
  return 'justify-between';
};

const getTextAlignClass = (article: Article) => {
  const tAlign = article.layoutConfig?.textAlign;
  if (tAlign === 'left') return 'text-left items-start';
  if (tAlign === 'right') return 'text-right items-end';
  return 'text-center items-center';
};
</script>

<template>
  <div v-if="articles.length > 0" class="full-width q-mb-xl">
    <q-separator class="q-mb-lg" />

    <div class="row justify-center">
      <div class="col-12 q-px-sm max-width-carousel relative-position">
        <!-- In-Place Quick Edit Current Article (Preview Mode Only) -->
        <div v-if="isPreview && currentArticle" class="carousel-quick-edit-action absolute-top-right q-ma-sm" style="z-index: 25">
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
            <q-tooltip>Modifica layout, testi e foto dell'articolo visibile</q-tooltip>
          </q-btn>
        </div>

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
              <!-- Top: Image (44%) - 100% visible before/after photo -->
              <div class="mobile-carousel-image bg-white">
                <q-img
                  :src="article.imageUrl"
                  class="full-width full-height"
                  fit="contain"
                  position="center"
                />
              </div>

              <!-- Bottom: Content (56%) -->
              <div class="mobile-carousel-content column q-px-lg q-py-md bg-white">
                <!-- Title -->
                <div
                  :class="`text-h6 text-weight-bold text-primary font-serif q-mb-sm ${getTextAlignClass(article)}`"
                >
                  {{ article.title }}
                </div>

                <!-- Description -->
                <div
                  :class="`text-body2 text-grey-8 q-mb-md mobile-description-clamp ${getTextAlignClass(article)}`"
                  style="line-height: 1.4"
                >
                  {{ article.description }}
                </div>

                <!-- Button (Fixed at Bottom) -->
                <div
                  :class="`row q-mt-auto ${article.layoutConfig?.textAlign === 'right' ? 'justify-end' : article.layoutConfig?.textAlign === 'left' ? 'justify-start' : 'justify-center'}`"
                >
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

        <!-- DESKTOP: Multi-Mode Carousel -->
        <q-carousel
          v-else
          v-model="slide"
          swipeable
          animated
          thumbnails
          infinite
          :autoplay="10000"
          :height="desktopCarouselHeight"
          class="bg-white shadow-2 rounded-borders overflow-hidden transition-height"
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
            :class="{ 'slide-clean-bg': getDisplayMode(article) !== 'overlay' }"
          >
            <!-- 1. MODE 'below': Stacked with 100% visible image on top, text below (like mobile) -->
            <div
              v-if="getDisplayMode(article) === 'below'"
              class="column full-height bg-white overflow-hidden"
            >
              <!-- Top: Image (52% height, clean, 100% visible before/after photo) -->
              <div class="desktop-below-image-container relative-position bg-white" style="height: 52%; flex-shrink: 0">
                <q-img
                  :src="article.imageUrl"
                  class="full-width full-height"
                  fit="contain"
                  position="center"
                />
              </div>

              <!-- Bottom: Content (48% height with clearance for thumbnails) -->
              <div class="column flex-1 q-px-xl q-py-md bg-white justify-between carousel-below-content">
                <div>
                  <div
                    :class="`carousel-title text-weight-bold text-primary font-serif q-mb-xs ${getTextAlignClass(article)}`"
                  >
                    {{ article.title }}
                  </div>
                  <div
                    :class="`carousel-description text-grey-8 text-weight-light ${getTextAlignClass(article)}`"
                    style="line-height: 1.45"
                  >
                    {{ article.description }}
                  </div>
                </div>

                <div
                  :class="`row q-mt-md ${article.layoutConfig?.textAlign === 'right' ? 'justify-end' : article.layoutConfig?.textAlign === 'left' ? 'justify-start' : 'justify-center'}`"
                >
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

            <!-- 2. MODE 'split-right': Side-by-side (Image Left, Content Right) -->
            <div
              v-else-if="getDisplayMode(article) === 'split-right'"
              class="row full-height bg-white"
            >
              <div :class="`col-12 ${getImageColClass(article)} carousel-image-col relative-position bg-grey-1`">
                <q-img
                  :src="article.imageUrl"
                  class="full-height full-width"
                  fit="cover"
                  position="center"
                />
              </div>
              <div :class="`col-12 ${getContentColClass(article)} carousel-content-col bg-white text-black carousel-padding`">
                <div :class="`column full-height ${getJustifyClass(article)}`">
                  <div :class="`carousel-title text-weight-bold text-primary font-serif ${getTextAlignClass(article)}`">
                    {{ article.title }}
                  </div>
                  <div :class="`carousel-description text-grey-8 text-weight-light carousel-desc-padding description-clamped ${getTextAlignClass(article)}`">
                    {{ article.description }}
                  </div>
                  <div :class="`carousel-button-container carousel-button-padding row ${article.layoutConfig?.textAlign === 'right' ? 'justify-end' : article.layoutConfig?.textAlign === 'left' ? 'justify-start' : 'justify-center'}`">
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

            <!-- 3. MODE 'split-left': Side-by-side (Content Left, Image Right) -->
            <div
              v-else-if="getDisplayMode(article) === 'split-left'"
              class="row full-height bg-white"
            >
              <div :class="`col-12 ${getContentColClass(article)} carousel-content-col bg-white text-black carousel-padding`">
                <div :class="`column full-height ${getJustifyClass(article)}`">
                  <div :class="`carousel-title text-weight-bold text-primary font-serif ${getTextAlignClass(article)}`">
                    {{ article.title }}
                  </div>
                  <div :class="`carousel-description text-grey-8 text-weight-light carousel-desc-padding description-clamped ${getTextAlignClass(article)}`">
                    {{ article.description }}
                  </div>
                  <div :class="`carousel-button-container carousel-button-padding row ${article.layoutConfig?.textAlign === 'right' ? 'justify-end' : article.layoutConfig?.textAlign === 'left' ? 'justify-start' : 'justify-center'}`">
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
              <div :class="`col-12 ${getImageColClass(article)} carousel-image-col relative-position bg-grey-1`">
                <q-img
                  :src="article.imageUrl"
                  class="full-height full-width"
                  fit="cover"
                  position="center"
                />
              </div>
            </div>

            <!-- 4. MODE 'overlay': Floating box positioned with 9 Quadrants -->
            <div
              v-else
              class="row full-height relative-position"
              :class="getQuadrantPlacementClass(article)"
            >
              <div :class="`carousel-overlay-box bg-white text-black shadow-4 rounded-borders q-pa-lg ${getOverlayWidthClass(article)}`">
                <div :class="`carousel-title text-weight-bold text-primary font-serif q-mb-sm ${getTextAlignClass(article)}`">
                  {{ article.title }}
                </div>
                <div :class="`carousel-description text-grey-8 text-weight-light q-mb-md ${getTextAlignClass(article)}`">
                  {{ article.description }}
                </div>
                <div :class="`row ${article.layoutConfig?.textAlign === 'right' ? 'justify-end' : article.layoutConfig?.textAlign === 'left' ? 'justify-start' : 'justify-center'}`">
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

.overlay-width-sm {
  max-width: 420px;
}
.overlay-width-md {
  max-width: 580px;
}
.overlay-width-lg {
  max-width: 760px;
}

.carousel-overlay-box {
  background: rgba(255, 255, 255, 0.96) !important;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.max-width-carousel {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

.slide-clean-bg {
  background-image: none !important;
  background-color: #ffffff !important;
}

.carousel-below-content {
  padding-bottom: 5.5rem !important;
}

.overlay-bottom-spacing {
  padding-bottom: 5.5rem !important;
}

.transition-height {
  transition: height 0.3s ease;
}

/* Adjust for carousel thumbnails */
:deep(.q-carousel__control--thumbnails) {
  background: white;
  padding-bottom: 6px;
  z-index: 15;
}
</style>
