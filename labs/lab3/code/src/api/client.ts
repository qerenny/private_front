// Constants matching Lab 1 hardcoded values
export const AUTH_API_URL = 'http://localhost:4000';
export const WORKOUT_API_URL = 'http://localhost:4001';
export const BLOG_API_URL = 'http://localhost:4004';
export const PROGRESS_API_URL = 'http://localhost:4002';
export const ORDER_API_URL = 'http://localhost:4003';

export interface AuthResponse {
  token?: string;
  access_token?: string;
  authToken?: string;
  [key: string]: unknown;
}

export interface User {
  id: number;
  email: string;
  name?: string;
}

async function getAuthToken(): Promise<string | null> {
  // We'll read from localStorage for now, but in Vue app we might prefer using the store.
  // However, for the raw API client, this is a fallback if not passed.
  return localStorage.getItem('authToken');
}

export async function apiFetch<T>(url: string, options: RequestInit = {}, requiresAuth = false): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (requiresAuth) {
    const token = await getAuthToken();
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
