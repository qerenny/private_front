<template>
  <v-app>
    <v-app-bar color="secondary" density="compact" elevation="2">
      <template v-slot:prepend>
        <!-- Logo placeholder using MDI icon for now, could use image if available -->
        <v-icon icon="mdi-paw" color="primary" class="ml-2"></v-icon>
      </template>

      <v-app-bar-title class="font-weight-bold">
        <router-link to="/" class="text-white text-decoration-none">
          Grizzly Fitness
        </router-link>
      </v-app-bar-title>

      <template v-slot:append>
        <!-- Desktop Nav -->
        <div class="d-none d-md-flex gap-2 align-center">
          <v-btn to="/workouts" variant="text">Workouts</v-btn>
          <v-btn to="/training-plans" variant="text">Plans</v-btn>
          <v-btn to="/blog" variant="text">Blog</v-btn>

          <v-divider vertical class="mx-2 my-auto" style="height: 20px"></v-divider>

          <template v-if="!authStore.isAuthenticated">
            <v-btn to="/login" variant="text">Login</v-btn>
            <v-btn to="/register" color="primary" variant="flat" class="ml-2">Join</v-btn>
          </template>

          <template v-else>
            <v-btn to="/dashboard" variant="text" prepend-icon="mdi-view-dashboard">Dashboard</v-btn>
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn icon v-bind="props" class="ml-2">
                  <v-avatar color="primary" size="32">
                    <span class="text-body-2">{{ initials }}</span>
                  </v-avatar>
                </v-btn>
              </template>
              <v-list>
                <v-list-item>
                   <v-list-item-title class="font-weight-bold">{{ authStore.userName }}</v-list-item-title>
                   <v-list-item-subtitle>{{ authStore.user?.email }}</v-list-item-subtitle>
                </v-list-item>
                <v-divider class="my-2"></v-divider>
                <v-list-item @click="logout" prepend-icon="mdi-logout" title="Logout"></v-list-item>
              </v-list>
            </v-menu>
          </template>
        </div>

        <!-- Mobile Nav -->
        <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer"></v-app-bar-nav-icon>
      </template>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" location="right" temporary>
      <v-list v-if="authStore.isAuthenticated">
        <v-list-item
          :title="authStore.userName"
          :subtitle="authStore.user?.email"
        >
          <template v-slot:prepend>
            <v-avatar color="primary" size="small">{{ initials }}</v-avatar>
          </template>
        </v-list-item>
        <v-divider></v-divider>
      </v-list>

      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-home" title="Home" to="/"></v-list-item>
        <v-list-item prepend-icon="mdi-dumbbell" title="Workouts" to="/workouts"></v-list-item>
        <v-list-item prepend-icon="mdi-notebook" title="Training Plans" to="/training-plans"></v-list-item>
        <v-list-item prepend-icon="mdi-post" title="Blog" to="/blog"></v-list-item>

        <v-divider class="my-2"></v-divider>

        <template v-if="!authStore.isAuthenticated">
          <v-list-item prepend-icon="mdi-login" title="Login" to="/login"></v-list-item>
          <v-list-item prepend-icon="mdi-account-plus" title="Register" to="/register"></v-list-item>
        </template>
        <template v-else>
           <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" to="/dashboard"></v-list-item>
           <v-list-item prepend-icon="mdi-logout" title="Logout" @click="logout"></v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view></router-view>
    </v-main>

    <v-footer app class="text-center d-flex flex-column text-medium-emphasis text-caption py-4">
      <div>&copy; {{ new Date().getFullYear() }} Grizzly Fitness. All rights reserved.</div>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const drawer = ref(false);

const initials = computed(() => {
  return (authStore.userName || 'GF')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

function logout() {
  authStore.logout();
  router.push('/login');
  drawer.value = false;
}
</script>
