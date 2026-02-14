<script setup lang="ts">
/**
 * @file ProductFormDialog.vue
 * @description Product Creation/Edit Dialog.
 * @author Vasile Chifeac (AI Agent)
 * @created 2026-02-06
 */

import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import type { Product } from 'src/types/product';
import { useProductsStore } from 'stores/products';
import { useSecureLogger } from 'src/shared/logger';

const $q = useQuasar();
const productsStore = useProductsStore();
const logger = useSecureLogger();

const props = defineProps<{
  modelValue: boolean;
  initialData?: Product | null;
}>();

const emit = defineEmits(['update:modelValue', 'save']);

const newProduct = ref<Partial<Product>>({
  name: '',
  price: 0,
  category: '',
  description: '',
  instructions: '',
  images: [],
  externalUrl: '',
});

// Watch for dialog opening to set initial data
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.initialData) {
        newProduct.value = { ...props.initialData };
      } else {
        newProduct.value = {
          name: '',
          price: 0,
          category: '',
          description: '',
          instructions: '',
          images: [],
          externalUrl: '',
        };
      }
    }
  },
);

const imageFile = ref<File | null>(null);
const isUploading = ref(false);

const onFileAdded = (files: readonly unknown[]) => {
  if (files && files.length > 0) {
    imageFile.value = files[0] as File;
    $q.notify({ message: 'Photo selected. Will upload on save.', color: 'info' });
  }
};

const saveProduct = async () => {
  isUploading.value = true;
  try {
    if (imageFile.value) {
      const url = await productsStore.uploadProductImage(imageFile.value);
      newProduct.value.images = [url];
    }

    emit('save', { ...newProduct.value });
    // Reset form
    newProduct.value = {
      name: '',
      price: 0,
      category: '',
      description: '',
      instructions: '',
      images: [],
    };
    imageFile.value = null;
    emit('update:modelValue', false);
  } catch (error: unknown) {
    logger.error('Error saving product', error);
    $q.notify({ type: 'negative', message: 'Error saving product' });
  } finally {
    isUploading.value = false;
  }
};
</script>

<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="bg-grey-1">
      <q-toolbar class="bg-primary text-white">
        <q-btn flat round dense icon="close" v-close-popup />
        <q-toolbar-title>{{ initialData ? 'Edit Product' : 'Add New Product' }}</q-toolbar-title>
      </q-toolbar>

      <q-card-section class="row justify-center q-pa-xl">
        <div class="col-12 col-md-8 col-lg-6">
          <div class="text-h5 q-mb-md">1. Product Photos</div>

          <!-- Current Image Preview -->
          <div v-if="newProduct.images && newProduct.images.length > 0" class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm text-grey-7">Current Photo:</div>
            <q-img
              :src="newProduct.images[0]"
              style="width: 150px; height: 150px; border-radius: 12px; border: 1px solid #ddd"
              class="shadow-2 bg-white"
              fit="contain"
            >
              <div class="absolute-top-right q-pa-xs">
                <q-btn
                  round
                  dense
                  color="negative"
                  icon="close"
                  size="sm"
                  @click="newProduct.images = []"
                />
              </div>
            </q-img>
          </div>

          <q-uploader
            url="http://localhost:4444/upload"
            label="Drag & Drop Photos Here"
            class="full-width q-mb-xl"
            color="primary"
            flat
            bordered
            accept="image/*"
            @added="onFileAdded"
          >
            <template v-slot:header="scope">
              <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
                <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
                <div class="col">
                  <div class="q-uploader__title">Drag & Drop Photos Here</div>
                  <div class="q-uploader__subtitle">
                    {{ scope.uploadSizeLabel }} / {{ scope.uploadProgressLabel }}
                  </div>
                </div>
                <q-btn v-if="scope.canAddFiles" type="a" icon="add_box" round dense flat>
                  <q-uploader-add-trigger />
                </q-btn>
              </div>
            </template>
          </q-uploader>

          <div class="text-h5 q-mb-md">2. Product Details</div>
          <q-card flat bordered class="q-pa-lg">
            <q-form class="q-gutter-y-lg">
              <q-input
                v-model="newProduct.name"
                label="Product Name"
                outlined
                class="text-h6 q-pb-md"
              />

              <div class="row q-col-gutter-lg">
                <div class="col-12">
                  <q-input
                    v-model="newProduct.category"
                    label="Category"
                    outlined
                    hint="e.g. Skincare, Makeup, etc."
                  />
                </div>
              </div>

              <q-input
                v-model="newProduct.externalUrl"
                label="Product URL (Affiliate/Shop Link)"
                outlined
                placeholder="https://..."
              >
                <template v-slot:prepend>
                  <q-icon name="link" />
                </template>
              </q-input>

              <div>
                <div class="text-subtitle2 q-mb-sm text-grey-8">Product Description</div>
                <q-editor
                  :model-value="newProduct.description || ''"
                  @update:model-value="(val) => (newProduct.description = val)"
                  min-height="8rem"
                  placeholder="Describe your product..."
                  class="bg-white"
                  :content-style="{ fontSize: '14px' }"
                  :toolbar="[
                    ['bold', 'italic', 'underline', 'strike'],
                    ['hr', 'link'],
                  ]"
                >
                </q-editor>
              </div>

              <div>
                <div class="text-subtitle2 q-mb-sm text-grey-8">
                  Product Instructions (Dialog Only)
                </div>
                <q-editor
                  :model-value="newProduct.instructions || ''"
                  @update:model-value="(val) => (newProduct.instructions = val)"
                  min-height="8rem"
                  placeholder="Detailed instructions, usage tips, etc..."
                  class="bg-white"
                  :content-style="{ fontSize: '14px' }"
                  :toolbar="[
                    ['bold', 'italic', 'underline', 'strike'],
                    ['hr', 'link'],
                    ['unordered', 'ordered'],
                  ]"
                >
                </q-editor>
              </div>

              <div class="row justify-end q-mt-lg">
                <q-btn
                  label="Save Product"
                  color="primary"
                  icon="save"
                  size="lg"
                  @click="saveProduct"
                  :loading="isUploading"
                />
              </div>
            </q-form>
          </q-card>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss">
.q-editor__content hr {
  border: 0;
  border-top: 1px solid #ccc;
  margin: 1rem 0;
}
</style>
