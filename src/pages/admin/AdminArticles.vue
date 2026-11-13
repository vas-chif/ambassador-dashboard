<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useSettingsStore } from 'stores/settings';
import type { Article } from 'stores/settings';
import { useQuasar } from 'quasar';

import ArticleFormDialog from 'components/admin/ArticleFormDialog.vue';

const store = useSettingsStore();
const $q = useQuasar();

// --- ARTICLES LOGIC --- //
const showArticleDialog = ref(false);
const selectedArticle = ref<Article | null>(null);

const openAddArticle = () => {
  selectedArticle.value = null;
  showArticleDialog.value = true;
};

const openEditArticle = (article: Article) => {
  selectedArticle.value = { ...article };
  showArticleDialog.value = true;
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
        console.error(e);
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
    console.error(e);
    $q.notify({ type: 'negative', message: 'Failed to update status' });
  }
};

onMounted(() => {
  store.subscribeToProfile();
  store.subscribeToArticles();
});

onUnmounted(() => {
  store.unsubscribeAll();
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

    <!-- Article Grid -->
    <div v-if="store.articles && store.articles.length > 0" class="row q-col-gutter-md">
      <div v-for="article in store.articles" :key="article.id" class="col-12 col-md-6 col-lg-4">
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
