<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import ProductGrid from 'components/widgets/ProductGrid.vue';
import ContactDialog from 'components/widgets/ContactDialog.vue';
import { useSettingsStore } from 'stores/settings';

const settings = useSettingsStore();
const showContactDialog = ref(false);

onMounted(() => {
  settings.subscribeToProfile();
});

onUnmounted(() => {
  settings.unsubscribeFromProfile();
});
</script>

<template>
  <q-page class="bg-grey-1">
    <!-- Hero/Profile Section -->
    <div class="row justify-center items-center q-py-xl q-px-md relative-position min-h-hero">
      <!-- Profile (Centered) -->
      <div class="col-12 col-md-auto column flex-center text-center">
        <!-- Full Profile Skeleton Loader -->
        <template v-if="settings.loading">
          <q-skeleton type="circle" size="150px" class="q-mb-md" />
          <q-skeleton type="text" width="200px" class="text-h2" />
          <q-skeleton type="text" width="300px" class="q-mt-sm" />
          <q-skeleton type="text" width="250px" />
          <div class="row q-gutter-md q-mt-lg justify-center">
            <q-skeleton type="QBtn" size="40px" />
            <q-skeleton type="QBtn" size="40px" />
            <q-skeleton type="QBtn" size="40px" />
          </div>
        </template>

        <!-- Actual Profile Content -->
        <template v-else>
          <q-avatar size="150px" class="q-mb-md shadow-3">
            <q-skeleton v-if="!settings.profile.avatarUrl" type="circle" size="150px" />
            <img
              v-else
              :src="settings.profile.avatarUrl"
              style="object-fit: cover; width: 100%; height: 100%"
            />
          </q-avatar>
          <div class="text-h2 text-primary q-mb-sm font-serif">{{ settings.profile.name }}</div>
          <div class="text-subtitle1 text-grey-8" style="max-width: 400px">
            {{ settings.profile.bio }}
          </div>

          <!-- Social Media Links -->
          <div class="row q-gutter-md q-mt-lg justify-center">
            <q-btn
              v-if="settings.profile.email"
              round
              outline
              color="primary"
              icon="email"
              @click="showContactDialog = true"
            >
              <q-tooltip>Send Email</q-tooltip>
            </q-btn>
            <q-btn
              v-if="settings.profile.whatsapp"
              round
              outline
              color="primary"
              icon="fa-brands fa-whatsapp"
              type="a"
              :href="'https://wa.me/' + settings.profile.whatsapp.replace('+', '')"
              target="_blank"
            >
              <q-tooltip>WhatsApp</q-tooltip>
            </q-btn>
            <q-btn
              v-if="settings.profile.instagram"
              round
              outline
              color="primary"
              icon="fa-brands fa-instagram"
              type="a"
              :href="settings.profile.instagram"
              target="_blank"
            >
              <q-tooltip>Instagram</q-tooltip>
            </q-btn>
          </div>
        </template>
      </div>

      <!-- ID Card (Absolute Right on Desktop, Stacked on Mobile) -->
    </div>

    <!-- Featured Products -->
    <div class="full-width q-px-xl">
      <q-separator class="q-mb-lg" />
      <ProductGrid title="I nostri ultimi prodotti" />
    </div>

    <!-- Contact Dialog -->
    <ContactDialog v-model="showContactDialog" />
  </q-page>
</template>

<style scoped>
.font-serif {
  font-family: 'Playfair Display', serif;
}
.digital-card {
  width: 280px; /* Reduced width */
  padding: 10px 15px; /* Compact padding */
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}
.min-h-hero {
  min-height: 400px;
}
/* Desktop Positioning */
@media (min-width: 1024px) {
  .display-card-wrapper {
    position: absolute;
    right: 15%; /* Position to the right */
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
