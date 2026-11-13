<script setup lang="ts">
/**
 * @file ArticleFormDialog.vue
 * @description Dialog snello e moderno per la creazione e modifica di articoli e testimonianze,
 * coordinato con l'architettura carosello full-width e scheda narrativa sincronizzata.
 * @author Vasile Chifeac (AI Agent)
 */

import { ref, watch, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useArticlesStore } from 'stores/articles';
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
const store = useArticlesStore();
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
    textAlign: 'center',
  },
});

const setArticleType = (type: 'testimonial' | 'product') => {
  form.value.layoutConfig.articleType = type;
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
            displayMode: 'below',
            textAlign: props.initialData.layoutConfig?.textAlign || 'center',
          },
        };
        imagePreview.value = props.initialData.imageUrl || '';
      } else {
        // Nuovo Articolo
        form.value = {
          title: '',
          description: '',
          linkUrl: '',
          actionText: 'Scopri di più',
          imageUrl: '',
          active: true,
          order: (store.articles || []).length,
          layoutConfig: {
            articleType: 'testimonial',
            displayMode: 'below',
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
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.value = form.value.imageUrl || '';
  }
};

const onSubmit = async () => {
  if (!form.value.title.trim()) {
    $q.notify({ type: 'warning', message: 'Inserisci un titolo per l\'articolo' });
    return;
  }

  saving.value = true;
  try {
    let finalImageUrl = form.value.imageUrl;

    if (articleFile.value) {
      $q.loading.show({ message: 'Compressione e caricamento immagine in corso...' });
      const uploadedUrl = await store.processBannerImage(articleFile.value);
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      }
      $q.loading.hide();
    }

    const payload: Partial<Article> = {
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      linkUrl: form.value.linkUrl.trim(),
      actionText: form.value.actionText.trim() || 'Scopri di più',
      imageUrl: finalImageUrl,
      active: form.value.active,
      order: form.value.order,
      layoutConfig: {
        articleType: form.value.layoutConfig.articleType || 'testimonial',
        displayMode: 'below',
        textAlign: form.value.layoutConfig.textAlign || 'center',
      },
    };

    if (isEditing.value && form.value.id) {
      await store.updateArticle(form.value.id, payload);
      $q.notify({ type: 'positive', message: 'Articolo aggiornato con successo' });
    } else {
      await store.addArticle(payload as Omit<Article, 'id'>);
      $q.notify({ type: 'positive', message: 'Nuovo articolo aggiunto con successo' });
    }

    emit('saved', { ...(payload as Article), id: form.value.id || 'temp' });
    emit('update:modelValue', false);
  } catch (err: unknown) {
    logger.error('Errore nel salvataggio dell\'articolo:', err);
    $q.notify({
      type: 'negative',
      message: 'Impossibile salvare l\'articolo. Riprova più tardi.',
    });
  } finally {
    saving.value = false;
    $q.loading.hide();
  }
};
</script>

<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="bg-grey-1 column full-height">
      <!-- Toolbar Header -->
      <q-toolbar class="bg-primary text-white q-py-sm">
        <q-btn flat round dense icon="close" v-close-popup>
          <q-tooltip>Chiudi senza salvare</q-tooltip>
        </q-btn>
        <q-toolbar-title class="text-weight-bold">
          <q-icon :name="isEditing ? 'edit_note' : 'post_add'" class="q-mr-sm" size="sm" />
          {{ isEditing ? 'Modifica Articolo / Testimonianza' : 'Nuovo Articolo / Testimonianza' }}
        </q-toolbar-title>
        <q-btn
          flat
          label="Salva Modifiche"
          icon="save"
          :loading="saving"
          class="bg-white text-primary text-weight-bold shadow-2 q-px-md"
          @click="onSubmit"
        />
      </q-toolbar>

      <!-- Scrollable Form Body -->
      <q-card-section class="col q-pa-md scroll">
        <div class="row q-col-gutter-lg justify-center" style="max-width: 1200px; margin: 0 auto">
          <!-- Left Column: Content Information -->
          <div class="col-12 col-md-7">
            <q-card flat bordered class="bg-white q-pa-lg">
              <div class="text-subtitle1 text-weight-bold q-mb-md text-primary row items-center">
                <q-icon name="article" class="q-mr-xs" />
                1. Informazioni & Testi
              </div>

              <q-input
                v-model="form.title"
                label="Titolo Articolo *"
                outlined
                class="q-mb-md"
                placeholder="Es. Esperienze reali | Prima e dopo"
                :rules="[(val) => !!val || 'Il titolo è obbligatorio']"
              />

              <q-input
                v-model="form.description"
                label="Descrizione / Testimonianza Narrativa"
                type="textarea"
                outlined
                rows="5"
                class="q-mb-md"
                placeholder="Racconta i dettagli del trattamento, consigli skincare o la storia di miglioramento..."
              />

              <div class="row q-col-gutter-sm q-mb-md">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="form.actionText"
                    label="Testo Bottone Azione"
                    outlined
                    placeholder="Es. Scopri la tua routine / Contattami su WhatsApp"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="form.linkUrl"
                    label="Link di Destinazione (URL WhatsApp o pagina)"
                    outlined
                    placeholder="https://wa.me/... oppure https://..."
                  />
                </div>
              </div>

              <div class="row items-center justify-between q-mt-sm q-pt-sm bg-grey-1 q-pa-sm rounded-borders">
                <div class="text-caption text-grey-8">
                  Attiva o disattiva la visibilità di questa storia nella vetrina pubblica:
                </div>
                <q-toggle
                  v-model="form.active"
                  :label="form.active ? 'Articolo Attivo' : 'Nascosto'"
                  color="positive"
                />
              </div>
            </q-card>

            <!-- Cover Image Upload -->
            <q-card flat bordered class="bg-white q-pa-lg q-mt-md">
              <div class="text-subtitle1 text-weight-bold q-mb-sm text-primary row items-center">
                <q-icon name="add_photo_alternate" class="q-mr-xs" />
                2. Immagine di Copertina Full-Width
              </div>
              <div class="text-caption text-grey-7 q-mb-md">
                Carica la foto della testimonianza (es. collage prima/dopo) o del flacone prodotto.
                Grazie al nuovo layout full-width, la foto sarà visibile al 100% senza essere coperta da testi.
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

              <div v-if="imagePreview" class="q-mt-md rounded-borders overflow-hidden shadow-2 bg-grey-2">
                <q-img :src="imagePreview" :ratio="16 / 9" fit="contain">
                  <div class="absolute-bottom text-caption text-center">
                    Anteprima Immagine
                  </div>
                </q-img>
              </div>
            </q-card>
          </div>

          <!-- Right Column: Settings & Live Preview -->
          <div class="col-12 col-md-5">
            <q-card flat bordered class="bg-white q-pa-lg">
              <div class="text-subtitle1 text-weight-bold text-primary q-mb-xs row items-center">
                <q-icon name="tune" class="q-mr-xs" />
                3. Impostazioni & Presentazione
              </div>
              <div class="text-caption text-grey-7 q-mb-md">
                Personalizza la classificazione e lo stile della scheda sincronizzata.
              </div>

              <!-- Article Category / Type -->
              <div class="text-subtitle2 text-weight-bold q-mb-xs text-grey-9">
                Tipologia Contenuto:
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
                    <span class="text-caption q-mt-xs text-weight-bold text-center" style="font-size: 0.75rem">
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
                    <span class="text-caption q-mt-xs text-weight-bold text-center" style="font-size: 0.75rem">
                      🧴 Scheda Prodotto<br>Presentazione
                    </span>
                  </q-btn>
                </div>
              </div>

              <!-- Text Alignment -->
              <div class="text-subtitle2 text-weight-bold q-mb-xs text-grey-9">
                Allineamento Testo Sottostante:
              </div>
              <q-btn-toggle
                v-model="form.layoutConfig.textAlign"
                toggle-color="primary"
                flat
                dense
                no-caps
                class="full-width bg-grey-2 rounded-borders q-mb-md"
                :options="[
                  { label: 'A Sinistra', value: 'left', icon: 'format_align_left' },
                  { label: 'Al Centro', value: 'center', icon: 'format_align_center' },
                  { label: 'A Destra', value: 'right', icon: 'format_align_right' },
                ]"
              />

              <!-- Live Card Preview -->
              <div class="text-subtitle2 text-weight-bold q-mb-xs text-grey-9">
                Anteprima Scheda Coordinata:
              </div>
              <div
                class="bg-grey-1 rounded-borders q-pa-md border shadow-1 column transition-easy"
                :class="form.layoutConfig.textAlign === 'left' ? 'items-start text-left' : form.layoutConfig.textAlign === 'right' ? 'items-end text-right' : 'items-center text-center'"
              >
                <!-- Badge Tipologia Contenuto -->
                <q-chip
                  dense
                  outline
                  size="sm"
                  :color="form.layoutConfig.articleType === 'product' ? 'secondary' : 'primary'"
                  class="q-mb-xs text-weight-medium"
                >
                  <q-icon
                    :name="form.layoutConfig.articleType === 'product' ? 'sanitizer' : 'photo_camera_front'"
                    size="12px"
                    class="q-mr-xs"
                  />
                  {{ form.layoutConfig.articleType === 'product' ? 'Scheda Prodotto' : 'Testimonianza Prima & Dopo' }}
                </q-chip>

                <div class="text-h6 text-primary font-serif text-weight-bold q-mb-xs full-width">
                  {{ form.title || 'Titolo della Storia' }}
                </div>
                <div class="text-caption text-grey-7 q-mb-sm line-clamp-3 full-width" style="max-height: 60px; overflow: hidden">
                  {{ form.description || 'La descrizione comparirà qui sotto all\'immagine in tempo reale...' }}
                </div>
                <div
                  class="row full-width q-my-xs"
                  :class="form.layoutConfig.textAlign === 'left' ? 'justify-start' : form.layoutConfig.textAlign === 'right' ? 'justify-end' : 'justify-center'"
                >
                  <q-btn
                    color="primary"
                    unelevated
                    rounded
                    size="sm"
                    :label="form.actionText || 'Scopri di più'"
                    icon-right="arrow_forward"
                    class="q-px-md"
                  />
                </div>
              </div>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.font-serif {
  font-family: 'Playfair Display', serif;
}

.transition-easy {
  transition: all 0.2s ease;
}
</style>
