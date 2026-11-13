<script setup lang="ts">
/**
 * @file SectionSettingsDialog.vue
 * @description Modale espandibile per la configurazione approfondita delle singole sezioni (tipografia, banner, drag-and-drop articoli).
 * @author Vasile Chifeac (AI Agent)
 */

import { ref, watch, computed } from 'vue';
import type { CustomSectionConfig, PublicProfile, Article } from 'stores/settings';

const props = defineProps<{
  modelValue: boolean;
  sectionId: string;
  customConfig: CustomSectionConfig;
  profile: PublicProfile;
  articles: Article[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save', sectionId: string, config: CustomSectionConfig, profileUpdates?: Partial<PublicProfile>): void;
  (e: 'quick-add', type: 'articles' | 'products'): void;
  (e: 'open-edit-article', article: Article): void;
  (e: 'reorder-articles', articles: Article[]): void;
  (e: 'toggle-article-active', article: Article): void;
}>();

const isSettingsDialogWide = ref(false);
const isSettingsDialogMaximized = ref(false);
const draggedArticleIndex = ref<number | null>(null);

const form = ref<{
  productsTitle: string;
  bannerText: string;
  bannerButtonText: string;
  bannerUrl: string;
  bannerEnabled: boolean;
  profileName: string;
  profileBio: string;
  profileWhatsapp: string;
  profileInstagram: string;
  profileTiktok: string;
  profileEmail: string;
  articleFilterType: 'all' | 'testimonial' | 'product';
  profileTextAlign: 'left' | 'center' | 'right' | 'justify';
  profileFontFamily: 'serif' | 'sans';
  profileFontWeight: 'light' | 'normal' | 'bold';
  profileTitleSize: 'h2' | 'h3' | 'h4';
  profileMaxWidth: 'sm' | 'md' | 'lg' | 'full';
  profileShowAvatar: boolean;
  profileShowSocials: boolean;
}>({
  productsTitle: '',
  bannerText: '',
  bannerButtonText: '',
  bannerUrl: '',
  bannerEnabled: true,
  profileName: '',
  profileBio: '',
  profileWhatsapp: '',
  profileInstagram: '',
  profileTiktok: '',
  profileEmail: '',
  articleFilterType: 'all',
  profileTextAlign: 'center',
  profileFontFamily: 'serif',
  profileFontWeight: 'normal',
  profileTitleSize: 'h2',
  profileMaxWidth: 'md',
  profileShowAvatar: true,
  profileShowSocials: true,
});

const sectionType = computed(() => {
  if (props.sectionId.startsWith('profile')) return 'profile';
  if (props.sectionId.startsWith('articles')) return 'articles';
  if (props.sectionId.startsWith('actionBanner')) return 'actionBanner';
  if (props.sectionId.startsWith('products')) return 'products';
  return 'profile';
});

const sectionLabel = computed(() => {
  const isCustom = !['profile', 'articles', 'actionBanner', 'products'].includes(props.sectionId);
  const type = sectionType.value;
  if (type === 'profile') return isCustom ? 'Profilo & Filosofia (Extra)' : 'Profilo & Social';
  if (type === 'articles') return isCustom ? 'Carosello Articoli (Extra)' : 'Carosello Articoli';
  if (type === 'actionBanner') return isCustom ? 'Banner Azione (Extra)' : 'Banner Promozionale';
  if (type === 'products') return isCustom ? 'Griglia Prodotti (Extra)' : 'Griglia Prodotti';
  return props.sectionId;
});

const sectionIcon = computed(() => {
  const type = sectionType.value;
  if (type === 'profile') return 'person';
  if (type === 'articles') return 'view_carousel';
  if (type === 'actionBanner') return 'smart_button';
  if (type === 'products') return 'grid_view';
  return 'dashboard';
});

const dialogCardStyle = computed(() => {
  if (isSettingsDialogMaximized.value) {
    return { width: '100vw', height: '100vh', borderRadius: '0px' };
  }
  const w = isSettingsDialogWide.value ? '780px' : '520px';
  return {
    width: w,
    maxWidth: '96vw',
    maxHeight: '90vh',
    borderRadius: '12px',
    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  };
});

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      const cfg = props.customConfig || {};
      const prof = props.profile || ({} as PublicProfile);

      form.value = {
        productsTitle: cfg.title || prof.productsSectionTitle || '',
        bannerText: cfg.bannerText || prof.actionBannerText || '',
        bannerButtonText: cfg.bannerButtonText || prof.actionBannerButtonText || '',
        bannerUrl: cfg.bannerUrl || prof.actionBannerUrl || '',
        bannerEnabled: cfg.bannerEnabled ?? (prof.actionBannerEnabled ?? true),
        profileName: cfg.title || prof.name || '',
        profileBio: cfg.bio || prof.bio || '',
        profileWhatsapp: prof.whatsapp || '',
        profileInstagram: prof.instagram || '',
        profileTiktok: prof.tiktok || '',
        profileEmail: prof.email || '',
        articleFilterType: cfg.articleFilterType || 'all',
        profileTextAlign: cfg.textAlign || 'center',
        profileFontFamily: cfg.fontFamily || 'serif',
        profileFontWeight: cfg.fontWeight || 'normal',
        profileTitleSize: cfg.titleSize || 'h2',
        profileMaxWidth: cfg.maxWidth || 'md',
        profileShowAvatar: cfg.showAvatar ?? true,
        profileShowSocials: cfg.showSocials ?? true,
      };
    }
  },
);

const onArticleDragStart = (idx: number) => {
  draggedArticleIndex.value = idx;
};

const onArticleDrop = (targetIdx: number) => {
  if (draggedArticleIndex.value === null || draggedArticleIndex.value === targetIdx) return;
  const list = [...props.articles];
  const [removed] = list.splice(draggedArticleIndex.value, 1);
  if (removed) {
    list.splice(targetIdx, 0, removed);
    emit('reorder-articles', list);
  }
  draggedArticleIndex.value = null;
};

const moveArticle = (idx: number, direction: 'up' | 'down') => {
  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= props.articles.length) return;
  const list = [...props.articles];
  const temp = list[idx];
  const targetItem = list[targetIdx];
  if (temp && targetItem) {
    list[idx] = targetItem;
    list[targetIdx] = temp;
    emit('reorder-articles', list);
  }
};

const onSave = () => {
  const type = sectionType.value;
  const isDefaultSection = ['profile', 'articles', 'actionBanner', 'products'].includes(props.sectionId);

  const updatedConfig: CustomSectionConfig = {
    ...props.customConfig,
  };

  const profileUpdates: Partial<PublicProfile> = {};

  if (type === 'products') {
    updatedConfig.title = form.value.productsTitle.trim();
    if (isDefaultSection) {
      profileUpdates.productsSectionTitle = form.value.productsTitle.trim();
    }
  } else if (type === 'actionBanner') {
    updatedConfig.bannerText = form.value.bannerText.trim();
    updatedConfig.bannerButtonText = form.value.bannerButtonText.trim();
    updatedConfig.bannerUrl = form.value.bannerUrl.trim();
    updatedConfig.bannerEnabled = form.value.bannerEnabled;

    if (isDefaultSection) {
      profileUpdates.actionBannerText = form.value.bannerText.trim();
      profileUpdates.actionBannerButtonText = form.value.bannerButtonText.trim();
      profileUpdates.actionBannerUrl = form.value.bannerUrl.trim();
      profileUpdates.actionBannerEnabled = form.value.bannerEnabled;
    }
  } else if (type === 'profile') {
    updatedConfig.title = form.value.profileName.trim();
    updatedConfig.bio = form.value.profileBio.trim();
    updatedConfig.textAlign = form.value.profileTextAlign;
    updatedConfig.fontFamily = form.value.profileFontFamily;
    updatedConfig.fontWeight = form.value.profileFontWeight;
    updatedConfig.titleSize = form.value.profileTitleSize;
    updatedConfig.maxWidth = form.value.profileMaxWidth;
    updatedConfig.showAvatar = form.value.profileShowAvatar;
    updatedConfig.showSocials = form.value.profileShowSocials;

    if (isDefaultSection) {
      profileUpdates.name = form.value.profileName.trim();
      profileUpdates.bio = form.value.profileBio.trim();
      profileUpdates.whatsapp = form.value.profileWhatsapp.trim();
      profileUpdates.instagram = form.value.profileInstagram.trim();
      profileUpdates.tiktok = form.value.profileTiktok.trim();
      profileUpdates.email = form.value.profileEmail.trim();
    }
  } else if (type === 'articles') {
    updatedConfig.articleFilterType = form.value.articleFilterType;
  }

  emit('save', props.sectionId, updatedConfig, profileUpdates);
  emit('update:modelValue', false);
};
</script>

<template>
  <q-dialog
    :model-value="modelValue"
    :maximized="isSettingsDialogMaximized"
    transition-show="jump-down"
    transition-hide="jump-up"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card :style="dialogCardStyle" class="column no-wrap overflow-hidden">
      <!-- Toolbar Header with Maximize & Expand Controls -->
      <q-toolbar class="bg-primary text-white q-py-xs">
        <q-icon :name="sectionIcon" size="22px" class="q-mr-sm" />
        <q-toolbar-title class="text-subtitle1 text-weight-bold">
          Impostazioni: {{ sectionLabel }}
        </q-toolbar-title>

        <!-- Toggle Width Mode (Compact 520px / Wide 780px) -->
        <q-btn
          v-if="!isSettingsDialogMaximized"
          flat
          round
          dense
          :icon="isSettingsDialogWide ? 'unfold_less' : 'unfold_more'"
          class="q-mr-xs"
          @click="isSettingsDialogWide = !isSettingsDialogWide"
        >
          <q-tooltip>{{ isSettingsDialogWide ? 'Riduci larghezza (520px)' : 'Espandi larghezza (780px)' }}</q-tooltip>
        </q-btn>

        <!-- Toggle Fullscreen Maximize -->
        <q-btn
          flat
          round
          dense
          :icon="isSettingsDialogMaximized ? 'fullscreen_exit' : 'fullscreen'"
          class="q-mr-xs"
          @click="isSettingsDialogMaximized = !isSettingsDialogMaximized"
        >
          <q-tooltip>{{ isSettingsDialogMaximized ? 'Riduci finestra' : 'Ingrandisci a tutto schermo' }}</q-tooltip>
        </q-btn>

        <!-- Close Button -->
        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>

      <q-card-section class="q-pa-lg col scroll">
        <!-- Products Settings -->
        <div v-if="sectionType === 'products'" class="column q-gutter-y-md">
          <q-input
            v-model="form.productsTitle"
            label="Titolo della Sezione Prodotti"
            outlined
            class="full-width"
            placeholder="Es. I Miei Prodotti Preferiti"
          />
          <div class="row items-center justify-between q-pa-md bg-grey-2 rounded-borders">
            <div>
              <div class="text-subtitle2 text-weight-bold text-primary">Vuoi aggiungere un nuovo prodotto?</div>
              <div class="text-caption text-grey-8">
                Crea e pubblica un nuovo prodotto con foto, prezzo, recensioni e ordine rapido WhatsApp.
              </div>
            </div>
            <q-btn
              color="primary"
              icon="add"
              label="Nuovo Prodotto"
              unelevated
              class="q-px-md"
              @click="emit('update:modelValue', false); emit('quick-add', 'products')"
            />
          </div>
        </div>

        <!-- Action Banner Settings -->
        <div v-else-if="sectionType === 'actionBanner'" class="column q-gutter-y-md">
          <q-input
            v-model="form.bannerText"
            label="Testo Promozionale del Banner"
            type="textarea"
            outlined
            autogrow
            :rows="3"
            class="full-width"
            hint="Testo visualizzato in risalto nella pillola promozionale"
          />
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.bannerButtonText"
                label="Testo del Bottone Azione"
                outlined
                placeholder="Es. Skin Care"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.bannerUrl"
                label="Link di Destinazione (URL)"
                outlined
                hint="Lascia vuoto per collegare direttamente a WhatsApp"
              />
            </div>
          </div>
          <div class="q-pa-sm bg-grey-1 rounded-borders">
            <q-toggle
              v-model="form.bannerEnabled"
              label="Banner Abilitato (Visibile in vetrina)"
              color="positive"
            />
          </div>
        </div>

        <!-- Profile & Social Settings -->
        <div v-else-if="sectionType === 'profile'" class="column q-gutter-y-md">
          <q-input
            v-model="form.profileName"
            label="Nome Visualizzato / Titolo Sezione"
            outlined
            class="full-width"
          />
          <q-input
            v-model="form.profileBio"
            label="Biografia / Testo della Sezione"
            type="textarea"
            outlined
            autogrow
            :rows="4"
            class="full-width"
            hint="Testo introduttivo o descrizione visualizzata nella sezione"
          />

          <!-- Typography & Layout Styling -->
          <div class="q-pa-md bg-grey-1 rounded-borders">
            <div class="text-subtitle2 text-weight-bold text-primary q-mb-sm row items-center">
              <q-icon name="style" class="q-mr-xs" />
              Stile Tipografico & Allineamento
            </div>

            <!-- Alignment -->
            <div class="q-mb-sm">
              <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Allineamento del Testo:</div>
              <q-btn-toggle
                v-model="form.profileTextAlign"
                toggle-color="primary"
                flat
                dense
                no-caps
                class="bg-white rounded-borders shadow-1"
                :options="[
                  { label: 'Sinistra', value: 'left', icon: 'format_align_left' },
                  { label: 'Centro', value: 'center', icon: 'format_align_center' },
                  { label: 'Destra', value: 'right', icon: 'format_align_right' },
                  { label: 'Giustificato', value: 'justify', icon: 'format_align_justify' },
                ]"
              />
            </div>

            <!-- Font & Weight (Bold) -->
            <div class="row q-col-gutter-sm q-mb-sm">
              <div class="col-12 col-sm-6">
                <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Carattere (Font):</div>
                <q-btn-toggle
                  v-model="form.profileFontFamily"
                  toggle-color="primary"
                  flat
                  dense
                  no-caps
                  class="full-width bg-white rounded-borders shadow-1"
                  :options="[
                    { label: 'Serif Elegante', value: 'serif' },
                    { label: 'Sans Moderno', value: 'sans' },
                  ]"
                />
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Spessore Titolo (Bold):</div>
                <q-btn-toggle
                  v-model="form.profileFontWeight"
                  toggle-color="primary"
                  flat
                  dense
                  no-caps
                  class="full-width bg-white rounded-borders shadow-1"
                  :options="[
                    { label: 'Leggero', value: 'light' },
                    { label: 'Normale', value: 'normal' },
                    { label: 'Grassetto (Bold)', value: 'bold' },
                  ]"
                />
              </div>
            </div>

            <!-- Title Size & Max Width -->
            <div class="row q-col-gutter-sm q-mb-sm">
              <div class="col-12 col-sm-6">
                <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Dimensione Titolo:</div>
                <q-btn-toggle
                  v-model="form.profileTitleSize"
                  toggle-color="primary"
                  flat
                  dense
                  no-caps
                  class="full-width bg-white rounded-borders shadow-1"
                  :options="[
                    { label: 'Grande (H2)', value: 'h2' },
                    { label: 'Medio (H3)', value: 'h3' },
                    { label: 'Compatto (H4)', value: 'h4' },
                  ]"
                />
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Ampiezza Massima Blocco:</div>
                <q-btn-toggle
                  v-model="form.profileMaxWidth"
                  toggle-color="primary"
                  flat
                  dense
                  no-caps
                  class="full-width bg-white rounded-borders shadow-1"
                  :options="[
                    { label: 'Stretta', value: 'sm' },
                    { label: 'Media', value: 'md' },
                    { label: 'Larga', value: 'lg' },
                    { label: 'Piena', value: 'full' },
                  ]"
                />
              </div>
            </div>

            <!-- Toggles: Avatar & Socials -->
            <div class="row q-col-gutter-sm q-mt-xs">
              <div class="col-12 col-sm-6">
                <q-toggle
                  v-model="form.profileShowAvatar"
                  label="Mostra Foto Profilo / Avatar"
                  color="primary"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-toggle
                  v-model="form.profileShowSocials"
                  label="Mostra Icone Canali Social"
                  color="primary"
                />
              </div>
            </div>
          </div>

          <!-- Social Media & Contact Links -->
          <div v-if="form.profileShowSocials" class="q-mt-sm">
            <div class="text-subtitle2 text-weight-bold text-primary q-mb-sm row items-center">
              <q-icon name="share" class="q-mr-xs" />
              Contatti & Canali Social
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.profileWhatsapp"
                  label="WhatsApp (es. +393331234567)"
                  outlined
                  dense
                >
                  <template #prepend>
                    <q-icon name="fa-brands fa-whatsapp" color="positive" size="18px" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.profileInstagram"
                  label="Instagram (@username o link)"
                  outlined
                  dense
                >
                  <template #prepend>
                    <q-icon name="fa-brands fa-instagram" color="pink" size="18px" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.profileTiktok"
                  label="TikTok (@username o link)"
                  outlined
                  dense
                >
                  <template #prepend>
                    <q-icon name="fa-brands fa-tiktok" size="18px" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.profileEmail"
                  label="Email di Contatto"
                  outlined
                  dense
                >
                  <template #prepend>
                    <q-icon name="email" color="primary" size="18px" />
                  </template>
                </q-input>
              </div>
            </div>
          </div>
        </div>

        <!-- Articles Settings & Drag & Drop Reordering -->
        <div v-else-if="sectionType === 'articles'" class="column q-gutter-y-md">
          <!-- Filter Type for this Carousel -->
          <div class="q-pa-sm bg-grey-1 rounded-borders">
            <div class="text-caption text-weight-bold text-primary q-mb-xs">
              Contenuti da mostrare in questo carosello:
            </div>
            <q-btn-toggle
              v-model="form.articleFilterType"
              toggle-color="primary"
              flat
              dense
              no-caps
              :options="[
                { label: 'Tutti gli Articoli', value: 'all' },
                { label: '📸 Solo Testimonianze', value: 'testimonial' },
                { label: '🧴 Solo Schede Prodotto', value: 'product' },
              ]"
            />
          </div>

          <!-- Header + Quick Add -->
          <div class="row items-center justify-between q-mt-sm">
            <div>
              <div class="text-subtitle2 text-weight-bold text-primary">
                Ordina Articoli (Trascina o usa le frecce):
              </div>
              <div class="text-caption text-grey-7">
                L'ordine stabilisce la sequenza di scorrimento delle slide.
              </div>
            </div>
            <q-btn
              color="primary"
              size="sm"
              icon="add"
              label="Nuovo Articolo"
              unelevated
              @click="emit('update:modelValue', false); emit('quick-add', 'articles')"
            />
          </div>

          <!-- Draggable List of Articles -->
          <div class="column q-gutter-y-xs q-mt-xs">
            <div
              v-for="(art, aIdx) in articles"
              :key="art.id"
              draggable="true"
              class="article-order-item row items-center justify-between q-pa-sm rounded-borders transition-easy"
              :class="{ 'bg-grey-2': art.active, 'bg-grey-3 text-grey-6': !art.active }"
              @dragstart="onArticleDragStart(aIdx)"
              @dragover.prevent
              @drop="onArticleDrop(aIdx)"
            >
              <!-- Left: Drag Handle + Thumbnail + Info -->
              <div class="row items-center q-gutter-sm col overflow-hidden">
                <q-icon name="drag_indicator" size="20px" class="cursor-grab text-grey-7 flex-shrink-0" />
                <q-avatar rounded size="42px" class="bg-grey-4 flex-shrink-0">
                  <img v-if="art.imageUrl" :src="art.imageUrl" style="object-fit: cover" />
                  <q-icon v-else name="image" color="grey" />
                </q-avatar>
                <div class="col ellipsis">
                  <div class="text-body2 text-weight-bold ellipsis">{{ art.title }}</div>
                  <div class="text-caption text-grey-7 row items-center q-gutter-xs">
                    <span>#{{ aIdx + 1 }}</span>
                    <span>•</span>
                    <span>{{ art.layoutConfig?.articleType === 'product' ? '🧴 Prodotto' : '📸 Testimonianza' }}</span>
                    <span v-if="!art.active" class="text-negative text-weight-bold">• Nascosto</span>
                  </div>
                </div>
              </div>

              <!-- Right: Ordering & Actions -->
              <div class="row items-center q-gutter-xs flex-shrink-0">
                <!-- Toggle Visibility Button (Show / Hide Article) -->
                <q-btn
                  dense
                  flat
                  round
                  size="sm"
                  :icon="art.active ? 'visibility' : 'visibility_off'"
                  :color="art.active ? 'grey-8' : 'negative'"
                  @click="emit('toggle-article-active', art)"
                >
                  <q-tooltip>{{ art.active ? 'Nascondi articolo ai clienti' : 'Mostra articolo ai clienti' }}</q-tooltip>
                </q-btn>
                <q-btn
                  dense
                  flat
                  round
                  size="sm"
                  icon="arrow_upward"
                  :disable="aIdx === 0"
                  @click="moveArticle(aIdx, 'up')"
                >
                  <q-tooltip>Sposta Su</q-tooltip>
                </q-btn>
                <q-btn
                  dense
                  flat
                  round
                  size="sm"
                  icon="arrow_downward"
                  :disable="aIdx === articles.length - 1"
                  @click="moveArticle(aIdx, 'down')"
                >
                  <q-tooltip>Sposta Giù</q-tooltip>
                </q-btn>
                <q-btn
                  dense
                  flat
                  round
                  size="sm"
                  icon="edit"
                  color="primary"
                  @click="emit('open-edit-article', art)"
                >
                  <q-tooltip>Modifica Articolo</q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Footer Actions -->
      <q-card-actions align="right" class="q-pa-md bg-grey-1">
        <q-btn flat label="Annulla" color="grey-7" v-close-popup />
        <q-btn
          unelevated
          label="Salva Modifiche"
          color="primary"
          class="q-px-lg text-weight-bold"
          @click="onSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.transition-easy {
  transition: all 0.2s ease;
}

.article-order-item {
  border: 1px solid rgba(0, 0, 0, 0.08);
  &:hover {
    border-color: rgba(52, 20, 20, 0.3);
    background-color: #f5f5f5 !important;
  }
}
</style>

