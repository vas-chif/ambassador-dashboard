<script setup lang="ts">
/**
 * @file ContactDialog.vue
 * @description Email contact dialog using EmailJS
 * @author Vasile Chifeac (AI Agent)
 * @created 2026-02-07
 */

import { ref } from 'vue';
import { useQuasar } from 'quasar';
import emailjs from '@emailjs/browser';
import { useSettingsStore } from 'stores/settings';

const $q = useQuasar();
const settingsStore = useSettingsStore();

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  message: '',
});

const isSubmitting = ref(false);

const resetForm = () => {
  form.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  };
};

const phoneRegex = /^(\+39|0039)?\s?((3\d{2})|(0\d{1,4}))\s?\d{5,10}$/;

const validatePhone = (val: string) => {
  if (!val) return 'Telefono richiesto';
  if (!phoneRegex.test(val.replace(/\s/g, ''))) {
    return 'Inserisci un numero di telefono valido (es. +39 333 1234567)';
  }
  return true;
};

const sendEmail = async () => {
  isSubmitting.value = true;
  try {
    const emailConfig = settingsStore.profile.emailJsConfig;
    const serviceId = emailConfig?.serviceId || import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = emailConfig?.templateId || import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = emailConfig?.publicKey || import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      throw new Error('EmailJS configuration missing (Check Admin Settings or .env)');
    }

    await emailjs.send(
      serviceId,
      templateId,
      {
        from_name: `${form.value.firstName} ${form.value.lastName}`,
        from_email: form.value.email,
        phone: form.value.phone,
        message: form.value.message,
      },
      publicKey,
    );

    $q.notify({
      type: 'positive',
      message: 'Email inviata con successo!',
      position: 'top',
    });
    resetForm();
    emit('update:modelValue', false);
  } catch (error) {
    console.error('EmailJS error:', error);
    $q.notify({
      type: 'negative',
      message: "Errore nell'invio dell'email. Riprova.",
      position: 'top',
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :maximized="$q.screen.lt.sm"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card
      class="luxury-dialog"
      :style="
        $q.screen.gt.xs
          ? 'min-width: 600px; max-width: 700px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);'
          : 'margin: 16px; border-radius: 12px;'
      "
    >
      <!-- Header -->
      <q-card-section class="row items-center q-pb-none luxury-header">
        <div
          class="text-primary"
          :class="$q.screen.gt.xs ? 'text-h5' : 'text-h6'"
          style="font-family: 'Figtree', sans-serif; font-weight: 600"
        >
          Contattaci
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup color="grey-7" />
      </q-card-section>

      <q-separator class="q-my-md" />

      <!-- Form -->
      <q-card-section class="q-pt-none luxury-form">
        <q-form @submit.prevent="sendEmail" class="q-gutter-md">
          <!-- Name Row -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.firstName"
                label="Nome *"
                filled
                dense
                :rules="[(val) => !!val || 'Campo obbligatorio']"
                class="luxury-input"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="primary" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.lastName"
                label="Cognome *"
                filled
                dense
                :rules="[(val) => !!val || 'Campo obbligatorio']"
                class="luxury-input"
              >
                <template v-slot:prepend>
                  <q-icon name="person_outline" color="primary" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- Email -->
          <q-input
            v-model="form.email"
            label="Email *"
            type="email"
            filled
            dense
            :rules="[
              (val) => !!val || 'Campo obbligatorio',
              (val) => /.+@.+\..+/.test(val) || 'Email non valida',
            ]"
            class="luxury-input"
          >
            <template v-slot:prepend>
              <q-icon name="email" color="primary" />
            </template>
          </q-input>

          <!-- Phone -->
          <q-input
            v-model="form.phone"
            label="Telefono"
            type="tel"
            filled
            dense
            :rules="[validatePhone]"
            class="luxury-input"
          >
            <template v-slot:prepend>
              <q-icon name="phone" color="primary" />
            </template>
          </q-input>

          <!-- Message -->
          <q-input
            v-model="form.message"
            label="Messaggio / Informazioni *"
            type="textarea"
            filled
            rows="5"
            :rules="[(val) => !!val || 'Campo obbligatorio']"
            class="luxury-input"
          >
            <template v-slot:prepend>
              <q-icon name="message" color="primary" />
            </template>
          </q-input>

          <!-- Action Buttons -->
          <div class="row no-wrap justify-end q-gutter-sm q-mt-lg">
            <q-btn
              label="Annulla"
              color="grey-7"
              flat
              v-close-popup
              padding="8px 24px"
              class="luxury-btn"
            />
            <q-btn
              label="Invia Messaggio"
              type="submit"
              color="primary"
              unelevated
              :loading="isSubmitting"
              :disable="isSubmitting"
              padding="8px 32px"
              class="luxury-btn-primary"
              icon-right="send"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.luxury-dialog {
  overflow: hidden;
}

.luxury-header {
  padding: 24px 24px 16px 24px;
}

.luxury-form {
  padding: 0 24px 24px 24px;
}

:deep(.luxury-input) {
  .q-field__control {
    border-radius: 8px;
    background: rgba(212, 165, 116, 0.05);
  }

  .q-field__native {
    font-size: 15px;
  }
}

.luxury-btn {
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.luxury-btn-primary {
  border-radius: 8px;
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(52, 20, 20, 0.3);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 16px rgba(52, 20, 20, 0.4);
    transform: translateY(-2px);
  }
}
</style>
