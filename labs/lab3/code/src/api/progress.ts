import { apiFetch, PROGRESS_API_URL } from './client';

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

export async function getUserProgress(): Promise<UserProgress[]> {
  return apiFetch<UserProgress[]>(`${PROGRESS_API_URL}/user-progress/`, {}, true);
}

export async function createUserProgress(payload: Partial<UserProgress>): Promise<UserProgress> {
  return apiFetch<UserProgress>(`${PROGRESS_API_URL}/user-progress/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

export async function updateUserProgress(payload: Partial<UserProgress>): Promise<UserProgress> {
  return apiFetch<UserProgress>(`${PROGRESS_API_URL}/user-progress/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

export async function getUserTrainingPlans(): Promise<UserTrainingPlan[]> {
  return apiFetch<UserTrainingPlan[]>(`${PROGRESS_API_URL}/user-training-plans/`, {}, true);
}

export async function addUserTrainingPlan(payload: Partial<UserTrainingPlan>): Promise<unknown> {
  return apiFetch(`${PROGRESS_API_URL}/user-training-plans`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}
