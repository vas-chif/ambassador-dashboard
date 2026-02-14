<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { QrCode } from 'stores/settings';
import { useSettingsStore } from 'stores/settings';
import { useQuasar } from 'quasar';

const store = useSettingsStore();
const $q = useQuasar();

const activeTab = ref('profile');

// QR Code Logic
const newQrName = ref('');
const newQrFile = ref<File | null>(null);
const showZoom = ref(false);
const showEdit = ref(false);
const selectedQr = ref<QrCode | null>(null);
const editQrName = ref('');

const openEditQr = (qr: QrCode) => {
  selectedQr.value = qr;
  editQrName.value = qr.name;
  showEdit.value = true;
};

const handleUpdateQr = async () => {
  if (!selectedQr.value || !editQrName.value) return;
  try {
    await store.updateQrCode(selectedQr.value.id, editQrName.value);
    $q.notify({ type: 'positive', message: 'QR Code updated' });
    showEdit.value = false;
  } catch (e) {
    console.error(e);
    $q.notify({ type: 'negative', message: 'Failed to update' });
  }
};

const handleAddQr = async () => {
  if (!newQrName.value || !newQrFile.value) {
    $q.notify({ type: 'warning', message: 'Please provide both name and file' });
    return;
  }
  try {
    await store.addQrCode(newQrName.value, newQrFile.value);
    $q.notify({ type: 'positive', message: 'QR Code added successfully' });
    newQrName.value = '';
    newQrFile.value = null;
  } catch (e) {
    console.error(e);
    $q.notify({ type: 'negative', message: 'Failed to add QR Code' });
  }
};

const confirmDeleteQr = (qr: QrCode) => {
  $q.dialog({
    title: 'Confirm',
    message: `Delete QR Code "${qr.name}"?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      try {
        await store.removeQrCode(qr.id);
        $q.notify({ type: 'positive', message: 'QR Code removed' });
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to remove' });
      }
    })();
  });
};

const openZoom = (qr: QrCode) => {
  selectedQr.value = qr;
  showZoom.value = true;
};

const downloadQr = async (qr: QrCode) => {
  try {
    // Should work without CORS now if base64, or direct download
    const response = await fetch(qr.url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${qr.name.replace(/\s+/g, '_')}_qrcode.png`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (e) {
    console.error(e);
    // Fallback try simple link
    window.open(qr.url, '_blank');
  }
};

const form = ref({
  name: '',
  bio: '',
  primaryColor: '#000000',
  secondaryColor: '#000000',
  whatsapp: '',
  instagram: '',
  tiktok: '',
  email: '',
  emailJsConfig: {
    serviceId: '',
    templateId: '',
    publicKey: '',
  },
});

// Sync form with store when profile data loads
watch(
  () => store.profile,
  (newVal) => {
    if (newVal) {
      form.value.name = newVal.name;
      form.value.bio = newVal.bio;
      form.value.primaryColor = newVal.primaryColor;
      form.value.secondaryColor = newVal.secondaryColor;
      form.value.whatsapp = newVal.whatsapp || '';
      form.value.instagram = newVal.instagram || '';
      form.value.tiktok = newVal.tiktok || '';
      form.value.email = newVal.email || '';

      if (newVal.emailJsConfig) {
        form.value.emailJsConfig = { ...newVal.emailJsConfig };
      }
    }
  },
  { immediate: true, deep: true },
);

onMounted(() => {
  store.subscribeToProfile();
});

onUnmounted(() => {
  store.unsubscribeFromProfile();
});

const avatarFile = ref<File | null>(null);

const onFileSelected = async (file: File | null) => {
  if (file) {
    try {
      $q.loading.show({ message: 'Uploading avatar...' });
      const url = await store.uploadAvatar(file);
      // Update store immediately so UI reflects it
      await store.updateProfile({ avatarUrl: url });

      $q.loading.hide();
      $q.notify({ type: 'positive', message: 'Avatar updated' });

      // Reset file input
      avatarFile.value = null;
    } catch (e) {
      console.error(e);
      $q.loading.hide();
      $q.notify({ type: 'negative', message: 'Upload failed' });
    }
  }
};

const palettes = [
  { name: 'Classic Blue', primary: '#1976D2', secondary: '#26A69A' },
  { name: 'Luxury Gold', primary: '#101010', secondary: '#D4AF37' },
  { name: 'Nature', primary: '#2E7D32', secondary: '#81C784' },
  { name: 'Sunset', primary: '#E65100', secondary: '#FFB74D' },
  { name: 'Berry', primary: '#880E4F', secondary: '#EC407A' },
  { name: 'Ocean', primary: '#01579B', secondary: '#4FC3F7' },
];

const applyPalette = (p: { primary: string; secondary: string }) => {
  form.value.primaryColor = p.primary;
  form.value.secondaryColor = p.secondary;
  $q.notify({ message: 'Palette applied!', color: 'primary', timeout: 1000, icon: 'palette' });
};

const saveSettings = async () => {
  try {
    await store.updateProfile(form.value);
    $q.notify({ type: 'positive', message: 'Settings saved successfully' });
  } catch (e) {
    console.error(e);
    $q.notify({ type: 'negative', message: 'Failed to save settings' });
  }
};
</script>

<template>
  <q-page class="q-pa-md max-width-container">
    <div class="text-h4 q-mb-lg">Settings & Assets</div>

    <q-card flat bordered>
      <q-tabs
        v-model="activeTab"
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="profile" icon="person" label="Profile" />
        <q-tab name="qr" icon="qr_code" label="QR Codes" />
        <q-tab name="email" icon="mail" label="Email Config" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated>
        <!-- PROFILE TAB -->
        <q-tab-panel name="profile" class="q-pa-lg">
          <q-form @submit.prevent="saveSettings" class="q-gutter-y-lg">
            <!-- Avatar Section -->
            <div class="row items-center q-gutter-x-lg">
              <q-avatar size="100px" class="shadow-2">
                <img
                  :src="store.profile.avatarUrl || 'https://placehold.co/200'"
                  style="object-fit: cover; width: 100%; height: 100%"
                />
              </q-avatar>
              <div class="col">
                <div class="text-subtitle2 q-mb-sm">Profile Picture</div>
                <q-file
                  outlined
                  dense
                  v-model="avatarFile"
                  label="Change Avatar"
                  accept="image/*"
                  class="full-width"
                  @update:model-value="onFileSelected"
                >
                  <template v-slot:prepend>
                    <q-icon name="cloud_upload" />
                  </template>
                </q-file>
              </div>
            </div>

            <q-separator />

            <!-- Profile Info -->
            <div class="text-h6">Personal Details</div>
            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.name"
                  label="Display Name"
                  outlined
                  hint="Your name as it appears on the home page"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="form.bio"
                  label="Bio / Tagline"
                  outlined
                  type="textarea"
                  autogrow
                  hint="A short description about you or your shop"
                />
              </div>
            </div>

            <div class="text-h6 q-mt-lg">Social Media Contacts</div>
            <div class="row q-col-gutter-lg">
              <div class="col-12 col-sm-6">
                <q-input v-model="form.email" label="Email Address" outlined icon="email">
                  <template v-slot:prepend><q-icon name="email" /></template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.whatsapp"
                  label="WhatsApp Number"
                  outlined
                  hint="e.g. +39333..."
                >
                  <template v-slot:prepend><q-icon name="message" /></template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="form.instagram" label="Instagram User/Link" outlined prefix="@">
                  <template v-slot:prepend><q-icon name="camera_alt" /></template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="form.tiktok" label="TikTok User/Link" outlined prefix="@">
                  <template v-slot:prepend><q-icon name="fa-brands fa-tiktok" /></template>
                </q-input>
              </div>
            </div>

            <q-separator />

            <!-- Theme Configuration -->
            <div class="text-h6">Theme Colors</div>
            <div class="row q-col-gutter-lg">
              <div class="col-12 col-sm-6">
                <q-input filled v-model="form.primaryColor" class="my-input" label="Primary Color">
                  <template v-slot:prepend>
                    <div
                      class="color-preview shadow-1"
                      :style="{ backgroundColor: form.primaryColor }"
                    ></div>
                  </template>
                  <template v-slot:append>
                    <q-icon
                      name="colorize"
                      class="cursor-pointer"
                      :style="{ color: form.primaryColor }"
                    >
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-color v-model="form.primaryColor" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  filled
                  v-model="form.secondaryColor"
                  class="my-input"
                  label="Secondary Color"
                >
                  <template v-slot:prepend>
                    <div
                      class="color-preview shadow-1"
                      :style="{ backgroundColor: form.secondaryColor }"
                    ></div>
                  </template>
                  <template v-slot:append>
                    <q-icon
                      name="colorize"
                      class="cursor-pointer"
                      :style="{ color: form.secondaryColor }"
                    >
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-color v-model="form.secondaryColor" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <!-- Quick Palettes -->
            <div class="text-h6 q-mt-lg">Quick Palettes</div>
            <div class="text-caption text-grey q-mb-sm">Pick a predefined style</div>
            <div class="row q-gutter-md">
              <div
                v-for="palette in palettes"
                :key="palette.name"
                class="cursor-pointer shadow-1 hover-scale transition-easy rounded-borders overflow-hidden"
                style="width: 60px; height: 60px; display: flex; flex-direction: column"
                @click="applyPalette(palette)"
              >
                <div :style="{ backgroundColor: palette.primary, flex: 1 }"></div>
                <div :style="{ backgroundColor: palette.secondary, flex: 1 }"></div>
                <q-tooltip>{{ palette.name }}</q-tooltip>
              </div>
            </div>

            <div class="row justify-end q-mt-xl">
              <q-btn
                label="Save Changes"
                type="submit"
                color="primary"
                size="lg"
                :loading="store.loading"
                icon="save"
              />
            </div>
          </q-form>
        </q-tab-panel>

        <!-- QR CODES TAB -->
        <q-tab-panel name="qr" class="q-pa-lg">
          <div class="row q-col-gutter-lg">
            <!-- Upload Section -->
            <div class="col-12">
              <q-card bordered flat class="bg-grey-1">
                <q-card-section class="q-pa-md">
                  <div class="text-subtitle1 q-mb-sm">Add New QR Code</div>
                  <div class="row q-col-gutter-md items-center">
                    <div class="col-12 col-sm-5">
                      <q-input
                        v-model="newQrName"
                        label="QR Name"
                        dense
                        outlined
                        bg-color="white"
                      />
                    </div>
                    <div class="col-12 col-sm-5">
                      <q-file
                        v-model="newQrFile"
                        label="Upload Image"
                        dense
                        outlined
                        bg-color="white"
                        accept="image/*"
                      >
                        <template v-slot:prepend><q-icon name="attach_file" /></template>
                      </q-file>
                    </div>
                    <div class="col-12 col-sm-2">
                      <q-btn
                        label="Upload"
                        color="primary"
                        unelevated
                        class="full-width"
                        @click="handleAddQr"
                        :loading="store.loading"
                        :disable="!newQrName || !newQrFile"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- QR Grid -->
            <div class="col-12" v-if="store.profile.qrCodes && store.profile.qrCodes.length > 0">
              <div class="row q-col-gutter-md">
                <div
                  class="col-6 col-sm-4 col-md-3"
                  v-for="qr in store.profile.qrCodes"
                  :key="qr.id"
                >
                  <q-card class="column full-height">
                    <q-img
                      :src="qr.url"
                      ratio="1"
                      class="cursor-pointer bg-grey-2"
                      @click="openZoom(qr)"
                      fit="contain"
                    >
                      <div class="absolute-bottom text-subtitle2 text-center p-xs">
                        {{ qr.name }}
                      </div>
                    </q-img>
                    <q-separator />
                    <q-card-actions align="right">
                      <q-btn
                        flat
                        round
                        size="sm"
                        icon="edit"
                        color="warning"
                        @click="openEditQr(qr)"
                      >
                        <q-tooltip>Rename</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        size="sm"
                        icon="download"
                        color="primary"
                        @click="downloadQr(qr)"
                      >
                        <q-tooltip>Download</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        size="sm"
                        icon="delete"
                        color="negative"
                        @click="confirmDeleteQr(qr)"
                      >
                        <q-tooltip>Delete</q-tooltip>
                      </q-btn>
                    </q-card-actions>
                  </q-card>
                </div>
              </div>
            </div>

            <div class="col-12 text-center text-grey q-py-xl" v-else>
              <q-icon name="qr_code_2" size="4rem" color="grey-4" />
              <div class="text-h6 q-mt-md">No QR Codes yet</div>
              <div>Upload your first QR Code above</div>
            </div>
          </div>
        </q-tab-panel>

        <!-- EMAIL CONFIG TAB -->
        <q-tab-panel name="email" class="q-pa-lg">
          <q-form @submit.prevent="saveSettings">
            <div class="text-h6 q-mb-md">Email Configuration</div>
            <div class="text-caption text-grey q-mb-lg">
              Configure EmailJS settings for the contact form. These keys are used to send emails
              directly from the client.
            </div>

            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-4">
                <q-input
                  filled
                  v-model="form.emailJsConfig.serviceId"
                  label="Service ID"
                  hint="Env: VITE_EMAILJS_SERVICE_ID"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  filled
                  v-model="form.emailJsConfig.templateId"
                  label="Template ID"
                  hint="Env: VITE_EMAILJS_TEMPLATE_ID"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  filled
                  v-model="form.emailJsConfig.publicKey"
                  label="Public Key"
                  hint="Env: VITE_EMAILJS_PUBLIC_KEY"
                />
              </div>
            </div>

            <div class="row justify-end q-mt-xl">
              <q-btn
                label="Save Email Settings"
                type="submit"
                color="primary"
                size="lg"
                :loading="store.loading"
                icon="save"
              />
            </div>
          </q-form>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Zoom Dialog -->
    <q-dialog v-model="showZoom">
      <q-card style="min-width: 350px; max-width: 90vw">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">{{ selectedQr?.name }}</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="text-center q-pa-lg">
          <img
            :src="selectedQr?.url"
            style="max-width: 100%; max-height: 70vh; object-fit: contain"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
          <q-btn label="Download" color="primary" @click="selectedQr && downloadQr(selectedQr)" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Edit Dialog -->
    <q-dialog v-model="showEdit">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Rename QR Code</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="editQrName" label="New Name" autofocus @keyup.enter="handleUpdateQr" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="handleUpdateQr" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped>
.max-width-container {
  max-width: 1200px;
  margin: 0 auto;
}

.hover-scale {
  transition: transform 0.2s ease;
}
.hover-scale:hover {
  transform: scale(1.05);
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
