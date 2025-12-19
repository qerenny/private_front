<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-custom fixed-top shadow-sm">
      <div class="container">
        <router-link class="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/">
          <svg class="me-2" style="height: 38px; width: 80px;" role="img" aria-label="Grizzly Gym logo">
            <use href="/assets/sprite.svg#logo-grizzly-gym"></use>
          </svg>
          Grizzly Gym
        </router-link>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto align-items-center">
            <li class="nav-item">
              <router-link class="nav-link" to="/workouts">Workouts</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/training-plans">Plans</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/blog">Blog</router-link>
            </li>
            <li class="nav-item py-1">
              <div class="vr d-none d-lg-block mx-2 h-100"></div>
              <hr class="d-lg-none text-white-50" />
            </li>

            <!-- Guest Only -->
            <template v-if="!authStore.isAuthenticated">
              <li class="nav-item">
                <router-link class="nav-link" to="/login">Login</router-link>
              </li>
              <li class="nav-item ms-lg-2">
                <router-link class="btn btn-brand-primary btn-sm px-4 rounded-pill" to="/register">Join</router-link>
              </li>
            </template>

            <!-- Auth Only -->
            <template v-else>
               <li class="nav-item">
                <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
              </li>
              <li class="nav-item ms-lg-2 dropdown">
                <a
                  class="nav-link dropdown-toggle d-flex align-items-center gap-2"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div class="user-initials-badge">{{ initials }}</div>
                  <span class="d-lg-none">{{ authStore.userName }}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><h6 class="dropdown-header">{{ authStore.userName }}</h6></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" href="#" @click.prevent="logout">Log out</a></li>
                </ul>
              </li>
            </template>

            <li class="nav-item ms-lg-2">
               <button class="btn nav-link" id="themeToggle" aria-label="Toggle theme">
                  <svg class="icon-theme" width="20" height="20">
                     <use href="/assets/sprite.svg#icon-sun"></use>
                  </svg>
               </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
       <router-view></router-view>
    </main>

    <!-- Footer -->
    <footer class="footer mt-auto py-4 bg-dark text-white-50">
      <div class="container text-center">
        <small>&copy; 2025 Grizzly Fitness. All rights reserved.</small>
        <div class="mt-2">
          <a href="#" class="text-white-50 text-decoration-none mx-2">Privacy</a>
          <a href="#" class="text-white-50 text-decoration-none mx-2">Terms</a>
          <a href="#" class="text-white-50 text-decoration-none mx-2">Contact</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
// Import theme logic from Lab 1 code (we need to port it or rewrite it)
// For now, I'll inline a simple theme toggler or leave the button.
// The Lab 1 code imported `initTheme` from `./theme.js`.

const authStore = useAuthStore();
const router = useRouter();

const initials = computed(() => {
  return (authStore.userName || 'GF')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2);
});

function logout() {
  authStore.logout();
  router.push('/login');
}

// Theme logic setup (simplified port of theme.ts)
onMounted(() => {
  const themeToggle = document.getElementById('themeToggle');
  const storedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', storedTheme);

  themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
});
</script>

<style>
/* Ensure padding for fixed navbar */
body {
  padding-top: 70px;
}
.main-content {
  min-height: calc(100vh - 70px - 100px); /* rough estimate for footer/header */
}
.icon-theme{
  color: white; /* Иконка станет оранжевой */
  fill: currentColor;
}
.icon-theme:hover {
  color: orange;
}
</style>
