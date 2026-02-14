<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSettingsStore } from 'stores/settings';
import ProductGrid from 'components/widgets/ProductGrid.vue';
import ArticleCarousel from 'components/widgets/ArticleCarousel.vue';
import ContactDialog from 'components/widgets/ContactDialog.vue';

// "Dr. Simon Ourian" brand colors constant for reference
const BRAND_PRIMARY = '#101010';
const BRAND_GOLD = '#D4AF37';

const settingsStore = useSettingsStore();
const showContactDialog = ref(false);

onMounted(() => {
  settingsStore.subscribeToProfile();
  settingsStore.subscribeToArticles();
});
</script>

<template>
  <q-page class="q-pa-none bg-white">
    <!-- Hero/Profile Section -->
    <div class="row justify-center items-center q-py-xl q-px-md relative-position min-h-hero">
      <!-- Profile (Centered) -->
      <div class="col-12 col-md-auto column flex-center text-center">
        <!-- Full Profile Skeleton Loader -->
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

        <!-- Actual Profile Content -->
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

    <!-- Dynamic Article Carousel -->
    <div class="q-mb-xl">
      <ArticleCarousel />
    </div>

    <!-- Separator 1 -->
    <div class="max-width-container q-px-md">
      <q-separator color="grey-3" />
    </div>

    <!-- Simon Ourian Action Banner (The pill banner) -->
    <div class="max-width-container q-pa-md q-my-xl">
      <div class="row justify-center">
        <div class="col-12 col-md-10 col-lg-8">
          <a
            href="https://simonourianmd.com/beautyrosebyrosy"
            target="_blank"
            class="action-pill-banner row no-wrap items-center justify-between q-pa-md shadow-4"
          >
            <div class="banner-text q-pl-lg">
              <div class="text-h6 text-primary text-weight-medium line-height-tight q-mb-sm">
                Acquisita qui con codice sconto la tua Skin Care <br />
                e integrazione personalizzata
              </div>
            </div>
            <div class="banner-image">
              <q-avatar size="100px" class="shadow-8">
                <q-btn
                  color="primary"
                  label="Skin Care"
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

    <!-- Separator 2 -->
    <div class="max-width-container q-px-md q-mb-xl">
      <q-separator color="grey-3" />
    </div>

    <!-- Product Grid -->
    <div class="max-width-container q-px-md q-pb-xl">
      <div class="text-center q-mb-lg">
        <h2 class="text-h4 text-weight-light q-mb-sm" :style="{ color: BRAND_PRIMARY }">
          I Miei Prodotti Preferiti
        </h2>
        <div class="separator-line mx-auto" :style="{ backgroundColor: BRAND_GOLD }"></div>
      </div>

      <ProductGrid />
    </div>

    <!-- Contact Dialog -->
    <ContactDialog v-model="showContactDialog" />
  </q-page>
</template>

<style scoped>
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
  background-color: #f7f7f4; /* Light cream/grey */
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

@media (max-width: 600px) {
  .action-pill-banner {
    border-radius: 30px;
    padding: 12px !important;
  }
  .banner-text .text-h6 {
    font-size: 1.1rem;
  }
  .banner-image .q-avatar {
    size: 70px !important;
    width: 70px !important;
    height: 70px !important;
  }
}
</style>
