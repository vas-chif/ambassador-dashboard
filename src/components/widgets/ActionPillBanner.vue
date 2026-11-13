<script setup lang="ts">
/**
 * @file ActionPillBanner.vue
 * @description Widget riutilizzabile per il banner promozionale a forma di pillola con bottone d'azione.
 * @author Vasile Chifeac (AI Agent)
 */

withDefaults(
  defineProps<{
    bannerText?: string | undefined;
    buttonText?: string | undefined;
    targetUrl?: string | undefined;
  }>(),
  {
    bannerText: 'Acquista qui con codice sconto la tua Skin Care e integrazione personalizzata',
    buttonText: 'Skin Care',
    targetUrl: '',
  },
);
</script>

<template>
  <div class="max-width-container q-pa-md q-my-xl">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <a
          :href="targetUrl || '#'"
          :target="targetUrl && targetUrl.startsWith('http') ? '_blank' : undefined"
          class="action-pill-banner row no-wrap items-center justify-between q-pa-md shadow-4"
        >
          <div class="banner-text q-pl-lg">
            <div class="text-h6 text-primary text-weight-medium line-height-tight q-mb-sm">
              {{ bannerText }}
            </div>
          </div>
          <div class="banner-image q-pr-lg">
            <q-avatar size="100px" class="shadow-8">
              <q-btn
                color="primary"
                :label="buttonText"
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
</template>

<style scoped lang="scss">
.max-width-container {
  max-width: 1400px;
  margin: 0 auto;
}

.action-pill-banner {
  background-color: #f7f7f4;
  border-radius: 100px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
    background-color: #ffffff;
  }
}

.line-height-tight {
  line-height: 1.25;
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
    width: 85px !important;
    height: 85px !important;
  }
}
</style>
