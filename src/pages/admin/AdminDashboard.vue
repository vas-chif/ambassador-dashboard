<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useProductsStore } from 'stores/products';
import { useSettingsStore } from 'stores/settings';
import { useRouter } from 'vue-router';
import { ADMIN_NAV_ITEMS } from 'src/shared/navigation';
import QuickQrCodesWidget from 'components/admin/QuickQrCodesWidget.vue';

const productStore = useProductsStore();
const settingsStore = useSettingsStore();

onMounted(() => {
  productStore.subscribeToProducts();
  settingsStore.subscribeToArticles();
  settingsStore.subscribeToProfile();
});

const kpiData = computed(() => {
  return ADMIN_NAV_ITEMS.filter((it) => it.to !== '/admin/dashboard').map((it) => {
    let value: string | number = '...';

    if (it.to === '/admin/preview') value = 'Visual Editor';
    if (it.to === '/admin/products') value = productStore.products.length;
    if (it.to === '/admin/articles') value = settingsStore.articles.length;
    if (it.to === '/admin/settings') value = settingsStore.profile.name ? 'Active' : 'Configure';

    return { ...it, value };
  });
});

const router = useRouter();

const navigateTo = (path: string) => {
  void router.push(path);
};
</script>

<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4">Dashboard</div>
      <q-btn
        color="primary"
        icon="visibility"
        label="Live Preview Vetrina"
        to="/admin/preview"
      />
    </div>

    <!-- Quick Action Banner for Live Preview -->
    <q-card flat bordered class="q-pa-md q-mb-lg bg-gradient-brand text-white shadow-2">
      <div class="row items-center justify-between">
        <div class="row items-center q-gutter-md">
          <q-avatar size="48px" icon="devices" color="white" text-color="primary" />
          <div>
            <div class="text-h6 text-weight-bold">Personalizza la tua Vetrina in Tempo Reale</div>
            <div class="text-caption text-grey-3">
              Guarda come appare il tuo sito su Smartphone e Desktop, sposta le sezioni, nascondi blocchi e modifica i titoli all'istante.
            </div>
          </div>
        </div>
        <q-btn
          color="white"
          text-color="primary"
          label="Apri Visual Editor"
          icon-right="arrow_forward"
          to="/admin/preview"
          class="q-mt-sm q-mt-md-none"
        />
      </div>
    </q-card>

    <div class="row q-col-gutter-md q-mb-xl">
      <div v-for="kpi in kpiData" :key="kpi.label" class="col-12 col-sm-6 col-md-3">
        <q-card
          class="q-pa-sm full-height cursor-pointer hover-card shadow-1"
          @click="navigateTo(kpi.to)"
          v-ripple
        >
          <q-item>
            <q-item-section avatar>
              <q-avatar :icon="kpi.icon" :color="kpi.color" text-color="white" />
            </q-item-section>

            <q-item-section>
              <q-item-label
                class="text-grey-7 text-uppercase text-weight-bold"
                style="font-size: 0.7rem"
              >
                {{ kpi.label }}
              </q-item-label>
              <q-item-label class="text-h6 text-weight-bold">{{ kpi.value }}</q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-icon name="chevron_right" color="grey-4" />
            </q-item-section>
          </q-item>
        </q-card>
      </div>
    </div>

    <!-- Quick QR Codes Widget for Counter Scan, Download & Print -->
    <QuickQrCodesWidget />
  </q-page>
</template>

<style scoped>
.bg-gradient-brand {
  background: linear-gradient(135deg, var(--q-primary, #341414) 0%, #1f2937 100%);
  border-radius: 12px;
}
.hover-card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
</style>
