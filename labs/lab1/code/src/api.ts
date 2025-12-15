const AUTH_API_URL = (window as any).AUTH_API_URL || 'http://localhost:4000';
const WORKOUT_API_URL = (window as any).WORKOUT_API_URL || 'http://localhost:4001';
const BLOG_API_URL = (window as any).BLOG_API_URL || 'http://localhost:4004';
const PROGRESS_API_URL = (window as any).PROGRESS_API_URL || 'http://localhost:4002';
const ORDER_API_URL = (window as any).ORDER_API_URL || 'http://localhost:4003';

export interface AuthResponse {
  token?: string;
  access_token?: string;
  authToken?: string;
}

interface User {
  id: number;
  email: string;
  name?: string;
}

export interface Workout {
  id: number;
  title: string;
  level?: string;
  workout_type?: string;
  duration_min?: number;
  description?: string;
  instructions?: string;
  video_url?: string;
}

export interface TrainingPlan {
  id: number;
  title?: string;
  plan_name?: string;
  description?: string;
}

export interface TrainingPlanWorkout {
  id: number;
  training_plan_id: number;
  workout_id: number;
  training_plan?: TrainingPlan;
  workout?: Workout;
}

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  created_at?: string;
  author?: string;
  comments?: BlogComment[];
}

export interface BlogComment {
  post_id: number;
  user_id: number;
  comment_text: string;
  user_name?: string;
  user?: string;
  created_at?: string;
}

export interface UserProgress {
  id: number;
  user_id: number | string;
  current_weight?: number;
  target_weight?: number;
  steps_walked?: number;
  water_intake?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserTrainingPlan {
  id: number;
  user_id: number | string;
  training_plan_id: number;
}

function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

async function apiFetch<T>(url: string, options: RequestInit = {}, requiresAuth = false): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  return response.text() as unknown as T;
}

async function login(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(`${AUTH_API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

async function registerUser(payload: Record<string, unknown>): Promise<unknown> {
  return apiFetch(`${AUTH_API_URL}/users`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function getCurrentUserByEmail(email: string): Promise<User> {
  return apiFetch<User>(`${AUTH_API_URL}/users/email/${encodeURIComponent(email)}`);
}

async function getWorkouts(): Promise<Workout[]> {
  return apiFetch<Workout[]>(`${WORKOUT_API_URL}/workouts`);
}

async function getWorkout(id: string | number): Promise<Workout> {
  return apiFetch<Workout>(`${WORKOUT_API_URL}/workouts/${id}`);
}

async function getTrainingPlan(id: string | number): Promise<TrainingPlan> {
  return apiFetch<TrainingPlan>(`${WORKOUT_API_URL}/training-plans/${id}`);
}

async function getTrainingPlans(): Promise<TrainingPlan[]> {
  return apiFetch<TrainingPlan[]>(`${WORKOUT_API_URL}/training-plans`);
}

async function getTrainingPlanWorkouts(): Promise<TrainingPlanWorkout[]> {
  return apiFetch<TrainingPlanWorkout[]>(`${WORKOUT_API_URL}/training-plan-workouts`);
}

async function getBlogPosts(): Promise<BlogPost[]> {
  return apiFetch<BlogPost[]>(`${BLOG_API_URL}/blog-posts`);
}

async function getBlogPost(id: string | number): Promise<BlogPost> {
  return apiFetch<BlogPost>(`${BLOG_API_URL}/blog-posts/${id}`);
}

async function createBlogComment(payload: BlogComment): Promise<unknown> {
  return apiFetch(`${BLOG_API_URL}/blog-comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

async function getUserProgress(): Promise<UserProgress[]> {
  return apiFetch<UserProgress[]>(`${PROGRESS_API_URL}/user-progress/`, {}, true);
}

async function createUserProgress(payload: Partial<UserProgress>): Promise<UserProgress> {
  return apiFetch<UserProgress>(`${PROGRESS_API_URL}/user-progress/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

async function updateUserProgress(payload: Partial<UserProgress>): Promise<UserProgress> {
  return apiFetch<UserProgress>(`${PROGRESS_API_URL}/user-progress/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

async function getUserTrainingPlans(): Promise<UserTrainingPlan[]> {
  return apiFetch<UserTrainingPlan[]>(`${PROGRESS_API_URL}/user-training-plans/`, {}, true);
}

async function addUserTrainingPlan(payload: Partial<UserTrainingPlan>): Promise<unknown> {
  return apiFetch(`${PROGRESS_API_URL}/user-training-plans`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

declare global {
  interface Window {
    GrizzlyApi: {
      login: typeof login;
      registerUser: typeof registerUser;
      getCurrentUserByEmail: typeof getCurrentUserByEmail;
      getWorkouts: typeof getWorkouts;
      getWorkout: typeof getWorkout;
      getTrainingPlan: typeof getTrainingPlan;
      getTrainingPlans: typeof getTrainingPlans;
      getTrainingPlanWorkouts: typeof getTrainingPlanWorkouts;
      getBlogPosts: typeof getBlogPosts;
      getBlogPost: typeof getBlogPost;
      createBlogComment: typeof createBlogComment;
      getUserProgress: typeof getUserProgress;
      createUserProgress: typeof createUserProgress;
      updateUserProgress: typeof updateUserProgress;
      getUserTrainingPlans: typeof getUserTrainingPlans;
      addUserTrainingPlan: typeof addUserTrainingPlan;
      constants: {
        AUTH_API_URL: string;
        WORKOUT_API_URL: string;
        BLOG_API_URL: string;
        PROGRESS_API_URL: string;
        ORDER_API_URL: string;
      };
    };
  }
}

window.GrizzlyApi = {
  login,
  registerUser,
  getCurrentUserByEmail,
  getWorkouts,
  getWorkout,
  getTrainingPlan,
  getTrainingPlans,
  getTrainingPlanWorkouts,
  getBlogPosts,
  getBlogPost,
  createBlogComment,
  getUserProgress,
  createUserProgress,
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
