import { apiFetch, AUTH_API_URL, type AuthResponse, type User } from './client';

export async function login(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(`${AUTH_API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(payload: Record<string, unknown>): Promise<unknown> {
  return apiFetch(`${AUTH_API_URL}/users`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUserByEmail(email: string): Promise<User> {
  return apiFetch<User>(`${AUTH_API_URL}/users/email/${encodeURIComponent(email)}`);
}
