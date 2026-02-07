<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import ProductGrid from 'components/widgets/ProductGrid.vue';
import { useSettingsStore } from 'stores/settings';

const settings = useSettingsStore();

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
      <div class="col-12 col-md-auto column flex-center text-center z-top">
        <q-avatar size="150px" class="q-mb-md shadow-3">
          <img
            :src="settings.profile.avatarUrl || 'https://placehold.co/200'"
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
            type="a"
            :href="'mailto:' + settings.profile.email"
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
      </div>

      <!-- ID Card (Absolute Right on Desktop, Stacked on Mobile) -->
    </div>

    <!-- Featured Products -->
    <div class="full-width q-px-xl">
      <q-separator class="q-mb-lg" />
      <ProductGrid title="Our Latest Products" />
    </div>
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
