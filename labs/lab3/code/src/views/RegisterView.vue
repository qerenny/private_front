<template>
  <div class="auth-wrapper" style="min-height: 80vh;">
    <div class="card auth-card shadow-lg p-4" style="max-width: 500px; width: 100%;">
      <div class="card-body">
        <h3 class="card-title text-center mb-4 fw-bold">Join the Pack</h3>

        <div v-if="error" id="registerAlert" class="alert alert-danger" role="alert">
          {{ error }}
        </div>

        <form @submit.prevent="handleRegister" id="registerForm">
          <div class="mb-3">
            <label for="name" class="form-label">Full Name</label>
            <input
              v-model="form.name"
              type="text"
              class="form-control"
              id="name"
              name="name"
              required
              placeholder="John Doe"
            >
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email address</label>
            <input
              v-model="form.email"
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
              v-model="form.password"
              type="password"
              class="form-control"
              id="password"
              name="password"
              required
            >
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="dob" class="form-label">Date of Birth</label>
              <input
                v-model="form.date_of_birth"
                type="date"
                class="form-control"
                id="dob"
                name="date_of_birth"
              >
            </div>
            <div class="col-md-6 mb-3">
              <label for="gender" class="form-label">Gender</label>
              <select
                v-model="form.gender"
                class="form-select"
                id="gender"
                name="gender"
              >
                <option value="" selected>Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div class="d-grid gap-2 mt-2">
            <button
              type="submit"
              class="btn btn-brand-primary btn-lg"
              :disabled="loading"
            >
               <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Create Account
            </button>
          </div>
        </form>
        <div class="text-center mt-3">
          <p class="small text-muted">Already have an account? <router-link to="/login" class="link-brand-primary">Log in</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { registerUser } from '@/api/auth';
import { useAuthStore } from '@/stores/auth';

const form = reactive({
  name: '',
  email: '',
  password: '',
  date_of_birth: '',
  gender: ''
});

const error = ref<string | null>(null);
const loading = ref(false);

const router = useRouter();
const authStore = useAuthStore();

async function handleRegister() {
  error.value = null;
  loading.value = true;
  try {
    await registerUser({
      name: form.name,
      email: form.email,
      password_hash: form.password,
      date_of_birth: form.date_of_birth,
      gender: form.gender
    });

    // Auto login
    await authStore.login(form.email, form.password);
    router.push('/dashboard');
  } catch (e: unknown) {
    if (e instanceof Error) {
      error.value = e.message;
    } else {
      error.value = 'Registration failed. Please try again.';
    }
  } finally {
    loading.value = false;
  }
}
</script>
