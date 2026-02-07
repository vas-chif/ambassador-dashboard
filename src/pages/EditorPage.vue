<script setup lang="ts">
/**
 * @file EditorPage.vue
 * @description Ambassador Editor Page wrapper.
 * @author Vasile Chifeac (AI Agent)
 * @created 2026-02-06
 * @modified 2026-02-06
 */

import PageEditor from 'components/builder/PageEditor.vue';
import { useBuilderStore } from 'stores/builder';
import { onMounted, onUnmounted } from 'vue';

const builderStore = useBuilderStore();

onMounted(() => {
  builderStore.isEditing = true;
});

onUnmounted(() => {
  builderStore.isEditing = false;
});
</script>

<template>
  <q-page>
    <PageEditor />
  </q-page>
</template>
