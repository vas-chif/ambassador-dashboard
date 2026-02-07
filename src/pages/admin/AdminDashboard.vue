<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useProductsStore } from 'stores/products';
import { useSettingsStore } from 'stores/settings';

const productStore = useProductsStore();
const settingsStore = useSettingsStore();

onMounted(() => {
  productStore.subscribeToProducts();
  // In a real app, you would fetch orders/sales from an Orders store
});

const kpiData = computed(() => {
  return [
    {
      label: 'Total Sales',
      value: '€ 0.00',
      icon: 'payments',
      color: 'green',
      caption: 'Requires "Orders" module',
    },
    {
      label: 'Profile Status',
      value: settingsStore.profile.name ? 'Active' : 'Incomplete',
      icon: 'verified_user',
      color: 'blue',
    },
    {
      label: 'Color Theme',
      value: settingsStore.profile.primaryColor,
      icon: 'palette',
      color: 'orange',
    },
    {
      label: 'Products',
      value: productStore.products.length,
      icon: 'inventory_2',
      color: 'purple',
    },
  ];
});

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
        <q-card class="q-pa-sm full-height">
          <q-item>
            <q-item-section avatar>
              <q-avatar :icon="kpi.icon" :color="kpi.color" text-color="white" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-grey">{{ kpi.label }}</q-item-label>
              <q-item-label class="text-h6">{{ kpi.value }}</q-item-label>
              <q-item-label caption v-if="kpi.caption" class="text-orange">{{
                kpi.caption
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-card>
      </div>
    </div>
  </q-page>
</template>
