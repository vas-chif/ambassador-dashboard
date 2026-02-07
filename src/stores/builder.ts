/**
 * @file builder.ts
 * @description Builder store for Drag & Drop functionality.
 * @author Vasile Chifeac (AI Agent)
 * @created 2026-02-06
 * @modified 2026-02-06
 *
 * @dependencies
 * - pinia
 * - stores/ambassador
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { WidgetConfig } from 'src/types/ambassador';
import { useAmbassadorStore } from './ambassador';
import { db } from 'src/boot/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useSecureLogger } from 'src/shared/logger';
import { uid } from 'quasar';

export const useBuilderStore = defineStore('builder', () => {
  const isEditing = ref(false);
  const selectedWidgetId = ref<string | null>(null);
  const ambassadorStore = useAmbassadorStore();
  const logger = useSecureLogger();
  const saving = ref(false);

  const availableWidgets = [
    {
      type: 'hero',
      label: 'Hero Banner',
      icon: 'image',
      defaultProps: { title: 'Welcome', subtitle: 'Discover Beauty' },
    },
    {
      type: 'product-grid',
      label: 'Product Grid',
      icon: 'grid_view',
      defaultProps: { title: 'Our Products', limit: 4 },
    },
    { type: 'testimonials', label: 'Testimonials', icon: 'format_quote', defaultProps: {} },
    { type: 'contact', label: 'Contact Form', icon: 'mail', defaultProps: {} },
    { type: 'video', label: 'Video Embed', icon: 'play_circle', defaultProps: { url: '' } },
    {
      type: 'text',
      label: 'Rich Text',
      icon: 'text_fields',
      defaultProps: { content: 'Add your text here' },
    },
  ];

  const addWidget = (type: string) => {
    const widgetDef = availableWidgets.find((w) => w.type === type);
    if (!widgetDef) return;

    const newWidget: WidgetConfig = {
      id: uid(),
      type: widgetDef.type as WidgetConfig['type'],
      props: { ...widgetDef.defaultProps },
      grid: { col: 1, row: 99, width: 12, height: 4 }, // Default placement
    };

    ambassadorStore.layout.push(newWidget);
    selectWidget(newWidget.id);
    logger.info('Widget added', { type });
  };

  const removeWidget = (id: string) => {
    const index = ambassadorStore.layout.findIndex((w) => w.id === id);
    if (index !== -1) {
      ambassadorStore.layout.splice(index, 1);
      if (selectedWidgetId.value === id) {
        selectedWidgetId.value = null;
      }
      logger.info('Widget removed', { id });
    }
  };

  const selectWidget = (id: string | null) => {
    selectedWidgetId.value = id;
  };

  const saveLayout = async () => {
    if (!ambassadorStore.currentAmbassador) return;
    saving.value = true;
    try {
      await setDoc(
        doc(db, 'ambassadors', ambassadorStore.currentAmbassador.id, 'config', 'layout'),
        {
          widgets: ambassadorStore.layout,
        },
      );
      logger.info('Layout saved successfully');
    } catch (error: unknown) {
      logger.error('Error saving layout', error);
    } finally {
      saving.value = false;
    }
  };

  return {
    isEditing,
    selectedWidgetId,
    availableWidgets,
    saving,
    addWidget,
    removeWidget,
    selectWidget,
    saveLayout,
  };
});
