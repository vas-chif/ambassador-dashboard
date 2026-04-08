<template>
  <q-page class="window-height window-width row justify-center items-center bg-grey-2">
    <div class="column q-pa-lg">
      <div class="row">
        <q-card square class="shadow-24" style="width: 320px; min-height: 520px">
          <q-card-section class="bg-deep-purple-7 relative-position">
            <h4 class="text-h5 text-white q-my-md">
              {{ mode === 'register' ? 'Register Admin' : mode === 'forgot' ? 'Recover Password' : 'Admin Login' }}
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
                v-if="mode !== 'forgot'"
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
                v-if="mode === 'register'"
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
              :label="mode === 'register' ? 'Register' : mode === 'forgot' ? 'Send Reset Email' : 'Sign In'"
              :loading="loading"
              @click="handleSubmit"
            />
          </q-card-section>

          <q-card-section class="text-center q-pa-sm">
            <q-btn
              v-if="mode !== 'forgot' && (mode === 'register' || canRegister)"
              flat
              size="sm"
              color="grey-7"
              class="full-width"
              :label="
                mode === 'register' ? 'Already have an account? Login' : 'Need an account? Register'
              "
              @click="toggleMode"
            />
            <q-btn
              v-else-if="mode === 'forgot'"
              flat
              size="sm"
              color="grey-7"
              class="full-width"
              label="Back to Login"
              icon="arrow_back"
              @click="mode = 'login'"
            />
          </q-card-section>

          <q-card-section class="text-center q-pt-none q-pb-md">
            <q-btn
              v-if="mode === 'login'"
              flat
              size="xs"
              color="deep-purple-3"
              label="Forgot password?"
              @click="mode = 'forgot'"
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
import { collection, getDocs, limit, query, doc, setDoc } from 'firebase/firestore';
import { auth, db } from 'src/boot/firebase';
import { useSecureLogger } from 'src/shared/logger';
import { onMounted } from 'vue';

type AuthMode = 'login' | 'register' | 'forgot';

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMsg = ref('');
const mode = ref<AuthMode>('login');
const isPasswordVisible = ref(false);
const loading = ref(false);
const canRegister = ref(false);

const authStore = useAuthStore();
const router = useRouter();
const $q = useQuasar();
const logger = useSecureLogger();

onMounted(async () => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, limit(1));
    const snapshot = await getDocs(q);
    canRegister.value = snapshot.empty;
  } catch (err) {
    logger.error('Error checking user existence', err);
    // Default to false for security if we can't check
    canRegister.value = false;
  }
});

const toggleMode = () => {
  mode.value = mode.value === 'register' ? 'login' : 'register';
  errorMsg.value = '';
  confirmPassword.value = '';
};

const handlePasswordReset = async () => {
  if (!email.value) {
    errorMsg.value = 'Please enter your email address first.';
    return;
  }
  loading.value = true;
  try {
    await authStore.sendPasswordReset(email.value);
    $q.notify({ type: 'positive', message: 'Reset email sent! Check your inbox.', icon: 'mail' });
    mode.value = 'login';
  } catch (err: unknown) {
    logger.error('Password reset error in component', err);
    if (err instanceof Error) {
      errorMsg.value = err.message;
    } else {
      errorMsg.value = 'Failed to send reset email.';
    }
    $q.notify({ type: 'negative', message: 'Reset failed' });
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  errorMsg.value = '';
  loading.value = true;

  if (mode.value === 'forgot') {
    await handlePasswordReset();
    return;
  }

  try {
    if (mode.value === 'register') {
      if (password.value !== confirmPassword.value) {
        errorMsg.value = 'Passwords do not match.';
        loading.value = false;
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
      const user = userCredential.user;

      // Create a user document to flag that an admin exists
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'admin',
        createdAt: Date.now(),
      });

      $q.notify({ type: 'positive', message: 'Account created! Welcome.' });
      // Auto login handled by auth state listener or specific logic if needed
      await router.push('/admin/dashboard');
    } else {
      await authStore.login(email.value, password.value);
      $q.notify({ type: 'positive', message: 'Welcome back!' });
      await router.push('/admin/dashboard');
    }
  } catch (err: unknown) {
    logger.error('Auth submit failed', err);
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
