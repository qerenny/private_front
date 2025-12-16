<template>
  <v-container>
    <h1 class="text-h4 font-weight-bold mb-6">Training Plans</h1>

    <div v-if="loading" class="d-flex justify-center py-12">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <v-row v-else>
      <v-col
        v-for="plan in plans"
        :key="plan.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="h-100 d-flex flex-column" hover>
          <v-card-item>
            <v-card-title>{{ plan.title || plan.plan_name || plan.name }}</v-card-title>
            <v-card-subtitle>Program</v-card-subtitle>
          </v-card-item>

          <v-card-text>
            {{ plan.description || 'No description available.' }}
          </v-card-text>

          <v-card-actions class="mt-auto">
             <v-btn
               variant="text"
               color="primary"
               :to="'/training-plans/' + plan.id"
             >
               View Plan
             </v-btn>
             <v-spacer></v-spacer>
             <v-btn
               v-if="isAuthenticated && !isJoined(plan.id)"
               variant="tonal"
               color="primary"
               @click="joinPlan(plan.id)"
               :loading="joining === plan.id"
             >
               Add to Plans
             </v-btn>
             <v-btn
               v-else-if="isAuthenticated && isJoined(plan.id)"
               variant="flat"
               color="success"
               disabled
               prepend-icon="mdi-check"
             >
               Joined
             </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
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
