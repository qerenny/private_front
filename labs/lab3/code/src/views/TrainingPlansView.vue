<template>
  <div class="container py-5">
    <h1 class="section-title mb-0">Training Plans</h1>
    <p class="text-muted">Choose complete programs that bundle multiple workouts.</p>
    <div class="card mb-4">
      <div class="card-body">
        <p class="mb-0">Add ready-made plans to your account. Each plan includes several workouts curated for progression.</p>
      </div>
    </div>
    
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>

    <div v-else class="row g-4" id="trainingPlansGrid">
       <div v-if="!plans.length" class="col-12 text-center text-muted">
         <p>No training plans found.</p>
       </div>
       <div v-for="plan in plans" :key="plan.id" class="col-md-6 col-lg-4">
          <div class="training-plan-card card h-100">
            <div class="card-body d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h5 class="card-title mb-1">{{ plan.title || plan.plan_name || plan.name }}</h5>
                  <p class="text-muted small mb-1">Program</p>
                </div>
                <span class="card-tag card-tag--accent">Plan</span>
              </div>
              <p class="card-text flex-grow-1">{{ plan.description || 'Stay consistent with this program.' }}</p>
              <div class="mt-3 d-flex gap-2 flex-wrap align-items-center">
                 <button
                   v-if="isAuthenticated && !isJoined(plan.id)"
                   class="btn btn-sm btn-brand-primary"
                   @click="joinPlan(plan.id)"
                   :disabled="joining === plan.id"
                 >
                    <span v-if="joining === plan.id" class="spinner-border spinner-border-sm me-1"></span>
                    Add to my plans
                 </button>
                 <button
                   v-else-if="isAuthenticated && isJoined(plan.id)"
                   class="btn btn-sm btn-secondary"
                   disabled
                 >
                    Added to your plans
                 </button>
                 <router-link v-else class="btn btn-sm btn-outline-dark" to="/login">Log in to add</router-link>

                 <router-link class="btn btn-sm btn-outline-dark" :to="'/training-plans/' + plan.id">View details</router-link>
              </div>
            </div>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getTrainingPlans, type TrainingPlan } from '@/api/workouts';
import { getUserTrainingPlans, addUserTrainingPlan, type UserTrainingPlan } from '@/api/progress';
import { useAuthStore } from '@/stores/auth';

const plans = ref<TrainingPlan[]>([]);
const userPlans = ref<UserTrainingPlan[]>([]);
const loading = ref(true);
const joining = ref<number | null>(null);

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

function isJoined(planId: number) {
  return userPlans.value.some(p => Number(p.training_plan_id) === Number(planId));
}

async function joinPlan(planId: number) {
  if (!authStore.user?.id) return;
  joining.value = planId;
  try {
    await addUserTrainingPlan({
      user_id: authStore.user.id,
      training_plan_id: planId
    });
    // Refresh user plans
    const updatedUserPlans = await getUserTrainingPlans();
    userPlans.value = updatedUserPlans.filter(p => String(p.user_id) === String(authStore.user?.id));
  } catch (e) {
    console.error(e);
    alert('Failed to join plan');
  } finally {
    joining.value = null;
  }
}

onMounted(async () => {
  loading.value = true;
  try {
    const [allPlans, myPlans] = await Promise.all([
      getTrainingPlans(),
      isAuthenticated.value ? getUserTrainingPlans() : Promise.resolve([])
    ]);
    plans.value = allPlans;
    if (isAuthenticated.value) {
       userPlans.value = (myPlans as UserTrainingPlan[]).filter(p => String(p.user_id) === String(authStore.user?.id));
    }
  } catch (e) {
    console.error('Failed to load plans', e);
  } finally {
    loading.value = false;
  }
});
</script>
