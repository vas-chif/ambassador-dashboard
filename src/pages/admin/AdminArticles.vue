<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useSettingsStore } from 'stores/settings';
import type { Article } from 'stores/settings';
import { useQuasar } from 'quasar';

const store = useSettingsStore();
const $q = useQuasar();

// --- ARTICLES LOGIC --- //
const showArticleDialog = ref(false);
const articleForm = ref<Partial<Article>>({
  id: '',
  title: '',
  description: '',
  linkUrl: '',
  actionText: 'Scopri di più',
  active: true,
  order: 0,
});
const articleFile = ref<File | null>(null);
const isEditingArticle = ref(false);

const openAddArticle = () => {
  isEditingArticle.value = false;
  articleForm.value = {
    id: '',
    title: '',
    description: '',
    linkUrl: '',
    actionText: 'Scopri di più',
    active: true,
    order: (store.articles?.length || 0) + 1,
  };
  articleFile.value = null;
  showArticleDialog.value = true;
};

const openEditArticle = (article: Article) => {
  isEditingArticle.value = true;
  articleForm.value = { ...article };
  articleFile.value = null;
  showArticleDialog.value = true;
};

const handleSaveArticle = async () => {
  if (!articleForm.value.title) {
    $q.notify({ type: 'warning', message: 'Title is required' });
    return;
  }

  try {
    let imageUrl = '';
    // If new file, process it
    if (articleFile.value) {
      imageUrl = await store.processBannerImage(articleFile.value);
    } else if (isEditingArticle.value) {
      // Keep existing image if editing and no new file
      const existing = store.articles?.find((a) => a.id === articleForm.value.id);
      imageUrl = existing?.imageUrl || '';
    }

    if (!imageUrl) {
      $q.notify({ type: 'warning', message: 'Image is required' });
      return;
    }

    const articleData: Omit<Article, 'id'> = {
      title: articleForm.value.title,
      description: articleForm.value.description || '',
      linkUrl: articleForm.value.linkUrl || '',
      actionText: articleForm.value.actionText || 'Scopri di più',
      active: articleForm.value.active ?? true,
      order: articleForm.value.order || 0,
      imageUrl,
    };

    if (isEditingArticle.value && articleForm.value.id) {
      await store.updateArticle(articleForm.value.id, articleData);
      $q.notify({ type: 'positive', message: 'Article updated' });
    } else {
      await store.addArticle(articleData);
      $q.notify({ type: 'positive', message: 'Article added' });
    }
    showArticleDialog.value = false;
  } catch (e) {
    console.error(e);
    $q.notify({ type: 'negative', message: 'Failed to save article' });
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
    <div class="row justify-between items-center q-mb-lg">
      <div class="text-h4">Articles Management</div>
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
    <q-dialog
      v-model="showArticleDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card>
        <q-toolbar class="bg-primary text-white">
          <q-btn flat round dense icon="close" v-close-popup />
          <q-toolbar-title>{{ isEditingArticle ? 'Edit Article' : 'Add Article' }}</q-toolbar-title>
          <q-btn flat label="Save" @click="handleSaveArticle" />
        </q-toolbar>

        <q-card-section class="q-pa-md container-sm">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-8 offset-md-2">
              <div class="text-h6 q-mb-md">Article Details</div>

              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input v-model="articleForm.title" label="Title *" outlined class="text-h6" />
                </div>

                <div class="col-12 col-md-6">
                  <q-input
                    v-model="articleForm.actionText"
                    label="Button Text"
                    outlined
                    hint="e.g. Read More"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <q-input
                    v-model="articleForm.linkUrl"
                    label="Destination URL"
                    outlined
                    hint="https://..."
                  />
                </div>

                <div class="col-12">
                  <q-input
                    v-model="articleForm.description"
                    label="Description / Summary"
                    type="textarea"
                    outlined
                    rows="5"
                  />
                </div>

                <q-separator class="col-12 q-my-sm" />

                <!-- Image Upload -->
                <div class="col-12">
                  <div class="text-subtitle2 q-mb-sm">Cover Image *</div>
                  <q-file
                    v-model="articleFile"
                    label="Upload Image (16:9 Recommended)"
                    outlined
                    accept="image/*"
                    bottom-slots
                  >
                    <template v-slot:prepend><q-icon name="cloud_upload" /></template>
                    <template v-slot:hint> Images are optimized automatically. </template>
                  </q-file>

                  <div
                    v-if="isEditingArticle && !articleFile"
                    class="q-mt-sm row items-center q-gutter-sm bg-grey-2 q-pa-sm rounded-borders"
                  >
                    <q-icon name="image" size="sm" color="grey-7" />
                    <span class="text-caption text-grey-8"
                      >Current image kept. Select new file to change.</span
                    >
                  </div>
                </div>

                <!-- Active Toggle & Order -->
                <div
                  class="col-12 row items-center justify-between q-mt-md bg-grey-1 q-pa-sm rounded-borders"
                >
                  <div>
                    <q-toggle
                      v-model="articleForm.active"
                      label="Published (Visible)"
                      color="green"
                      size="lg"
                      keep-color
                    />
                  </div>
                  <q-input
                    v-model.number="articleForm.order"
                    type="number"
                    label="Sort Order"
                    outlined
                    dense
                    style="width: 100px"
                    bg-color="white"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
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
