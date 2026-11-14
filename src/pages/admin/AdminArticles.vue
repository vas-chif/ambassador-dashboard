<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useArticlesStore } from 'stores/articles';
import { useSettingsStore } from 'stores/settings';
import type { Article } from 'stores/settings';
import { useQuasar } from 'quasar';
import { useSecureLogger } from 'src/shared/logger';

import ArticleFormDialog from 'components/admin/ArticleFormDialog.vue';

const store = useArticlesStore();
const settingsStore = useSettingsStore();
const $q = useQuasar();
const logger = useSecureLogger();

// Search & Filter State
const searchQuery = ref('');
const selectedType = ref<'all' | 'testimonial' | 'product'>('all');

const filteredArticles = computed(() => {
  return (store.articles || []).filter((art) => {
    const q = searchQuery.value.trim().toLowerCase();
    const matchesQuery =
      !q ||
      art.title.toLowerCase().includes(q) ||
      (art.description && art.description.toLowerCase().includes(q));
    const artType = art.layoutConfig?.articleType || 'testimonial';
    const matchesType = selectedType.value === 'all' || artType === selectedType.value;
    return matchesQuery && matchesType;
  });
});

// --- ARTICLES LOGIC --- //
const showArticleDialog = ref(false);
const selectedArticle = ref<Article | null>(null);
const isDuplicating = ref(false);

const openAddArticle = () => {
  selectedArticle.value = null;
  showArticleDialog.value = true;
};

const openEditArticle = (article: Article) => {
  selectedArticle.value = { ...article };
  showArticleDialog.value = true;
};

const duplicateArticle = async (article: Article) => {
  if (isDuplicating.value) return;
  isDuplicating.value = true;
  try {
    const clone: Partial<Article> = { ...article };
    delete clone.id;
    await store.addArticle({
      ...clone,
      title: `${article.title} (Copia)`,
      order: (store.articles || []).length,
    } as Omit<Article, 'id'>);
    $q.notify({
      type: 'positive',
      message: `Articolo "${article.title}" duplicato con successo!`,
      icon: 'content_copy',
    });
  } catch (e) {
    logger.error('Errore duplicazione articolo:', e);
    $q.notify({ type: 'negative', message: 'Errore durante la duplicazione dell\'articolo' });
  } finally {
    isDuplicating.value = false;
  }
};

const confirmDeleteArticle = (article: Article) => {
  $q.dialog({
    title: 'Confirm',
    message: `Delete article "${article.title}"?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await store.deleteArticle(article.id);
        $q.notify({ type: 'positive', message: 'Article deleted' });
      } catch (e) {
        logger.error('Failed to delete article:', e);
        $q.notify({ type: 'negative', message: 'Failed to delete' });
      }
    })();
  });
};

const toggleArticleStatus = async (article: Article) => {
  try {
    const newStatus = !article.active;
    await store.updateArticle(article.id, { active: newStatus });
    $q.notify({
      type: 'positive',
      message: `Article ${newStatus ? 'visible' : 'hidden'}`,
      timeout: 1000,
    });
  } catch (e) {
    logger.error('Failed to update status:', e);
    $q.notify({ type: 'negative', message: 'Failed to update status' });
  }
};

onMounted(() => {
  settingsStore.subscribeToProfile();
  store.subscribeToArticles();
});

onUnmounted(() => {
  store.unsubscribeAll();
  settingsStore.unsubscribeAll();
});
</script>

<template>
  <q-page class="q-pa-md max-width-container">
    <div class="row justify-between items-center q-mb-md">
      <div>
        <div class="text-h4">Articles & Highlights</div>
        <div class="text-caption text-grey-8 q-mt-xs">
          Gestione dei contenuti informativi e delle storie mostrate nel carosello in cima alla homepage. Per i prodotti con prezzo e catalogo vendita, usa la sezione <router-link to="/admin/products" class="text-primary text-weight-bold">Prodotti</router-link>.
        </div>
      </div>
      <q-btn color="primary" icon="add" label="Add Article" @click="openAddArticle" size="lg" />
    </div>

    <!-- Search & Category Filter Bar -->
    <div v-if="store.articles && store.articles.length > 0" class="row items-center q-col-gutter-sm q-mb-lg">
      <div class="col-12 col-md-6">
        <q-input
          v-model="searchQuery"
          dense
          outlined
          clearable
          placeholder="Cerca per titolo o descrizione..."
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div class="col-12 col-md-6 row items-center q-gutter-xs">
        <q-btn
          unelevated
          rounded
          no-caps
          size="sm"
          :color="selectedType === 'all' ? 'primary' : 'grey-3'"
          :text-color="selectedType === 'all' ? 'white' : 'grey-9'"
          class="text-weight-bold q-px-md"
          @click="selectedType = 'all'"
        >
          Tutti ({{ (store.articles || []).length }})
        </q-btn>
        <q-btn
          unelevated
          rounded
          no-caps
          size="sm"
          :color="selectedType === 'testimonial' ? 'primary' : 'grey-3'"
          :text-color="selectedType === 'testimonial' ? 'white' : 'grey-9'"
          icon="photo_camera_front"
          class="text-weight-bold q-px-md"
          @click="selectedType = 'testimonial'"
        >
          Testimonianze
        </q-btn>
        <q-btn
          unelevated
          rounded
          no-caps
          size="sm"
          :color="selectedType === 'product' ? 'primary' : 'grey-3'"
          :text-color="selectedType === 'product' ? 'white' : 'grey-9'"
          icon="sanitizer"
          class="text-weight-bold q-px-md"
          @click="selectedType = 'product'"
        >
          Schede Prodotto
        </q-btn>
      </div>
    </div>

    <!-- Article Grid -->
    <div v-if="filteredArticles.length > 0" class="row q-col-gutter-md">
      <div v-for="article in filteredArticles" :key="article.id" class="col-12 col-md-6 col-lg-4">
        <q-card
          bordered
          flat
          class="column full-height hover-scale transition-easy"
          style="overflow: hidden"
        >
          <q-img :src="article.imageUrl" :ratio="16 / 9" fit="cover">
            <div class="absolute-top-right bg-transparent q-pa-sm">
              <q-chip :color="article.active ? 'green' : 'grey'" text-color="white" size="sm">
                {{ article.active ? 'Active' : 'Inactive' }}
              </q-chip>
            </div>
          </q-img>
          <q-card-section>
            <div class="text-h6 ellipsis">{{ article.title }}</div>
            <div class="text-caption text-grey ellipsis-3-lines" style="min-height: 4em">
              {{ article.description }}
            </div>
            <div
              class="q-mt-md row items-center no-wrap text-blue"
              style="max-width: 100%; overflow: hidden"
            >
              <q-icon name="link" size="xs" class="q-mr-xs flex-shrink-0" />
              <span class="ellipsis col" style="min-width: 0">{{ article.linkUrl }}</span>
            </div>
          </q-card-section>
          <q-card-actions align="right" class="q-mt-auto bg-grey-1 row no-wrap" style="width: 100%">
            <q-btn
              flat
              round
              :icon="article.active ? 'visibility' : 'visibility_off'"
              :color="article.active ? 'green' : 'grey'"
              @click="toggleArticleStatus(article)"
            >
              <q-tooltip>{{ article.active ? 'Hide' : 'Show' }}</q-tooltip>
            </q-btn>
            <q-btn flat round icon="content_copy" color="secondary" @click="duplicateArticle(article)">
              <q-tooltip>Duplica Articolo</q-tooltip>
            </q-btn>
            <q-btn flat round icon="edit" color="primary" @click="openEditArticle(article)">
              <q-tooltip>Edit</q-tooltip>
            </q-btn>
            <q-btn flat round icon="delete" color="negative" @click="confirmDeleteArticle(article)">
              <q-tooltip>Delete</q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Empty Search State -->
    <div
      v-else-if="store.articles && store.articles.length > 0 && filteredArticles.length === 0"
      class="column flex-center q-pa-xl text-grey bg-grey-1 rounded-borders dashed-border text-center"
    >
      <q-icon name="search_off" size="4rem" color="grey-5" class="q-mb-sm" />
      <div class="text-h6">Nessun articolo trovato</div>
      <div class="text-caption q-mb-md">Prova a modificare i criteri di ricerca o seleziona una tipologia diversa.</div>
      <q-btn outline color="primary" label="Reimposta Filtri" @click="searchQuery = ''; selectedType = 'all'" />
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="column flex-center q-pa-xl text-grey bg-grey-1 rounded-borders dashed-border"
    >
      <q-icon name="article" size="6rem" color="grey-4" />
      <div class="text-h5 q-mt-md">No Articles Found</div>
      <div class="q-mb-lg">Create your first article to display on the homepage</div>
      <q-btn outline color="primary" label="Create Article" @click="openAddArticle" />
    </div>

    <!-- Article Dialog -->
    <ArticleFormDialog v-model="showArticleDialog" :initial-data="selectedArticle" />
  </q-page>
</template>

<style scoped>
.max-width-container {
  max-width: 1400px;
  margin: 0 auto;
}
.dashed-border {
  border: 2px dashed #e0e0e0;
}
.container-sm {
  max-width: 900px;
  margin: 0 auto;
}
.hover-scale:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
