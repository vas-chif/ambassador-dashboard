<script setup lang="ts">
/**
 * @file PageEditor.vue
 * @description Drag & Drop Page Editor.
 * @author Vasile Chifeac (AI Agent)
 * @created 2026-02-06
 * @modified 2026-02-06
 */

import { VueDraggableNext as Draggable } from 'vue-draggable-next';
import { useBuilderStore } from 'stores/builder';
import { useAmbassadorStore } from 'stores/ambassador';
import { defineAsyncComponent } from 'vue';

const builderStore = useBuilderStore();
const ambassadorStore = useAmbassadorStore();

// Dynamic widget loader
const getWidgetComponent = (type: string) => {
  return defineAsyncComponent({
    loader: () => import(`../widgets/${componentName(type)}.vue`),
    // Fallback or error handling can be added here
  });
};

const componentName = (type: string) => {
  // Map internal types to filenames if needed (PascalCase)
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

const onDrop = () => {
  // Handle drop logic if needed beyond draggable's default
};

const themePalette = [
  { name: 'Luxury Gold', hex: '#D4AF37' },
  { name: 'Classic Taupe', hex: '#483C32' },
  { name: 'Deep Blue', hex: '#1A237E' },
  { name: 'Charcoal', hex: '#263238' },
];

const setTheme = async (hex: string) => {
  try {
    await ambassadorStore.updateTheme(hex);
  } catch (e) {
    console.error(e);
  }
};
</script>

<template>
  <div class="editor-container row">
    <!-- Sidebar / Toolbar -->
    <div class="col-3 q-pa-md bg-grey-2 border-r" v-if="builderStore.isEditing">
      <div class="text-h6 q-mb-md">Widgets</div>
      <div class="row q-col-gutter-sm">
        <div v-for="widget in builderStore.availableWidgets" :key="widget.type" class="col-6">
          <q-card
            class="cursor-pointer hover:bg-grey-3 text-center q-py-sm"
            @click="builderStore.addWidget(widget.type)"
          >
            <q-icon :name="widget.icon" size="md" />
            <div class="text-caption">{{ widget.label }}</div>
          </q-card>
        </div>
      </div>
      <q-separator class="q-my-md" />

      <div class="text-h6 q-mb-sm">Page Style</div>
      <div class="row q-gutter-sm q-mb-md">
        <div
          v-for="color in themePalette"
          :key="color.hex"
          class="palette-swatch cursor-pointer relative-position"
          :style="{ backgroundColor: color.hex }"
          @click="setTheme(color.hex)"
        >
          <q-tooltip>{{ color.name }}</q-tooltip>
          <q-icon
            v-if="ambassadorStore.currentAmbassador?.themeColor === color.hex"
            name="check"
            color="white"
            class="absolute-center"
          />
        </div>
      </div>

      <q-separator class="q-my-md" />

      <q-btn
        color="primary"
        class="full-width"
        label="Save Layout"
        :loading="builderStore.saving"
        @click="builderStore.saveLayout"
      />
    </div>

    <!-- Canvas -->
    <div class="col bg-grey-1 q-pa-md relative-position">
      <div class="grid-layout">
        <!-- Draggable Wrapper -->
        <!--
                 Simple implementation: Just a list for now,
                 Actual 12-col grid drag & drop is complex with vue-draggable alone.
                 We will use a flex-wrap list that simulates a grid or simple vertical stacking for V1.
                 Refactoring to true grid requires specific grid-stack libraries or complex logic.
            -->
        <Draggable
          class="drag-area row q-col-gutter-md"
          :list="ambassadorStore.layout"
          @change="onDrop"
          handle=".drag-handle"
        >
          <div
            v-for="element in ambassadorStore.layout"
            :key="element.id"
            :class="`col-12 col-md-${element.grid.width}`"
          >
            <q-card class="relative-position overflow-hidden widget-card">
              <!-- Edit Overlay -->
              <div v-if="builderStore.isEditing" class="absolute-top-right z-top q-pa-xs">
                <q-btn size="sm" round flat icon="drag_indicator" class="drag-handle cursor-move" />
                <q-btn
                  size="sm"
                  round
                  flat
                  icon="delete"
                  color="negative"
                  @click="builderStore.removeWidget(element.id)"
                />
              </div>

              <!-- Render Widget -->
              <component :is="getWidgetComponent(element.type)" v-bind="element.props" />
            </q-card>
          </div>
        </Draggable>

        <div v-if="!ambassadorStore.layout.length" class="text-center q-pa-xl text-grey">
          Empty Page. Add widgets from the sidebar.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.editor-container {
  min-height: calc(100vh - 50px);
}
.border-r {
  border-right: 1px solid #e0e0e0;
}
.widget-card {
  min-height: 100px;
  border: 1px dashed transparent;
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--q-primary);
  }
}
.palette-swatch {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
}
</style>
