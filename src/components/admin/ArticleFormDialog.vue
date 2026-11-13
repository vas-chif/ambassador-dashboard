<script setup lang="ts">
/**
 * @file ArticleFormDialog.vue
 * @description Dialog for creating and editing articles with 9-quadrant spatial positioning and layout configuration.
 * @author Vasile Chifeac (AI Agent)
 */

import { ref, watch, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useSettingsStore } from 'stores/settings';
import type { Article, ArticleLayoutConfig } from 'stores/settings';
import { useSecureLogger } from 'src/shared/logger';

const props = defineProps<{
  modelValue: boolean;
  initialData?: Article | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'saved', article: Article): void;
}>();

const $q = useQuasar();
const store = useSettingsStore();
const logger = useSecureLogger();

const isEditing = computed(() => !!props.initialData?.id);
const saving = ref(false);
const articleFile = ref<File | null>(null);
const imagePreview = ref<string>('');

const form = ref<{
  id?: string;
  title: string;
  description: string;
  linkUrl: string;
  actionText: string;
  imageUrl: string;
  active: boolean;
  order: number;
  layoutConfig: ArticleLayoutConfig;
}>({
  title: '',
  description: '',
  linkUrl: '',
  actionText: 'Scopri di più',
  imageUrl: '',
  active: true,
  order: 0,
  layoutConfig: {
    articleType: 'testimonial',
    displayMode: 'below',
    horizontalAlign: 'center',
    verticalAlign: 'middle',
    boxWidth: 'md',
    textAlign: 'center',
  },
});

const setArticleType = (type: 'testimonial' | 'product') => {
  form.value.layoutConfig.articleType = type;
  if (type === 'testimonial' && form.value.layoutConfig.displayMode === 'overlay') {
    form.value.layoutConfig.displayMode = 'below';
  }
};

// 9 Quadrants definition
const QUADRANTS: Array<{
  vAlign: 'top' | 'middle' | 'bottom';
  hAlign: 'left' | 'center' | 'right';
  label: string;
  icon: string;
}> = [
  { vAlign: 'top', hAlign: 'left', label: 'Alto Sx', icon: 'north_west' },
  { vAlign: 'top', hAlign: 'center', label: 'Alto Centro', icon: 'north' },
  { vAlign: 'top', hAlign: 'right', label: 'Alto Dx', icon: 'north_east' },
  { vAlign: 'middle', hAlign: 'left', label: 'Centro Sx', icon: 'west' },
  { vAlign: 'middle', hAlign: 'center', label: 'Centro', icon: 'filter_center_focus' },
  { vAlign: 'middle', hAlign: 'right', label: 'Centro Dx', icon: 'east' },
  { vAlign: 'bottom', hAlign: 'left', label: 'Basso Sx', icon: 'south_west' },
  { vAlign: 'bottom', hAlign: 'center', label: 'Basso Centro', icon: 'south' },
  { vAlign: 'bottom', hAlign: 'right', label: 'Basso Dx', icon: 'south_east' },
];

const selectQuadrant = (vAlign: 'top' | 'middle' | 'bottom', hAlign: 'left' | 'center' | 'right') => {
  form.value.layoutConfig.verticalAlign = vAlign;
  form.value.layoutConfig.horizontalAlign = hAlign;
};

const isQuadrantSelected = (vAlign: 'top' | 'middle' | 'bottom', hAlign: 'left' | 'center' | 'right') => {
  return (
    form.value.layoutConfig.verticalAlign === vAlign &&
    form.value.layoutConfig.horizontalAlign === hAlign
  );
};

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.initialData) {
        form.value = {
          id: props.initialData.id,
          title: props.initialData.title || '',
          description: props.initialData.description || '',
          linkUrl: props.initialData.linkUrl || '',
          actionText: props.initialData.actionText || 'Scopri di più',
          imageUrl: props.initialData.imageUrl || '',
          active: props.initialData.active ?? true,
          order: props.initialData.order ?? 0,
          layoutConfig: {
            articleType: props.initialData.layoutConfig?.articleType || 'testimonial',
            displayMode: props.initialData.layoutConfig?.displayMode || 'below',
            horizontalAlign: props.initialData.layoutConfig?.horizontalAlign || 'center',
            verticalAlign: props.initialData.layoutConfig?.verticalAlign || 'middle',
            boxWidth: props.initialData.layoutConfig?.boxWidth || 'md',
            textAlign: props.initialData.layoutConfig?.textAlign || 'center',
          },
        };
        imagePreview.value = props.initialData.imageUrl || '';
      } else {
        form.value = {
          title: '',
          description: '',
          linkUrl: '',
          actionText: 'Scopri di più',
          imageUrl: '',
          active: true,
          order: store.articles.length,
          layoutConfig: {
            articleType: 'testimonial',
            displayMode: 'below',
            horizontalAlign: 'center',
            verticalAlign: 'middle',
            boxWidth: 'md',
            textAlign: 'center',
          },
        };
        imagePreview.value = '';
      }
      articleFile.value = null;
    }
  },
);

const onFileChange = (file: File | null) => {
  if (file) {
    articleFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const closeDialog = () => {
  emit('update:modelValue', false);
};

const saveArticle = async () => {
  if (!form.value.title.trim()) {
    $q.notify({ type: 'warning', message: 'Il titolo dell\'articolo è obbligatorio' });
    return;
  }

  saving.value = true;
  try {
    let finalImageUrl = form.value.imageUrl;

    if (articleFile.value) {
      finalImageUrl = await store.processBannerImage(articleFile.value);
    }

    if (!finalImageUrl) {
      $q.notify({ type: 'warning', message: 'Seleziona un\'immagine di copertina per l\'articolo' });
      saving.value = false;
      return;
    }

    const payload: Omit<Article, 'id'> = {
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      linkUrl: form.value.linkUrl.trim(),
      actionText: form.value.actionText.trim() || 'Scopri di più',
      imageUrl: finalImageUrl,
      active: form.value.active,
      order: form.value.order,
      layoutConfig: { ...form.value.layoutConfig },
    };

    if (isEditing.value && form.value.id) {
      await store.updateArticle(form.value.id, payload);
      logger.info('Article updated successfully', { id: form.value.id });
      $q.notify({ type: 'positive', message: 'Articolo aggiornato con successo!' });
      emit('saved', { id: form.value.id, ...payload });
    } else {
      await store.addArticle(payload);
      logger.info('New article added successfully');
      $q.notify({ type: 'positive', message: 'Nuovo articolo aggiunto con successo!' });
      emit('saved', { id: 'temp-' + Date.now(), ...payload });
    }

    closeDialog();
  } catch (error) {
    logger.error('Error saving article', error);
    $q.notify({ type: 'negative', message: 'Errore durante il salvataggio dell\'articolo' });
  } finally {
    saving.value = false;
  }
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
    <q-card class="bg-grey-1">
      <!-- Toolbar Header -->
      <q-toolbar class="bg-primary text-white q-py-sm">
        <q-btn flat round dense icon="close" @click="closeDialog" />
        <q-toolbar-title class="text-weight-bold">
          {{ isEditing ? 'Modifica Articolo & Layout' : 'Nuovo Articolo / Storia' }}
        </q-toolbar-title>
        <q-btn
          unelevated
          color="white"
          text-color="primary"
          icon="save"
          label="Salva Articolo"
          :loading="saving"
          @click="saveArticle"
        />
      </q-toolbar>

      <q-card-section class="q-pa-md q-pa-md-xl">
        <div class="row justify-center">
          <div class="col-12 col-md-10 col-lg-8">
            <div class="row q-col-gutter-lg">
              <!-- Left Column: Content Form -->
              <div class="col-12 col-md-7">
                <q-card flat bordered class="bg-white q-pa-md">
                  <div class="text-subtitle1 text-weight-bold q-mb-md text-primary">
                    1. Informazioni & Testi Articolo
                  </div>

                  <q-input
                    v-model="form.title"
                    label="Titolo Articolo *"
                    outlined
                    class="q-mb-md"
                    placeholder="Es. Esperienze reali | Prima e dopo"
                    :rules="[(val) => !!val || 'Campo obbligatorio']"
                  />

                  <q-input
                    v-model="form.description"
                    label="Descrizione / Storia"
                    type="textarea"
                    outlined
                    rows="4"
                    class="q-mb-md"
                    placeholder="Racconta i dettagli del trattamento, testimonianze o consigli skincare..."
                  />

                  <div class="row q-col-gutter-sm q-mb-md">
                    <div class="col-12 col-sm-6">
                      <q-input
                        v-model="form.actionText"
                        label="Testo Bottone Azione"
                        outlined
                        placeholder="Es. Scopri di più / Acquista"
                      />
                    </div>
                    <div class="col-12 col-sm-6">
                      <q-input
                        v-model="form.linkUrl"
                        label="Link di Destinazione (URL)"
                        outlined
                        placeholder="https://... oppure /admin/products"
                      />
                    </div>
                  </div>

                  <div class="row items-center justify-between q-mt-sm">
                    <q-toggle
                      v-model="form.active"
                      label="Articolo Attivo (Visibile in vetrina)"
                      color="positive"
                    />
                  </div>
                </q-card>

                <!-- Cover Image Upload -->
                <q-card flat bordered class="bg-white q-pa-md q-mt-md">
                  <div class="text-subtitle1 text-weight-bold q-mb-sm text-primary">
                    2. Immagine di Copertina
                  </div>
                  <div class="text-caption text-grey-7 q-mb-md">
                    Carica una foto 16:9 di alta qualità. Verrà compressa automaticamente per velocizzare il caricamento della pagina.
                  </div>

                  <q-file
                    v-model="articleFile"
                    label="Seleziona Immagine dal dispositivo"
                    outlined
                    accept="image/*"
                    clearable
                    @update:model-value="onFileChange"
                  >
                    <template #prepend>
                      <q-icon name="cloud_upload" />
                    </template>
                  </q-file>

                  <div v-if="imagePreview" class="q-mt-md rounded-borders overflow-hidden shadow-2">
                    <q-img :src="imagePreview" :ratio="16 / 9" fit="cover">
                      <div class="absolute-bottom text-caption text-center">
                        Anteprima Immagine
                      </div>
                    </q-img>
                  </div>
                </q-card>
              </div>

              <!-- Right Column: Layout Engine & 9-Quadrant Selector -->
              <div class="col-12 col-md-5">
                <q-card flat bordered class="bg-white q-pa-md">
                  <div class="text-subtitle1 text-weight-bold text-primary q-mb-xs">
                    3. Disposizione Immagine & Testo
                  </div>
                  <div class="text-caption text-grey-7 q-mb-md">
                    Scegli dove posizionare la descrizione rispetto all'immagine sia su Desktop che su Mobile.
                  </div>

                  <!-- Step 1: Article Category / Type (Doppia Scelta Intelligente - Opzione 3) -->
                  <div class="text-subtitle2 text-weight-bold q-mb-xs">
                    1. Tipologia Contenuto:
                  </div>
                  <div class="row q-col-gutter-xs q-mb-md">
                    <div class="col-6">
                      <q-btn
                        unelevated
                        class="full-width column flex-center q-pa-sm rounded-borders transition-easy"
                        :class="form.layoutConfig.articleType === 'testimonial' ? 'bg-primary text-white shadow-2' : 'bg-grey-2 text-grey-9'"
                        @click="setArticleType('testimonial')"
                      >
                        <q-icon name="photo_camera_front" size="1.4rem" />
                        <span class="text-caption q-mt-xs text-weight-bold text-center" style="font-size: 0.72rem">
                          📸 Testimonianza<br>Prima & Dopo
                        </span>
                      </q-btn>
                    </div>
                    <div class="col-6">
                      <q-btn
                        unelevated
                        class="full-width column flex-center q-pa-sm rounded-borders transition-easy"
                        :class="form.layoutConfig.articleType === 'product' ? 'bg-primary text-white shadow-2' : 'bg-grey-2 text-grey-9'"
                        @click="setArticleType('product')"
                      >
                        <q-icon name="sanitizer" size="1.4rem" />
                        <span class="text-caption q-mt-xs text-weight-bold text-center" style="font-size: 0.72rem">
                          🧴 Scheda Prodotto<br>Presentazione
                        </span>
                      </q-btn>
                    </div>
                  </div>

                  <!-- Step 2: Display Mode Selector (4 Modes) -->
                  <div class="text-subtitle2 text-weight-bold q-mb-xs">
                    2. Modalità di Visualizzazione:
                  </div>
                  <div class="row q-col-gutter-xs q-mb-md">
                    <div class="col-6">
                      <q-btn
                        unelevated
                        class="full-width column flex-center q-pa-sm rounded-borders transition-easy text-left"
                        :class="form.layoutConfig.displayMode === 'below' ? 'bg-primary text-white shadow-2' : 'bg-grey-2 text-grey-9'"
                        @click="form.layoutConfig.displayMode = 'below'"
                      >
                        <q-icon name="view_agenda" size="1.3rem" />
                        <span class="text-caption q-mt-xs text-weight-bold text-center" style="font-size: 0.72rem">
                          Sotto l'Immagine<br>(Consigliato Prima/Dopo)
                        </span>
                      </q-btn>
                    </div>
                    <div class="col-6">
                      <q-btn
                        unelevated
                        class="full-width column flex-center q-pa-sm rounded-borders transition-easy text-left"
                        :class="form.layoutConfig.displayMode === 'split-right' ? 'bg-primary text-white shadow-2' : 'bg-grey-2 text-grey-9'"
                        @click="form.layoutConfig.displayMode = 'split-right'"
                      >
                        <q-icon name="view_sidebar" size="1.3rem" />
                        <span class="text-caption q-mt-xs text-weight-bold text-center" style="font-size: 0.72rem">
                          Testo a Destra<br>(Affiancato 50/50)
                        </span>
                      </q-btn>
                    </div>
                    <div class="col-6 q-mt-xs">
                      <q-btn
                        unelevated
                        class="full-width column flex-center q-pa-sm rounded-borders transition-easy text-left"
                        :class="form.layoutConfig.displayMode === 'split-left' ? 'bg-primary text-white shadow-2' : 'bg-grey-2 text-grey-9'"
                        @click="form.layoutConfig.displayMode = 'split-left'"
                      >
                        <q-icon name="vertical_split" size="1.3rem" style="transform: scaleX(-1)" />
                        <span class="text-caption q-mt-xs text-weight-bold text-center" style="font-size: 0.72rem">
                          Testo a Sinistra<br>(Affiancato 50/50)
                        </span>
                      </q-btn>
                    </div>
                    <div class="col-6 q-mt-xs">
                      <q-btn
                        unelevated
                        class="full-width column flex-center q-pa-sm rounded-borders transition-easy text-left"
                        :class="form.layoutConfig.displayMode === 'overlay' ? 'bg-primary text-white shadow-2' : 'bg-grey-2 text-grey-9'"
                        @click="form.layoutConfig.displayMode = 'overlay'"
                      >
                        <q-icon name="layers" size="1.3rem" />
                        <span class="text-caption q-mt-xs text-weight-bold text-center" style="font-size: 0.72rem">
                          Sovrapposto<br>(9 Quadranti)
                        </span>
                      </q-btn>
                    </div>
                  </div>

                  <!-- Info banner for 'below' mode -->
                  <div v-if="form.layoutConfig.displayMode === 'below'" class="q-pa-sm bg-green-1 text-green-10 rounded-borders text-caption q-mb-md row items-center q-gutter-xs">
                    <q-icon name="check_circle" size="xs" color="positive" />
                    <span>
                      <strong>Visualizzazione foto completa:</strong> L'immagine resta visibile al 100% in alto senza essere coperta. Il testo e il pulsante d'azione sono posizionati sotto (come mostrato nella vista mobile).
                    </span>
                  </div>

                  <!-- 9-Quadrant Grid (Visible only when overlay is selected) -->
                  <div v-if="form.layoutConfig.displayMode === 'overlay'">
                    <div class="text-subtitle2 text-weight-bold q-mb-xs">
                      Selettore Spaziale a 9 Quadranti
                    </div>
                    <div class="text-caption text-grey-7 q-mb-sm">
                      Scegli dove collocare il riquadro di testo sopra la foto.
                    </div>
                    <div class="quadrants-grid-container q-pa-sm bg-grey-2 rounded-borders q-mb-md">
                      <div class="quadrants-grid">
                        <div
                          v-for="quad in QUADRANTS"
                          :key="quad.vAlign + '-' + quad.hAlign"
                          class="quadrant-cell column flex-center cursor-pointer transition-easy"
                          :class="{
                            'quadrant-selected text-white bg-primary shadow-2': isQuadrantSelected(quad.vAlign, quad.hAlign),
                            'bg-white text-grey-8 hover-quadrant': !isQuadrantSelected(quad.vAlign, quad.hAlign),
                          }"
                          @click="selectQuadrant(quad.vAlign, quad.hAlign)"
                        >
                          <q-icon :name="quad.icon" size="1.4rem" />
                          <span class="text-caption q-mt-xs text-weight-medium" style="font-size: 0.65rem">
                            {{ quad.label }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Box Width (for overlay or split modes) -->
                  <div v-if="form.layoutConfig.displayMode !== 'below'">
                    <q-separator class="q-my-md" />
                    <div class="text-subtitle2 text-weight-bold q-mb-xs">
                      Ampiezza Riquadro Testo (Larghezza)
                    </div>
                    <q-btn-toggle
                      v-model="form.layoutConfig.boxWidth"
                      spread
                      no-caps
                      unelevated
                      rounded
                      toggle-color="primary"
                      color="grey-2"
                      text-color="grey-9"
                      class="q-mb-md"
                      :options="[
                        { label: 'Compatta (sm)', value: 'sm' },
                        { label: 'Media (md)', value: 'md' },
                        { label: 'Larga (lg)', value: 'lg' },
                        { label: 'Piena (full)', value: 'full' },
                      ]"
                    />
                  </div>

                  <!-- Text Alignment (Always available) -->
                  <q-separator class="q-my-md" />
                  <div class="text-subtitle2 text-weight-bold q-mb-xs">
                    Allineamento del Testo
                  </div>
                  <q-btn-toggle
                    v-model="form.layoutConfig.textAlign"
                    spread
                    no-caps
                    unelevated
                    rounded
                    toggle-color="primary"
                    color="grey-2"
                    text-color="grey-9"
                    class="q-mb-md"
                    :options="[
                      { label: 'Sinistra', value: 'left', icon: 'format_align_left' },
                      { label: 'Centro', value: 'center', icon: 'format_align_center' },
                      { label: 'Destra', value: 'right', icon: 'format_align_right' },
                    ]"
                  />

                  <!-- Visual Summary Card -->
                  <div class="q-pa-sm bg-blue-1 text-blue-9 rounded-borders text-caption row items-center q-gutter-xs">
                    <q-icon name="info" size="xs" />
                    <span>
                      Disposizione: <strong>{{ form.layoutConfig.displayMode }}</strong> | Allineamento: <strong>{{ form.layoutConfig.textAlign }}</strong>
                    </span>
                  </div>
                </q-card>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.quadrants-grid-container {
  border: 1px solid #e5e7eb;
}

.quadrants-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.quadrant-cell {
  height: 64px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  user-select: none;

  &:hover {
    border-color: var(--q-primary);
  }
}

.quadrant-selected {
  border-color: var(--q-primary);
}

.hover-quadrant:hover {
  background-color: #f3f4f6 !important;
}

.transition-easy {
  transition: all 0.2s ease-in-out;
}
</style>

