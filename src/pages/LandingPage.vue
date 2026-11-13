<script setup lang="ts">
/**
 * @file LandingPage.vue
 * @description Main public showcase and interactive in-place Visual Builder for Beauty Ambassador.
 * @author Vasile Chifeac (AI Agent)
 */

import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useSettingsStore } from 'stores/settings';
import type { Article } from 'stores/settings';
import type { Product } from 'src/types/product';
import ProductGrid from 'components/widgets/ProductGrid.vue';
import ArticleCarousel from 'components/widgets/ArticleCarousel.vue';
import ContactDialog from 'components/widgets/ContactDialog.vue';
import ArticleFormDialog from 'components/admin/ArticleFormDialog.vue';
import ProductFormDialog from 'components/admin/ProductFormDialog.vue';

// Brand colors
const BRAND_PRIMARY = '#101010';
const BRAND_GOLD = '#D4AF37';

const route = useRoute();
const $q = useQuasar();
const settingsStore = useSettingsStore();

// Visual Builder Preview Mode detection
const isPreview = computed(() => route.query.preview_mode === 'true');

// Dialog states
const showContactDialog = ref(false);
const showArticleDialog = ref(false);
const showProductDialog = ref(false);
const showSettingsDialog = ref(false);

const selectedArticle = ref<Article | null>(null);
const selectedProduct = ref<Product | null>(null);
const activeSettingsSection = ref<string>('');

// Temporary settings form for section customization
const isSettingsDialogMaximized = ref(false);
const isSettingsDialogWide = ref(true);

const dialogCardStyle = computed(() => {
  if (isSettingsDialogMaximized.value) {
    return { width: '100%', height: '100%' };
  }
  return {
    width: isSettingsDialogWide.value ? '780px' : '520px',
    maxWidth: '96vw',
    transition: 'all 0.25s ease-in-out',
  };
});

const sectionForm = ref<{
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
});

// Section type helpers
const getSectionType = (secId: string): string => {
  if (secId.startsWith('profile')) return 'profile';
  if (secId.startsWith('articles')) return 'articles';
  if (secId.startsWith('actionBanner')) return 'actionBanner';
  if (secId.startsWith('products')) return 'products';
  return secId;
};

const getSectionLabel = (secId: string): string => {
  const type = getSectionType(secId);
  const isCopy = secId.includes('_copy');
  if (type === 'profile') return isCopy ? 'Profilo (Copia)' : 'Profilo & Social';
  if (type === 'articles') return isCopy ? 'Carosello Articoli (Copia)' : 'Carosello Articoli';
  if (type === 'actionBanner') return isCopy ? 'Banner Azione (Copia)' : 'Banner Promozionale';
  if (type === 'products') return isCopy ? 'Griglia Prodotti (Copia)' : 'Griglia Prodotti';
  return secId;
};

const getSectionIcon = (secId: string): string => {
  const type = getSectionType(secId);
  if (type === 'profile') return 'person';
  if (type === 'articles') return 'view_carousel';
  if (type === 'actionBanner') return 'smart_button';
  if (type === 'products') return 'grid_view';
  return 'extension';
};

const bannerTargetUrl = computed(() => {
  if (settingsStore.profile.actionBannerUrl) {
    return settingsStore.profile.actionBannerUrl;
  }
  if (settingsStore.profile.whatsapp) {
    return 'https://wa.me/' + settingsStore.profile.whatsapp.replace('+', '');
  }
  return '#';
});

const isSectionHidden = (sectionId: string) => {
  const hidden = settingsStore.profile.hiddenSections || [];
  if (hidden.includes(sectionId)) return true;
  if (getSectionType(sectionId) === 'actionBanner' && settingsStore.profile.actionBannerEnabled === false) {
    return true;
  }
  return false;
};

const isSectionVisible = (sectionId: string) => {
  return !isSectionHidden(sectionId);
};

const sectionsList = computed(() => {
  const order = settingsStore.profile.sectionsOrder || [
    'profile',
    'articles',
    'actionBanner',
    'products',
  ];
  const defaultSections = ['profile', 'articles', 'actionBanner', 'products'];
  return [...new Set([...order, ...defaultSections])];
});

// In-Place Visual Builder Actions
const toggleSectionVisibility = async (sectionId: string) => {
  const currentHidden = [...(settingsStore.profile.hiddenSections || [])];
  const isCurrentlyHidden = currentHidden.includes(sectionId);
  let updatedHidden: string[];

  if (isCurrentlyHidden) {
    updatedHidden = currentHidden.filter((id) => id !== sectionId);
    if (getSectionType(sectionId) === 'actionBanner') {
      await settingsStore.updateProfile({ actionBannerEnabled: true });
    }
  } else {
    updatedHidden = [...currentHidden, sectionId];
    if (getSectionType(sectionId) === 'actionBanner') {
      await settingsStore.updateProfile({ actionBannerEnabled: false });
    }
  }

  await settingsStore.updateProfile({ hiddenSections: updatedHidden });
  $q.notify({
    type: 'info',
    message: isCurrentlyHidden ? 'Sezione visibile' : 'Sezione nascosta',
    timeout: 1000,
  });
};

const moveSection = async (index: number, direction: 'up' | 'down') => {
  const list = [...sectionsList.value];
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= list.length) return;

  const item = list[index];
  if (!item) return;

  list.splice(index, 1);
  list.splice(targetIndex, 0, item);

  await settingsStore.updateProfile({ sectionsOrder: list });
  $q.notify({
    type: 'positive',
    message: 'Ordine sezioni aggiornato',
    timeout: 800,
  });
};

const duplicateSection = async (sectionId: string, index: number) => {
  const list = [...sectionsList.value];
  const type = getSectionType(sectionId);
  const newId = `${type}_copy_${Date.now().toString(36)}`;

  list.splice(index + 1, 0, newId);
  await settingsStore.updateProfile({ sectionsOrder: list });

  $q.notify({
    type: 'positive',
    message: `Sezione "${getSectionLabel(sectionId)}" duplicata con successo!`,
    icon: 'content_copy',
    timeout: 1500,
  });
};

const removeDuplicateSection = async (sectionId: string) => {
  const list = sectionsList.value.filter((id) => id !== sectionId);
  const hidden = (settingsStore.profile.hiddenSections || []).filter((id) => id !== sectionId);

  await settingsStore.updateProfile({ sectionsOrder: list, hiddenSections: hidden });
  $q.notify({
    type: 'info',
    message: 'Sezione rimossa',
    timeout: 1000,
  });
};

const openQuickAdd = (sectionId: string) => {
  const type = getSectionType(sectionId);
  if (type === 'articles') {
    selectedArticle.value = null;
    showArticleDialog.value = true;
  } else if (type === 'products') {
    selectedProduct.value = null;
    showProductDialog.value = true;
  }
};

const openSectionSettings = (sectionId: string) => {
  activeSettingsSection.value = sectionId;
  sectionForm.value = {
    productsTitle: settingsStore.profile.productsSectionTitle || 'I Miei Prodotti Preferiti',
    bannerText: settingsStore.profile.actionBannerText || '',
    bannerButtonText: settingsStore.profile.actionBannerButtonText || 'Skin Care',
    bannerUrl: settingsStore.profile.actionBannerUrl || '',
    bannerEnabled: settingsStore.profile.actionBannerEnabled !== false,
    profileName: settingsStore.profile.name || '',
    profileBio: settingsStore.profile.bio || '',
    profileWhatsapp: settingsStore.profile.whatsapp || '',
    profileInstagram: settingsStore.profile.instagram || '',
    profileTiktok: settingsStore.profile.tiktok || '',
    profileEmail: settingsStore.profile.email || '',
  };
  showSettingsDialog.value = true;
};

const saveSectionSettings = async () => {
  const type = getSectionType(activeSettingsSection.value);

  if (type === 'products') {
    await settingsStore.updateProfile({
      productsSectionTitle: sectionForm.value.productsTitle,
    });
  } else if (type === 'actionBanner') {
    await settingsStore.updateProfile({
      actionBannerText: sectionForm.value.bannerText,
      actionBannerButtonText: sectionForm.value.bannerButtonText,
      actionBannerUrl: sectionForm.value.bannerUrl,
      actionBannerEnabled: sectionForm.value.bannerEnabled,
    });
  } else if (type === 'profile') {
    await settingsStore.updateProfile({
      name: sectionForm.value.profileName,
      bio: sectionForm.value.profileBio,
      whatsapp: sectionForm.value.profileWhatsapp,
      instagram: sectionForm.value.profileInstagram,
      tiktok: sectionForm.value.profileTiktok,
      email: sectionForm.value.profileEmail,
    });
  }

  showSettingsDialog.value = false;
  $q.notify({
    type: 'positive',
    message: 'Impostazioni della sezione salvate!',
    icon: 'check',
    timeout: 1200,
  });
};

onMounted(() => {
  settingsStore.subscribeToProfile();
  settingsStore.subscribeToArticles();
});
</script>

<template>
  <q-page class="q-pa-none bg-white">
    <template v-for="(section, index) in sectionsList" :key="section">
      <!-- Section Outer Wrapper with Visual Builder Overlay -->
      <div
        v-if="isPreview || isSectionVisible(section)"
        class="visual-builder-section-wrapper relative-position"
        :class="{
          'builder-preview-active': isPreview,
          'builder-section-hidden': isPreview && isSectionHidden(section),
        }"
      >
        <!-- In-Place Hover Action Toolbar (Visible only in preview mode) -->
        <div v-if="isPreview" class="visual-builder-toolbar row items-center no-wrap shadow-4">
          <!-- Section Badge -->
          <div class="section-tag row items-center q-px-sm text-white">
            <q-icon :name="getSectionIcon(section)" size="14px" class="q-mr-xs" />
            <span class="text-caption text-weight-bold">{{ getSectionLabel(section) }}</span>
            <span v-if="isSectionHidden(section)" class="q-ml-xs text-negative text-weight-bold">
              • Nascosto
            </span>
          </div>

          <q-separator vertical dark class="q-mx-xs" style="height: 18px" />

          <!-- 1. Eye Button (Visibility) -->
          <q-btn
            dense
            flat
            round
            size="sm"
            :icon="isSectionHidden(section) ? 'visibility_off' : 'visibility'"
            :color="isSectionHidden(section) ? 'negative' : 'white'"
            @click="toggleSectionVisibility(section)"
          >
            <q-tooltip>{{ isSectionHidden(section) ? 'Mostra sezione ai clienti' : 'Nascondi sezione ai clienti' }}</q-tooltip>
          </q-btn>

          <!-- 2. Move Up Button -->
          <q-btn
            dense
            flat
            round
            size="sm"
            icon="arrow_upward"
            color="white"
            :disable="index === 0"
            @click="moveSection(index, 'up')"
          >
            <q-tooltip>Sposta Sezione Su</q-tooltip>
          </q-btn>

          <!-- 3. Move Down Button -->
          <q-btn
            dense
            flat
            round
            size="sm"
            icon="arrow_downward"
            color="white"
            :disable="index === sectionsList.length - 1"
            @click="moveSection(index, 'down')"
          >
            <q-tooltip>Sposta Sezione Giù</q-tooltip>
          </q-btn>

          <!-- 4. Duplicate Button -->
          <q-btn
            dense
            flat
            round
            size="sm"
            icon="content_copy"
            color="white"
            @click="duplicateSection(section, index)"
          >
            <q-tooltip>Duplica Sezione</q-tooltip>
          </q-btn>

          <!-- 5. Quick Add Item (+ Articolo / + Prodotto) -->
          <q-btn
            v-if="getSectionType(section) === 'articles' || getSectionType(section) === 'products'"
            dense
            flat
            round
            size="sm"
            icon="add_circle"
            color="positive"
            @click="openQuickAdd(section)"
          >
            <q-tooltip>
              {{ getSectionType(section) === 'articles' ? '+ Aggiungi Articolo Rapido' : '+ Aggiungi Prodotto Rapido' }}
            </q-tooltip>
          </q-btn>

          <!-- 6. Section Settings -->
          <q-btn
            dense
            flat
            round
            size="sm"
            icon="tune"
            color="white"
            @click="openSectionSettings(section)"
          >
            <q-tooltip>Impostazioni Layout Sezione</q-tooltip>
          </q-btn>

          <!-- 7. Remove if duplicated -->
          <q-btn
            v-if="section.includes('_copy')"
            dense
            flat
            round
            size="sm"
            icon="delete"
            color="negative"
            @click="removeDuplicateSection(section)"
          >
            <q-tooltip>Elimina Sezione Duplicata</q-tooltip>
          </q-btn>
        </div>

        <!-- Hidden Notice in Preview Mode -->
        <div v-if="isPreview && isSectionHidden(section)" class="hidden-section-banner text-caption text-center q-py-xs bg-grey-9 text-white">
          <q-icon name="visibility_off" size="xs" class="q-mr-xs" />
          Questa sezione è <strong>nascosta ai clienti</strong>. Clicca sull'icona occhio nella barra sovrastante per riattivarla.
        </div>

        <!-- 1. Hero / Profile Section -->
        <div
          v-if="getSectionType(section) === 'profile'"
          class="row justify-center items-center q-py-xl q-px-md relative-position min-h-hero"
        >
          <div class="col-12 col-md-auto column flex-center text-center">
            <template v-if="settingsStore.loading">
              <q-skeleton type="circle" size="150px" class="q-mb-md" />
              <q-skeleton type="text" width="200px" class="text-h2" />
              <q-skeleton type="text" width="300px" class="q-mt-sm" />
              <div class="row q-gutter-md q-mt-lg justify-center">
                <q-skeleton type="QBtn" size="40px" />
                <q-skeleton type="QBtn" size="40px" />
                <q-skeleton type="QBtn" size="40px" />
              </div>
            </template>

            <template v-else>
              <q-avatar size="150px" class="q-mb-md shadow-3">
                <q-skeleton v-if="!settingsStore.profile.avatarUrl" type="circle" size="150px" />
                <img
                  v-else
                  :src="settingsStore.profile.avatarUrl"
                  style="object-fit: cover; width: 100%; height: 100%"
                />
              </q-avatar>
              <div class="text-h2 text-primary q-mb-sm font-serif">
                {{ settingsStore.profile.name }}
              </div>
              <div class="text-subtitle1 text-grey-8" style="max-width: 400px">
                {{ settingsStore.profile.bio }}
              </div>

              <!-- Social Media Links -->
              <div class="row q-gutter-md q-mt-lg justify-center">
                <q-btn
                  v-if="settingsStore.profile.whatsapp"
                  round
                  outline
                  color="primary"
                  icon="fa-brands fa-whatsapp"
                  type="a"
                  :href="'https://wa.me/' + settingsStore.profile.whatsapp.replace('+', '')"
                  target="_blank"
                >
                  <q-tooltip>WhatsApp</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="settingsStore.profile.tiktok"
                  round
                  outline
                  color="primary"
                  icon="fa-brands fa-tiktok"
                  type="a"
                  :href="
                    settingsStore.profile.tiktok.startsWith('http')
                      ? settingsStore.profile.tiktok
                      : 'https://tiktok.com/@' + settingsStore.profile.tiktok.replace('@', '')
                  "
                  target="_blank"
                >
                  <q-tooltip>TikTok</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="settingsStore.profile.instagram"
                  round
                  outline
                  color="primary"
                  icon="fa-brands fa-instagram"
                  type="a"
                  :href="
                    settingsStore.profile.instagram.startsWith('http')
                      ? settingsStore.profile.instagram
                      : 'https://instagram.com/' + settingsStore.profile.instagram.replace('@', '')
                  "
                  target="_blank"
                >
                  <q-tooltip>Instagram</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="settingsStore.profile.email"
                  round
                  outline
                  color="primary"
                  icon="email"
                  @click="showContactDialog = true"
                >
                  <q-tooltip>Send Email</q-tooltip>
                </q-btn>
              </div>
            </template>
          </div>
        </div>

        <!-- 2. Dynamic Article Carousel Section -->
        <div
          v-else-if="getSectionType(section) === 'articles'"
          class="q-mb-xl"
        >
          <ArticleCarousel />
        </div>

        <!-- 3. Action Banner (The pill banner) Section -->
        <div
          v-else-if="getSectionType(section) === 'actionBanner'"
          class="max-width-container q-pa-md q-my-xl"
        >
          <div class="row justify-center">
            <div class="col-12 col-md-10 col-lg-8">
              <a
                :href="bannerTargetUrl"
                :target="bannerTargetUrl.startsWith('http') ? '_blank' : undefined"
                class="action-pill-banner row no-wrap items-center justify-between q-pa-md shadow-4"
              >
                <div class="banner-text q-pl-lg">
                  <div class="text-h6 text-primary text-weight-medium line-height-tight q-mb-sm">
                    {{
                      settingsStore.profile.actionBannerText ||
                      'Acquista qui con codice sconto la tua Skin Care e integrazione personalizzata'
                    }}
                  </div>
                </div>
                <div class="banner-image q-pr-lg">
                  <q-avatar size="100px" class="shadow-8">
                    <q-btn
                      color="primary"
                      :label="settingsStore.profile.actionBannerButtonText || 'Skin Care'"
                      unelevated
                      rounded
                      padding="xs lg"
                      icon-right="sym_o_procedure"
                    />
                  </q-avatar>
                </div>
              </a>
            </div>
          </div>
        </div>

        <!-- 4. Product Grid Section -->
        <div
          v-else-if="getSectionType(section) === 'products'"
          class="max-width-container q-px-md q-pb-xl"
        >
          <div class="text-center q-mb-lg">
            <h2 class="text-h4 text-weight-light q-mb-sm" :style="{ color: BRAND_PRIMARY }">
              {{ settingsStore.profile.productsSectionTitle || 'I Miei Prodotti Preferiti' }}
            </h2>
            <div class="separator-line mx-auto" :style="{ backgroundColor: BRAND_GOLD }"></div>
          </div>

          <ProductGrid />
        </div>
      </div>
    </template>

    <!-- Dialogs -->
    <ContactDialog v-model="showContactDialog" />
    <ArticleFormDialog v-model="showArticleDialog" :initial-data="selectedArticle" />
    <ProductFormDialog v-model="showProductDialog" :initial-data="selectedProduct" />

    <!-- Section Settings Dialog with Expandable / Maximizable Capacity -->
    <q-dialog
      v-model="showSettingsDialog"
      :maximized="isSettingsDialogMaximized"
      transition-show="jump-down"
      transition-hide="jump-up"
    >
      <q-card :style="dialogCardStyle" class="column no-wrap overflow-hidden">
        <!-- Toolbar Header with Maximize & Expand Controls -->
        <q-toolbar class="bg-primary text-white q-py-xs">
          <q-icon :name="getSectionIcon(activeSettingsSection)" size="22px" class="q-mr-sm" />
          <q-toolbar-title class="text-subtitle1 text-weight-bold">
            Impostazioni: {{ getSectionLabel(activeSettingsSection) }}
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
          <div v-if="getSectionType(activeSettingsSection) === 'products'" class="column q-gutter-y-md">
            <q-input
              v-model="sectionForm.productsTitle"
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
                @click="showSettingsDialog = false; openQuickAdd('products')"
              />
            </div>
          </div>

          <!-- Action Banner Settings -->
          <div v-else-if="getSectionType(activeSettingsSection) === 'actionBanner'" class="column q-gutter-y-md">
            <q-input
              v-model="sectionForm.bannerText"
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
                  v-model="sectionForm.bannerButtonText"
                  label="Testo del Bottone Azione"
                  outlined
                  placeholder="Es. Skin Care"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="sectionForm.bannerUrl"
                  label="Link di Destinazione (URL)"
                  outlined
                  hint="Lascia vuoto per collegare direttamente a WhatsApp"
                />
              </div>
            </div>
            <div class="q-pa-sm bg-grey-1 rounded-borders">
              <q-toggle
                v-model="sectionForm.bannerEnabled"
                label="Banner Abilitato (Visibile in vetrina)"
                color="positive"
              />
            </div>
          </div>

          <!-- Profile & Social Settings -->
          <div v-else-if="getSectionType(activeSettingsSection) === 'profile'" class="column q-gutter-y-md">
            <q-input
              v-model="sectionForm.profileName"
              label="Nome Visualizzato / Titolo Vetrina"
              outlined
              class="full-width"
            />
            <q-input
              v-model="sectionForm.profileBio"
              label="Biografia / Sottotitolo"
              type="textarea"
              outlined
              autogrow
              :rows="4"
              class="full-width"
              hint="Descrizione introduttiva visualizzata sotto il nome nella parte alta della vetrina"
            />

            <!-- Social Media & Contact Links -->
            <div class="q-mt-sm">
              <div class="text-subtitle2 text-weight-bold text-primary q-mb-sm row items-center">
                <q-icon name="share" class="q-mr-xs" />
                Contatti & Canali Social
              </div>
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="sectionForm.profileWhatsapp"
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
                    v-model="sectionForm.profileInstagram"
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
                    v-model="sectionForm.profileTiktok"
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
                    v-model="sectionForm.profileEmail"
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

          <!-- Articles Quick Info -->
          <div v-else-if="getSectionType(activeSettingsSection) === 'articles'" class="column q-gutter-y-md">
            <div class="text-body2 text-grey-8">
              Il carosello mostra automaticamente gli articoli e le testimonianze attive in ordine di visualizzazione.
            </div>
            <div class="row items-center justify-between q-pa-md bg-grey-2 rounded-borders">
              <div>
                <div class="text-subtitle2 text-weight-bold text-primary">Vuoi aggiungere un nuovo articolo o storia?</div>
                <div class="text-caption text-grey-8">
                  Carica una nuova storia prima/dopo con foto 16:9, descrizione e link di acquisto.
                </div>
              </div>
              <q-btn
                color="primary"
                icon="add"
                label="Nuovo Articolo"
                unelevated
                class="q-px-md"
                @click="showSettingsDialog = false; openQuickAdd('articles')"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Annulla" color="grey-7" v-close-popup class="q-px-md" />
          <q-btn unelevated label="Salva Modifiche" color="primary" class="q-px-xl text-weight-bold" @click="saveSectionSettings" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped lang="scss">
.max-width-container {
  max-width: 1400px;
  margin: 0 auto;
}

.separator-line {
  height: 2px;
  width: 60px;
  margin: 0 auto;
}

/* Action Pill Banner Styles */
.action-pill-banner {
  background-color: #f7f7f4;
  border-radius: 100px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.action-pill-banner:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
  background-color: #ffffff;
}

.line-height-tight {
  line-height: 1.25;
}

/* Visual Builder In-Place Styles */
.visual-builder-section-wrapper {
  transition: all 0.25s ease;
  position: relative;
}

.builder-preview-active {
  &:hover {
    outline: 2px dashed rgba(52, 20, 20, 0.45);
    outline-offset: -2px;

    .visual-builder-toolbar {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
  }
}

.builder-section-hidden {
  opacity: 0.55;
  filter: grayscale(0.45);
  background: repeating-linear-gradient(
    45deg,
    rgba(240, 240, 240, 0.7),
    rgba(240, 240, 240, 0.7) 10px,
    rgba(255, 255, 255, 0.7) 10px,
    rgba(255, 255, 255, 0.7) 20px
  );
}

.hidden-section-banner {
  border-bottom: 1px dashed rgba(0, 0, 0, 0.2);
}

/* Floating Toolbar */
.visual-builder-toolbar {
  position: absolute;
  top: 10px;
  right: 16px;
  z-index: 80;
  background: rgba(17, 24, 39, 0.92);
  backdrop-filter: blur(8px);
  border-radius: 9999px;
  padding: 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  opacity: 0.85;
  transform: translateY(0);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  .section-tag {
    font-size: 0.78rem;
    letter-spacing: 0.02em;
  }
}

@media (max-width: 600px) {
  .action-pill-banner {
    border-radius: 25px;
    padding: 12px !important;
  }
  .banner-text .text-h6 {
    font-size: 0.9rem;
  }
  .banner-image .q-avatar {
    size: 85px !important;
    width: 85px !important;
    height: 85px !important;
  }
  .visual-builder-toolbar {
    top: 6px;
    right: 8px;
    padding: 2px 6px;
  }
}
</style>
