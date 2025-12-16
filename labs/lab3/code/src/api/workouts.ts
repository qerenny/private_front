import { apiFetch, WORKOUT_API_URL } from './client';

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
  name?: string;
  description?: string;
}

export interface TrainingPlanWorkout {
  id: number;
  training_plan_id: number;
  workout_id: number;
  training_plan?: TrainingPlan;
  workout?: Workout;
}

export async function getWorkouts(): Promise<Workout[]> {
  return apiFetch<Workout[]>(`${WORKOUT_API_URL}/workouts`);
}

export async function getWorkout(id: string | number): Promise<Workout> {
  return apiFetch<Workout>(`${WORKOUT_API_URL}/workouts/${id}`);
}

export async function getTrainingPlan(id: string | number): Promise<TrainingPlan> {
  return apiFetch<TrainingPlan>(`${WORKOUT_API_URL}/training-plans/${id}`);
}

export async function getTrainingPlans(): Promise<TrainingPlan[]> {
  return apiFetch<TrainingPlan[]>(`${WORKOUT_API_URL}/training-plans`);
}

export async function getTrainingPlanWorkouts(): Promise<TrainingPlanWorkout[]> {
  return apiFetch<TrainingPlanWorkout[]>(`${WORKOUT_API_URL}/training-plan-workouts`);
}
