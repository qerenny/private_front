import { ref } from 'vue';
import { getWorkouts, type Workout } from '@/api/workouts';

export function useWorkouts() {
  const workouts = ref<Workout[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchWorkouts() {
    loading.value = true;
    error.value = null;
    try {
      workouts.value = await getWorkouts();
    } catch (e) {
      error.value = 'Failed to load workouts';
      console.error(e);
    } finally {
      loading.value = false;
    }
  }

  return {
    workouts,
    loading,
    error,
    fetchWorkouts
  };
}
