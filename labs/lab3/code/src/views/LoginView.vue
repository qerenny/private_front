<template>
  <div class="auth-wrapper" style="min-height: 80vh;">
    <div class="card auth-card shadow-lg p-4" style="max-width: 400px; width: 100%;">
      <div class="card-body">
        <h3 class="card-title text-center mb-4 fw-bold">Login</h3>

        <div v-if="error" id="loginAlert" class="alert alert-danger" role="alert">
          {{ error }}
        </div>

        <form @submit.prevent="handleLogin" id="loginForm">
          <div class="mb-3">
            <label for="email" class="form-label">Email address</label>
            <input
              v-model="email"
              type="email"
              class="form-control"
              id="email"
              name="email"
              required
              placeholder="name@example.com"
            >
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input
              v-model="password"
              type="password"
              class="form-control"
              id="password"
              name="password"
              required
            >
          </div>
          <div class="d-grid gap-2">
            <button
              type="submit"
              class="btn btn-brand-primary btn-lg"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Sign In
            </button>
          </div>
        </form>
        <div class="text-center mt-3">
          <p class="small text-muted">Don't have an account? <router-link to="/register" class="link-brand-primary">Register here</router-link></p>
        </div>
      </div>
    </div>
  </div>
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
      error.value = 'Unable to login. Please try again.';
    }
  } finally {
    loading.value = false;
  }
}
</script>
