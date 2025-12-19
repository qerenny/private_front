<template>
  <div class="container py-5">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else-if="plan" id="trainingPlanDetail">
       <div class="card border-0 shadow-sm mb-5">
         <div class="card-body p-4">
           <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
             <div>
               <h2 class="section-title mb-2">{{ plan.title || plan.plan_name || plan.name }}</h2>
               <p class="text-muted mb-0">{{ workouts.length || 'No' }} workouts included</p>
             </div>
             <span class="card-tag card-tag--accent">Training plan</span>
           </div>

           <p class="lead mb-4">{{ plan.description || 'No description provided.' }}</p>

           <div class="mb-4">
              <button
                 v-if="isAuthenticated && !isJoined"
                 class="btn btn-brand-primary"
                 id="addTrainingPlanButton"
                 @click="handleJoin"
                 :disabled="joining"
               >
                  <span v-if="joining" class="spinner-border spinner-border-sm me-1"></span>
                  Add to My Plans
               </button>
               <button v-else-if="isAuthenticated && isJoined" class="btn btn-secondary" disabled>Already in your plans</button>
               <router-link v-else class="btn btn-brand-primary" to="/login">Log in to add</router-link>
           </div>

           <h6 class="fw-bold border-bottom pb-2 mb-3">Workouts in this plan</h6>
           <ul class="list-group list-group-flush">
              <li v-for="workout in workouts" :key="workout.id" class="list-group-item px-0">
                 <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>{{ workout.title }}</strong>
                      <p class="mb-0 text-muted small">{{ workout.workout_type || 'mixed' }} · {{ workout.level || 'all levels' }} · {{ workout.duration_min || 0 }} min</p>
                    </div>
                    <router-link class="btn btn-sm btn-outline-dark" :to="'/workouts/' + workout.id">View workout</router-link>
                 </div>
              </li>
              <li v-if="!workouts.length" class="list-group-item px-0 text-muted">No workouts linked yet.</li>
           </ul>
         </div>
       </div>
       <div>
         <router-link to="/training-plans" class="btn btn-outline-secondary">Back to Plans</router-link>
       </div>
    </div>
  </div>
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
