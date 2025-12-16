<template>
  <v-container>
    <div v-if="loading" class="d-flex justify-center py-12">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <v-alert v-else-if="error" type="error">{{ error }}</v-alert>

    <div v-else-if="plan">
      <v-btn variant="text" prepend-icon="mdi-arrow-left" to="/training-plans" class="mb-4">Back to Plans</v-btn>

      <v-card class="mb-6">
        <v-card-text>
          <div class="d-flex justify-space-between align-center mb-4">
             <h1 class="text-h4 font-weight-bold">{{ plan.title || plan.plan_name || plan.name }}</h1>
             <v-btn
               v-if="isAuthenticated && !isJoined"
               color="primary"
               @click="handleJoin"
               :loading="joining"
             >
               Add to My Plans
             </v-btn>
             <v-chip v-else-if="isJoined" color="success" prepend-icon="mdi-check">Added to your plans</v-chip>
          </div>
          <p class="text-body-1">{{ plan.description }}</p>
        </v-card-text>
      </v-card>

      <h2 class="text-h5 font-weight-bold mb-4">Workouts in this Plan</h2>
      <v-list border rounded>
        <v-list-item
          v-for="workout in workouts"
          :key="workout.id"
          :to="'/workouts/' + workout.id"
          link
          lines="two"
        >
          <v-list-item-title class="font-weight-bold">{{ workout.title }}</v-list-item-title>
          <v-list-item-subtitle>
             {{ workout.workout_type }} · {{ workout.level }} · {{ workout.duration_min }} min
          </v-list-item-subtitle>
          <template v-slot:append>
             <v-icon icon="mdi-chevron-right"></v-icon>
          </template>
        </v-list-item>
        <v-list-item v-if="!workouts.length">
          <v-list-item-title class="text-medium-emphasis">No workouts linked to this plan yet.</v-list-item-title>
        </v-list-item>
      </v-list>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getTrainingPlan, getTrainingPlanWorkouts, type TrainingPlan, type Workout } from '@/api/workouts';
import { getUserTrainingPlans, addUserTrainingPlan } from '@/api/progress';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const authStore = useAuthStore();

const plan = ref<TrainingPlan | null>(null);
const workouts = ref<Workout[]>([]);
const isJoined = ref(false);
const loading = ref(true);
const error = ref<string | null>(null);
const joining = ref(false);

const isAuthenticated = computed(() => authStore.isAuthenticated);

async function handleJoin() {
  if (!plan.value || !authStore.user?.id) return;
  joining.value = true;
  try {
    await addUserTrainingPlan({
      user_id: authStore.user.id,
      training_plan_id: plan.value.id
    });
    isJoined.value = true;
  } catch (e) {
    console.error(e);
    alert('Failed to join plan');
  } finally {
    joining.value = false;
  }
}

onMounted(async () => {
  const id = route.params.id as string;
  try {
    const [planData, allPlanWorkouts] = await Promise.all([
      getTrainingPlan(id),
      getTrainingPlanWorkouts().catch(() => [])
    ]);
    plan.value = planData;

    workouts.value = allPlanWorkouts
      .filter(pw => String(pw.training_plan_id) === String(id))
      .map(pw => pw.workout)
      .filter((w): w is Workout => !!w);

    if (isAuthenticated.value && authStore.user?.id) {
       const userPlans = await getUserTrainingPlans();
       isJoined.value = userPlans.some(p => String(p.training_plan_id) === String(id) && String(p.user_id) === String(authStore.user?.id));
    }
  } catch (e) {
    console.error(e);
    error.value = 'Failed to load plan details';
  } finally {
    loading.value = false;
  }
});
</script>
