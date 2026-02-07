<script setup lang="ts">
/**
 * @file AmbassadorPage.vue
 * @description Public Ambassador Page (Viewer).
 * @author Vasile Chifeac (AI Agent)
 * @created 2026-02-06
 * @modified 2026-02-06
 */

import { defineAsyncComponent } from 'vue';
import { useAmbassadorStore } from 'stores/ambassador';

const store = useAmbassadorStore();

// Dynamic widget loader (duplicated logic from Editor, could receive refactoring)
const getWidgetComponent = (type: string) => {
  return defineAsyncComponent({
    loader: () => import(`../components/widgets/${componentName(type)}.vue`),
  });
};

const componentName = (type: string) => {
  const map: Record<string, string> = {
    hero: 'HeroBanner',
    'product-grid': 'ProductGrid',
    testimonials: 'TestimonialsWidget',
    contact: 'ContactForm',
    video: 'VideoEmbed',
    text: 'RichText',
  };
  return map[type] || 'UnknownWidget';
};
</script>

<template>
  <q-page>
    <div v-if="store.loading" class="flex flex-center" style="height: 50vh">
      <q-spinner size="xl" color="primary" />
    </div>

    <div v-else class="row q-col-gutter-md q-pa-md bg-grey-1">
      <!-- Render Layout -->
      <div
        v-for="widget in store.layout"
        :key="widget.id"
        :class="`col-12 col-md-${widget.grid.width}`"
      >
        <component :is="getWidgetComponent(widget.type)" v-bind="widget.props" />
      </div>

      <div v-if="!store.layout.length" class="col-12 text-center q-pa-xl text-grey-6">
        <q-icon name="sentiment_dissatisfied" size="xl" class="q-mb-md" />
        <div class="text-h6">This page is getting a makeover!</div>
        <div>Check back soon.</div>
      </div>
    </div>
  </q-page>
</template>
