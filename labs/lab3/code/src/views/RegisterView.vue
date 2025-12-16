<template>
  <v-container class="fill-height justify-center">
    <v-card width="100%" max-width="500" class="pa-4">
      <v-card-title class="text-center text-h5 mb-4">Register</v-card-title>
      <v-form @submit.prevent="handleRegister">
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
          v-model="form.name"
          label="Full Name"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          required
        ></v-text-field>

        <v-text-field
          v-model="form.email"
          label="Email"
          type="email"
          prepend-inner-icon="mdi-email"
          variant="outlined"
          required
        ></v-text-field>

        <v-text-field
          v-model="form.password"
          label="Password"
          type="password"
          prepend-inner-icon="mdi-lock"
          variant="outlined"
          required
        ></v-text-field>

        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="form.date_of_birth"
              label="Date of Birth"
              type="date"
              variant="outlined"
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="form.gender"
              label="Gender"
              :items="['male', 'female', 'other']"
              variant="outlined"
            ></v-select>
          </v-col>
        </v-row>

        <v-btn
          type="submit"
          block
          color="primary"
          size="large"
          :loading="loading"
          class="mt-2"
        >
          Create Account
        </v-btn>
      </v-form>

      <div class="text-center mt-4">
        <router-link to="/login" class="text-decoration-none text-primary">
          Already have an account? Login
        </router-link>
      </div>
    </v-card>
  </v-container>
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

    // Auto login after register
    await authStore.login(form.email, form.password);
    router.push('/dashboard');
  } catch (e: unknown) {
    if (e instanceof Error) {
      error.value = e.message;
    } else {
      error.value = 'Registration failed';
    }
  } finally {
    loading.value = false;
  }
}
</script>
