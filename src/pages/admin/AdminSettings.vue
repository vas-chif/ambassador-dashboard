<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useSettingsStore } from 'stores/settings';
import { useQuasar } from 'quasar';

const store = useSettingsStore();
const $q = useQuasar();

const form = ref({
  name: '',
  bio: '',
  primaryColor: '#000000',
  secondaryColor: '#000000',
  whatsapp: '',
  instagram: '',
  email: '',
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
      form.value.email = newVal.email || '';
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
    <div class="text-h4 q-mb-lg">Profile Settings</div>

    <q-card flat bordered class="q-pa-lg">
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
            <q-input v-model="form.whatsapp" label="WhatsApp Number" outlined hint="e.g. +39333...">
              <template v-slot:prepend><q-icon name="message" /></template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6">
            <q-input v-model="form.instagram" label="Instagram User/Link" outlined prefix="@">
              <template v-slot:prepend><q-icon name="camera_alt" /></template>
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
            <q-input filled v-model="form.secondaryColor" class="my-input" label="Secondary Color">
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
    </q-card>
  </q-page>
</template>

<style scoped>
.max-width-container {
  max-width: 900px;
  margin: 0 auto;
}
.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid white;
}
.hover-scale {
  transition: transform 0.2s;
}
.hover-scale:hover {
  transform: scale(1.1);
  border: 2px solid var(--q-primary);
}
</style>
