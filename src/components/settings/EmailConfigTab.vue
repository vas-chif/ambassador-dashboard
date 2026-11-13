<script setup lang="ts">
/**
 * @file EmailConfigTab.vue
 * @description Tab per la configurazione del servizio EmailJS (modulo contatti).
 * @author Vasile Chifeac (AI Agent)
 */

import { useSettingsStore } from 'stores/settings';

const store = useSettingsStore();
</script>

<template>
  <div class="q-gutter-y-md" style="max-width: 650px">
    <div class="text-subtitle1 text-weight-bold">Configurazione EmailJS (Modulo Contatti)</div>
    <div class="text-caption text-grey-8">
      Configura le credenziali di EmailJS per consentire ai clienti di inviarti richieste dal modulo di contatto pubblico.
    </div>

    <q-input
      :model-value="store.profile.emailJsConfig?.serviceId || ''"
      label="Service ID"
      outlined
      dense
      placeholder="es. service_xxxxxx"
      @update:model-value="
        store.profile.emailJsConfig = {
          ...(store.profile.emailJsConfig || { templateId: '', publicKey: '' }),
          serviceId: String($event),
        }
      "
    />

    <q-input
      :model-value="store.profile.emailJsConfig?.templateId || ''"
      label="Template ID"
      outlined
      dense
      placeholder="es. template_xxxxxx"
      @update:model-value="
        store.profile.emailJsConfig = {
          ...(store.profile.emailJsConfig || { serviceId: '', publicKey: '' }),
          templateId: String($event),
        }
      "
    />

    <q-input
      :model-value="store.profile.emailJsConfig?.publicKey || ''"
      label="Public Key (User ID)"
      outlined
      dense
      placeholder="es. user_xxxxxx"
      @update:model-value="
        store.profile.emailJsConfig = {
          ...(store.profile.emailJsConfig || { serviceId: '', templateId: '' }),
          publicKey: String($event),
        }
      "
    />
  </div>
</template>

