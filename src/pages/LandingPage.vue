<script setup lang="ts">
/**
 * @file LandingPage.vue
 * @description Vetrina pubblica e orchestratore del Visual Builder interattivo per Beauty Ambassador.
 * Architettura modulare decomposta: compone widget e dialog specializzati in conformità a §0.2 e §0.3.
 * @author Vasile Chifeac (AI Agent)
 */

import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useSettingsStore } from 'stores/settings';
import { useProductsStore } from 'stores/products';
import { useSecureLogger } from 'src/shared/logger';
import type { Article, CustomSectionConfig, PublicProfile } from 'stores/settings';
import type { Product } from 'src/types/product';

// Widgets & Dialogs modulari
import ProductGrid from 'components/widgets/ProductGrid.vue';
import ArticleCarousel from 'components/widgets/ArticleCarousel.vue';
import ActionPillBanner from 'components/widgets/ActionPillBanner.vue';
import ContactDialog from 'components/widgets/ContactDialog.vue';
import ArticleFormDialog from 'components/admin/ArticleFormDialog.vue';
import ProductFormDialog from 'components/admin/ProductFormDialog.vue';

// Sub-componenti Visual Builder
import SectionToolbar from 'components/builder/SectionToolbar.vue';
import AddSectionDialog from 'components/builder/AddSectionDialog.vue';
import SectionSettingsDialog from 'components/builder/SectionSettingsDialog.vue';

// Brand colors
const BRAND_PRIMARY = '#101010';
const BRAND_GOLD = '#D4AF37';

const route = useRoute();
const $q = useQuasar();
const settingsStore = useSettingsStore();
const productsStore = useProductsStore();
const logger = useSecureLogger();

// Visual Builder Preview Mode detection
const isPreview = computed(() => route.query.preview_mode === 'true');

// Dialog states
const showContactDialog = ref(false);
const showArticleDialog = ref(false);
const showProductDialog = ref(false);
const showSettingsDialog = ref(false);
const showAddSectionDialog = ref(false);

const selectedArticle = ref<Article | null>(null);
const selectedProduct = ref<Product | null>(null);
const activeSettingsSection = ref<string>('');
const targetAddIndex = ref<number | null>(null);

// Profile Typography & Style Helpers
const getProfileTitleClass = (secId: string): string => {
  const cfg = getCustomSectionConfig(secId);
  const size = cfg.titleSize || 'h2';
  const sizeClass = size === 'h4' ? 'text-h4' : size === 'h3' ? 'text-h3' : 'text-h2';
  const fontClass = cfg.fontFamily === 'sans' ? 'font-sans' : 'font-serif';
  const weightClass = cfg.fontWeight === 'bold' ? 'text-weight-bold' : cfg.fontWeight === 'light' ? 'text-weight-light' : 'text-weight-medium';
  return `${sizeClass} ${fontClass} ${weightClass}`;
};

const getProfileAlignClass = (secId: string): string => {
  const cfg = getCustomSectionConfig(secId);
  const align = cfg.textAlign || 'center';
  if (align === 'left') return 'text-left items-start';
  if (align === 'right') return 'text-right items-end';
  if (align === 'justify') return 'text-justify items-center';
  return 'text-center items-center';
};

const getProfileMaxWidthStyle = (secId: string) => {
  const cfg = getCustomSectionConfig(secId);
  const mw = cfg.maxWidth || 'md';
  if (mw === 'sm') return { maxWidth: '520px', margin: '0 auto' };
  if (mw === 'lg') return { maxWidth: '960px', margin: '0 auto' };
  if (mw === 'full') return { maxWidth: '100%', margin: '0 auto' };
  return { maxWidth: '720px', margin: '0 auto' };
};

const getCustomSectionConfig = (sectionId: string): CustomSectionConfig => {
  return settingsStore.profile.customSections?.[sectionId] || {};
};

const getSectionType = (secId: string): 'profile' | 'articles' | 'actionBanner' | 'products' => {
  if (secId.startsWith('profile')) return 'profile';
  if (secId.startsWith('articles')) return 'articles';
  if (secId.startsWith('actionBanner')) return 'actionBanner';
  if (secId.startsWith('products')) return 'products';
  return 'profile';
};

const getSectionLabel = (secId: string): string => {
  const isCustom = !['profile', 'articles', 'actionBanner', 'products'].includes(secId);
  const type = getSectionType(secId);
  if (type === 'profile') return isCustom ? 'Profilo & Filosofia (Extra)' : 'Profilo & Social';
  if (type === 'articles') return isCustom ? 'Carosello Articoli (Extra)' : 'Carosello Articoli';
  if (type === 'actionBanner') return isCustom ? 'Banner Azione (Extra)' : 'Banner Promozionale';
  if (type === 'products') return isCustom ? 'Griglia Prodotti (Extra)' : 'Griglia Prodotti';
  return secId;
};

const getSectionIcon = (secId: string): string => {
  const type = getSectionType(secId);
  if (type === 'profile') return 'person';
  if (type === 'articles') return 'view_carousel';
  if (type === 'actionBanner') return 'smart_button';
  if (type === 'products') return 'grid_view';
  return 'dashboard';
};

const bannerTargetUrl = computed(() => {
  if (settingsStore.profile.actionBannerUrl) {
    return settingsStore.profile.actionBannerUrl;
  }
  const phone = settingsStore.profile.whatsapp?.replace(/\D/g, '') || '';
  if (phone) {
    return `https://wa.me/${phone}?text=Ciao!%20Vorrei%20informazioni%20sui%20prodotti%20skincare`;
  }
  return '#';
});

const defaultSections = ['profile', 'articles', 'actionBanner', 'products'];

const sectionsList = computed(() => {
  if (settingsStore.profile.sectionsOrder && settingsStore.profile.sectionsOrder.length > 0) {
    return settingsStore.profile.sectionsOrder;
  }
  return defaultSections;
});

const isSectionHidden = (sectionId: string): boolean => {
  if (sectionId === 'actionBanner' && settingsStore.profile.actionBannerEnabled === false) {
    return true;
  }
  return (settingsStore.profile.hiddenSections || []).includes(sectionId);
};

const isSectionVisible = (sectionId: string): boolean => {
  return !isSectionHidden(sectionId);
};

// Builder Actions
const toggleSectionVisibility = async (sectionId: string) => {
  const currentHidden = [...(settingsStore.profile.hiddenSections || [])];
  const isCurrentlyHidden = isSectionHidden(sectionId);
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

const openQuickAdd = (type: 'articles' | 'products') => {
  if (type === 'articles') {
    selectedArticle.value = null;
    showArticleDialog.value = true;
  } else if (type === 'products') {
    selectedProduct.value = null;
    showProductDialog.value = true;
  }
};

const openEditArticle = (article: Article) => {
  selectedArticle.value = { ...article };
  showArticleDialog.value = true;
};

const openEditProduct = (product: Product) => {
  selectedProduct.value = { ...product };
  showProductDialog.value = true;
};

const handleSaveProduct = async (productData: Partial<Product>) => {
  try {
    if (selectedProduct.value?.id) {
      await productsStore.updateProduct(selectedProduct.value.id, productData);
      $q.notify({
        type: 'positive',
        message: 'Prodotto aggiornato con successo!',
        icon: 'check',
        timeout: 1200,
      });
    } else {
      await productsStore.addProduct(productData);
      $q.notify({
        type: 'positive',
        message: 'Nuovo prodotto aggiunto con successo!',
        icon: 'check',
        timeout: 1200,
      });
    }
    showProductDialog.value = false;
  } catch (error: unknown) {
    logger.error('Error saving product in preview', error);
    $q.notify({
      type: 'negative',
      message: 'Errore durante il salvataggio del prodotto',
    });
  }
};

const openAddSection = (index?: number) => {
  targetAddIndex.value = index !== undefined ? index : sectionsList.value.length - 1;
  showAddSectionDialog.value = true;
};

const addSection = async (type: 'profile' | 'articles' | 'products' | 'actionBanner') => {
  const list = [...sectionsList.value];
  const newId = `${type}_custom_${Date.now().toString(36)}`;
  const insertAt = targetAddIndex.value !== null ? targetAddIndex.value + 1 : list.length;
  list.splice(insertAt, 0, newId);

  const customSections = { ...(settingsStore.profile.customSections || {}) };
  if (type === 'profile') {
    customSections[newId] = {
      title: 'La Mia Filosofia & Consulenza',
      bio: 'Condividi qui una citazione, la filosofia del tuo salone o una presentazione personale approfondita.',
      textAlign: 'center',
      fontFamily: 'serif',
      fontWeight: 'normal',
      titleSize: 'h2',
      maxWidth: 'md',
      showAvatar: false,
      showSocials: false,
    };
  } else if (type === 'products') {
    customSections[newId] = { title: 'Nuova Selezione Prodotti' };
  } else if (type === 'actionBanner') {
    customSections[newId] = {
      bannerText: 'Scopri i nostri percorsi benessere personalizzati',
      bannerButtonText: 'Prenota Ora',
      bannerEnabled: true,
    };
  } else if (type === 'articles') {
    customSections[newId] = { articleFilterType: 'all' };
  }

  await settingsStore.updateProfile({
    sectionsOrder: list,
    customSections,
  });

  showAddSectionDialog.value = false;
  $q.notify({
    type: 'positive',
    message: 'Nuova sezione aggiunta con successo!',
    icon: 'add_circle',
    timeout: 1200,
  });
};

const removeSection = (sectionId: string) => {
  $q.dialog({
    title: 'Elimina Sezione',
    message: `Sei sicuro di voler rimuovere la sezione "${getSectionLabel(sectionId)}" dalla vetrina?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      const list = sectionsList.value.filter((id) => id !== sectionId);
      const customSections = { ...(settingsStore.profile.customSections || {}) };
      delete customSections[sectionId];
      await settingsStore.updateProfile({
        sectionsOrder: list,
        customSections,
      });
      $q.notify({
        type: 'info',
        message: 'Sezione rimossa',
        timeout: 1000,
      });
    })();
  });
};

const openSectionSettings = (sectionId: string) => {
  activeSettingsSection.value = sectionId;
  showSettingsDialog.value = true;
};

const handleSaveSectionSettings = async (
  sectionId: string,
  updatedConfig: CustomSectionConfig,
  profileUpdates?: Partial<PublicProfile>,
) => {
  const customSections = { ...(settingsStore.profile.customSections || {}) };
  customSections[sectionId] = updatedConfig;

  await settingsStore.updateProfile({
    ...(profileUpdates || {}),
    customSections,
  });

  $q.notify({
    type: 'positive',
    message: 'Impostazioni della sezione salvate!',
    icon: 'check',
    timeout: 1200,
  });
};

const handleReorderArticles = async (newList: Article[]) => {
  await settingsStore.updateArticlesOrder(newList);
  $q.notify({ type: 'positive', message: 'Ordine articoli aggiornato', timeout: 800 });
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
        <!-- In-Place Hover Action Toolbar Component (Preview Mode Only) -->
        <SectionToolbar
          v-if="isPreview"
          :section="section"
          :index="index"
          :total-sections="sectionsList.length"
          :is-hidden="isSectionHidden(section)"
          :is-custom="!['profile', 'articles', 'actionBanner', 'products'].includes(section)"
          :section-type="getSectionType(section)"
          :label="getSectionLabel(section)"
          :icon="getSectionIcon(section)"
          @toggle-visibility="toggleSectionVisibility"
          @move-up="moveSection($event, 'up')"
          @move-down="moveSection($event, 'down')"
          @duplicate="duplicateSection"
          @quick-add="openQuickAdd"
          @open-settings="openSectionSettings"
          @remove="removeSection"
        />

        <!-- Section Content Renderer -->

        <!-- 1. Profile / Philosophy & Social Section -->
        <div
          v-if="getSectionType(section) === 'profile'"
          class="max-width-container q-px-md q-pt-xl q-pb-lg text-center"
        >
          <!-- Dynamic / Customizable Avatar -->
          <div
            v-if="getCustomSectionConfig(section).showAvatar !== false"
            class="row justify-center q-mb-md"
          >
            <q-avatar size="140px" class="shadow-3">
              <img
                :src="settingsStore.profile.avatarUrl || 'https://cdn.quasar.dev/img/avatar.png'"
                alt="Ambassador Avatar"
              />
            </q-avatar>
          </div>

          <!-- Dynamic Title & Bio Container -->
          <div :style="getProfileMaxWidthStyle(section)">
            <h1
              class="q-my-none q-mb-sm text-primary"
              :class="getProfileTitleClass(section)"
            >
              {{ getCustomSectionConfig(section).title || settingsStore.profile.name || 'Glow and Care Space' }}
            </h1>

            <p
              class="text-grey-8 text-body1 q-mb-lg"
              :class="getProfileAlignClass(section)"
              style="line-height: 1.6; white-space: pre-line"
            >
              {{
                getCustomSectionConfig(section).bio ||
                settingsStore.profile.bio ||
                'Credo che il benessere nasca dalle piccole scelte quotidiane e dalla curiosità di scoprire nuove possibilità per stare meglio.'
              }}
            </p>

            <!-- Social Media & Contact Links -->
            <template v-if="getCustomSectionConfig(section).showSocials !== false">
              <div class="row justify-center q-gutter-md q-mb-md">
                <q-btn
                  v-if="settingsStore.profile.whatsapp"
                  round
                  outline
                  color="primary"
                  icon="fa-brands fa-whatsapp"
                  type="a"
                  :href="`https://wa.me/${settingsStore.profile.whatsapp}`"
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
                  :href="settingsStore.profile.tiktok.startsWith('http') ? settingsStore.profile.tiktok : `https://tiktok.com/@${settingsStore.profile.tiktok}`"
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
                  :href="settingsStore.profile.instagram.startsWith('http') ? settingsStore.profile.instagram : `https://instagram.com/${settingsStore.profile.instagram}`"
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
                  type="a"
                  :href="`mailto:${settingsStore.profile.email}`"
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
          class="q-mb-xl full-width"
        >
          <ArticleCarousel
            :filter-type="getCustomSectionConfig(section).articleFilterType || 'all'"
            :section-id="section"
            @edit-article="openEditArticle"
          />
        </div>

        <!-- 3. Action Pill Banner Section (Modular Widget) -->
        <ActionPillBanner
          v-else-if="getSectionType(section) === 'actionBanner'"
          :banner-text="getCustomSectionConfig(section).bannerText || settingsStore.profile.actionBannerText"
          :button-text="getCustomSectionConfig(section).bannerButtonText || settingsStore.profile.actionBannerButtonText"
          :target-url="getCustomSectionConfig(section).bannerUrl || bannerTargetUrl"
        />

        <!-- 4. Product Grid Section -->
        <div
          v-else-if="getSectionType(section) === 'products'"
          class="max-width-container q-px-md q-pb-xl"
        >
          <div class="text-center q-mb-lg">
            <h2 class="text-h4 text-weight-light q-mb-sm" :style="{ color: BRAND_PRIMARY }">
              {{ getCustomSectionConfig(section).title || settingsStore.profile.productsSectionTitle || 'I Miei Prodotti Preferiti' }}
            </h2>
            <div class="separator-line mx-auto" :style="{ backgroundColor: BRAND_GOLD }"></div>
          </div>

          <ProductGrid @edit-product="openEditProduct" />
        </div>
      </div>
    </template>

    <!-- Add Section Button at Bottom of Preview -->
    <div v-if="isPreview" class="row justify-center q-py-xl bg-grey-1">
      <q-btn
        unelevated
        color="primary"
        icon="add_circle"
        label="Aggiungi Nuova Sezione alla Pagina"
        size="md"
        class="shadow-3 q-px-xl q-py-sm rounded-borders text-weight-bold"
        @click="openAddSection()"
      />
    </div>

    <!-- Modals & Specialized Dialogs -->
    <ContactDialog v-model="showContactDialog" />
    <ArticleFormDialog v-model="showArticleDialog" :initial-data="selectedArticle" />
    <ProductFormDialog
      v-model="showProductDialog"
      :initial-data="selectedProduct"
      @save="handleSaveProduct"
    />

    <!-- Add Section Modal Dialog Component -->
    <AddSectionDialog
      v-model="showAddSectionDialog"
      @add-section="addSection"
    />

    <!-- Section Settings Modal Dialog Component -->
    <SectionSettingsDialog
      v-model="showSettingsDialog"
      :section-id="activeSettingsSection"
      :custom-config="getCustomSectionConfig(activeSettingsSection)"
      :profile="settingsStore.profile"
      :articles="settingsStore.articles"
      @save="handleSaveSectionSettings"
      @quick-add="openQuickAdd"
      @open-edit-article="openEditArticle"
      @reorder-articles="handleReorderArticles"
    />
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

/* Visual Builder In-Place Styles */
.visual-builder-section-wrapper {
  transition: all 0.25s ease;
  position: relative;
}

.builder-preview-active {
  &:hover {
    outline: 2px dashed rgba(52, 20, 20, 0.45);
    outline-offset: -2px;
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
</style>
