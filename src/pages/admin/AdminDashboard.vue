<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useProductsStore } from 'stores/products';
import { useSettingsStore } from 'stores/settings';
import { useRouter } from 'vue-router';
import { ADMIN_NAV_ITEMS } from 'src/shared/navigation';

const productStore = useProductsStore();
const settingsStore = useSettingsStore();

onMounted(() => {
  productStore.subscribeToProducts();
  settingsStore.subscribeToArticles();
  // In a real app, you would fetch orders/sales from an Orders store
});

const kpiData = computed(() => {
  return ADMIN_NAV_ITEMS.filter((it) => it.to !== '/admin/dashboard').map((it) => {
    let value: string | number = '...';

    if (it.to === '/admin/products') value = productStore.products.length;
    if (it.to === '/admin/articles') value = settingsStore.articles.length;
    if (it.to === '/admin/settings') value = settingsStore.profile.name ? 'Active' : 'Configure';
    if (it.to === '/admin/ambassadors') value = 'Manage';

    return { ...it, value };
  });
});

const router = useRouter();

const navigateTo = (path: string) => {
  void router.push(path);
};

const notifications = [
  { id: 1, message: 'Welcome to your new dashboard!', time: 'Now' },
  { id: 2, message: "Don't forget to customize your settings.", time: '1h ago' },
];
</script>

<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4">Dashboard</div>

      <!-- Notification Bell -->
      <q-btn flat round dense icon="notifications" color="grey-7">
        <q-badge color="red" floating>2</q-badge>
        <q-menu>
          <q-list style="min-width: 250px">
            <q-item-label header>Notifications</q-item-label>
            <q-item v-for="notif in notifications" :key="notif.id" clickable v-close-popup>
              <q-item-section>
                <q-item-label>{{ notif.message }}</q-item-label>
                <q-item-label caption>{{ notif.time }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
        <q-tooltip>Recent Alerts</q-tooltip>
      </q-btn>
    </div>

    <div class="row q-col-gutter-md">
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
              <q-item-label class="text-grey-7 text-uppercase text-weight-bold" style="font-size: 0.7rem">
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
  </q-page>
</template>
