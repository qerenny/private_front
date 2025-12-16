<template>
  <v-container class="fill-height justify-center">
    <v-card width="100%" max-width="400" class="pa-4">
      <v-card-title class="text-center text-h5 mb-4">Login</v-card-title>
      <v-form @submit.prevent="handleLogin">
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
          closable
          @click:close="error = null"
        >
          {{ error }}
        </v-alert>

        <v-text-field
          v-model="email"
          label="Email"
          type="email"
          prepend-inner-icon="mdi-email"
          variant="outlined"
          required
        ></v-text-field>

        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          prepend-inner-icon="mdi-lock"
          variant="outlined"
          required
        ></v-text-field>

        <v-btn
          type="submit"
          block
          color="primary"
          size="large"
          :loading="loading"
          class="mt-2"
        >
          Sign In
        </v-btn>
      </v-form>

      <div class="text-center mt-4">
        <router-link to="/register" class="text-decoration-none text-primary">
          Don't have an account? Register
        </router-link>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const error = ref<string | null>(null);
const loading = ref(false);

const authStore = useAuthStore();
const router = useRouter();

async function handleLogin() {
  error.value = null;
  loading.value = true;
  try {
    await authStore.login(email.value, password.value);
    router.push('/dashboard');
  } catch (e: unknown) {
    if (e instanceof Error) {
      error.value = e.message;
    } else {
      error.value = 'Failed to login';
    }
  } finally {
    loading.value = false;
  }
}
</script>
