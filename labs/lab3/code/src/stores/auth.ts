import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login, getCurrentUserByEmail } from '@/api/auth';
import type { User } from '@/api/client';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('authToken'));
  const user = ref<User | null>(null);

  // Initialize user from storage if available (simplified)
  // In a real app we might fetch user profile on init if token exists.
  const storedUser = localStorage.getItem('authUser');
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser);
    } catch (e) {
      console.error('Failed to parse user', e);
    }
  }

  const isAuthenticated = computed(() => !!token.value);
  const userName = computed(() => user.value?.name || user.value?.email || 'Athlete');

  async function loginAction(email: string, password: string) {
    try {
      const res = await login(email, password);
      const newToken = res.token || res.access_token || res.authToken;
      if (!newToken) throw new Error('No token returned');

      token.value = newToken;
      localStorage.setItem('authToken', newToken);

      // Fetch user details
      const userData = await getCurrentUserByEmail(email);
      user.value = userData;
      localStorage.setItem('authUser', JSON.stringify(userData));

      return true;
    } catch (error) {
      throw error;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  }

  function setUser(userData: User) {
    user.value = userData;
    localStorage.setItem('authUser', JSON.stringify(userData));
  }

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('authToken', newToken);
  }

  return {
    token,
    user,
    isAuthenticated,
    userName,
    login: loginAction,
    logout,
    setUser,
    setToken
  };
});
