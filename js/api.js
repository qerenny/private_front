const AUTH_API_URL = window.AUTH_API_URL || 'https://api.example.com/auth';
const WORKOUT_API_URL = window.WORKOUT_API_URL || 'https://api.example.com/workouts';
const BLOG_API_URL = window.BLOG_API_URL || 'https://api.example.com/blog';
const PROGRESS_API_URL = window.PROGRESS_API_URL || 'https://api.example.com/progress';
const ORDER_API_URL = window.ORDER_API_URL || 'https://api.example.com/orders';

function getAuthToken() {
  return localStorage.getItem('authToken');
}

async function apiFetch(url, options = {}, requiresAuth = false) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

async function login(email, password) {
  return apiFetch(`${AUTH_API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

async function registerUser(payload) {
  return apiFetch(`${AUTH_API_URL}/users`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function getCurrentUserByEmail(email) {
  return apiFetch(`${AUTH_API_URL}/users/email/${encodeURIComponent(email)}`);
}

async function getWorkouts() {
  return apiFetch(`${WORKOUT_API_URL}/workouts`);
}

async function getWorkout(id) {
  return apiFetch(`${WORKOUT_API_URL}/workouts/${id}`);
}

async function getTrainingPlan(id) {
  return apiFetch(`${WORKOUT_API_URL}/training-plans/${id}`);
}

async function getBlogPosts() {
  return apiFetch(`${BLOG_API_URL}/blog-posts`);
}

async function getBlogPost(id) {
  return apiFetch(`${BLOG_API_URL}/blog-posts/${id}`);
}

async function createBlogComment(payload) {
  return apiFetch(`${BLOG_API_URL}/blog-comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

async function getUserProgress() {
  return apiFetch(`${PROGRESS_API_URL}/user-progress/`, {}, true);
}

async function updateUserProgress(id, payload) {
  return apiFetch(`${PROGRESS_API_URL}/user-progress/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, true);
}

async function getUserTrainingPlans() {
  return apiFetch(`${PROGRESS_API_URL}/user-training-plans/`, {}, true);
}

async function addUserTrainingPlan(payload) {
  return apiFetch(`${PROGRESS_API_URL}/user-training-plans`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

window.GrizzlyApi = {
  login,
  registerUser,
  getCurrentUserByEmail,
  getWorkouts,
  getWorkout,
  getTrainingPlan,
  getBlogPosts,
  getBlogPost,
  createBlogComment,
  getUserProgress,
  updateUserProgress,
  getUserTrainingPlans,
  addUserTrainingPlan,
  constants: {
    AUTH_API_URL,
    WORKOUT_API_URL,
    BLOG_API_URL,
    PROGRESS_API_URL,
    ORDER_API_URL,
  },
};
