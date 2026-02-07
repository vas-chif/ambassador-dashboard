<template>
  <q-page class="window-height window-width row justify-center items-center bg-grey-2">
    <div class="column q-pa-lg">
      <div class="row">
        <q-card square class="shadow-24" style="width: 320px; min-height: 520px">
          <q-card-section class="bg-deep-purple-7 relative-position">
            <h4 class="text-h5 text-white q-my-md">
              {{ isRegistering ? 'Register Admin' : 'Admin Login' }}
            </h4>
          </q-card-section>
          <q-card-section>
            <q-form class="q-px-sm q-pt-xl" @submit.prevent="handleSubmit">
              <q-input
                square
                clearable
                v-model="email"
                type="email"
                label="Email"
                autocomplete="username"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>
              <q-input
                square
                clearable
                v-model="password"
                :type="isPasswordVisible ? 'text' : 'password'"
                label="Password"
                autocomplete="current-password"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="isPasswordVisible ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    @click="isPasswordVisible = !isPasswordVisible"
                  />
                </template>
              </q-input>

              <q-input
                v-if="isRegistering"
                square
                clearable
                v-model="confirmPassword"
                type="password"
                label="Confirm Password"
                autocomplete="new-password"
              >
                <template v-slot:prepend>
                  <q-icon name="lock_outline" />
                </template>
              </q-input>

              <div v-if="errorMsg" class="text-negative q-mt-md text-center">{{ errorMsg }}</div>
            </q-form>
          </q-card-section>

          <q-card-section class="text-center q-px-sm">
            <q-btn
              unelevated
              size="lg"
              color="deep-purple-4"
              class="full-width text-white"
              :label="isRegistering ? 'Register' : 'Sign In'"
              :loading="loading"
              @click="handleSubmit"
            />
          </q-card-section>

          <q-card-section class="text-center q-pa-sm">
            <q-btn
              flat
              size="sm"
              color="grey-7"
              class="full-width"
              :label="
                isRegistering ? 'Already have an account? Login' : 'Need an account? Register'
              "
              @click="toggleMode"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from 'stores/auth';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from 'src/boot/firebase';

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMsg = ref('');
const isRegistering = ref(false);
const isPasswordVisible = ref(false);
const loading = ref(false);

const authStore = useAuthStore();
const router = useRouter();
const $q = useQuasar();

const toggleMode = () => {
  isRegistering.value = !isRegistering.value;
  errorMsg.value = '';
  confirmPassword.value = '';
};

const handleSubmit = async () => {
  errorMsg.value = '';
  loading.value = true;

  try {
    if (isRegistering.value) {
      if (password.value !== confirmPassword.value) {
        errorMsg.value = 'Passwords do not match.';
        loading.value = false;
        return;
      }
      await createUserWithEmailAndPassword(auth, email.value, password.value);
      $q.notify({ type: 'positive', message: 'Account created! Welcome.' });
      // Auto login handled by auth state listener or specific logic if needed
      await router.push('/admin/dashboard');
    } else {
      await authStore.login(email.value, password.value);
      $q.notify({ type: 'positive', message: 'Welcome back!' });
      await router.push('/admin/dashboard');
    }
  } catch (err: unknown) {
    console.error(err);
    if (err instanceof Error) {
      errorMsg.value = err.message;
    } else {
      errorMsg.value = 'Authentication failed.';
    }
    $q.notify({ type: 'negative', message: 'Action failed' });
  } finally {
    loading.value = false;
  }
};
</script>
