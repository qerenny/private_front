<template>
  <v-container>
    <div class="d-flex align-center mb-6">
      <v-avatar color="primary" size="64" class="mr-4">
        <span class="text-h5 font-weight-bold">{{ initials }}</span>
      </v-avatar>
      <div>
        <h1 class="text-h4 font-weight-bold">Welcome back, {{ authStore.userName }}</h1>
        <p class="text-medium-emphasis">{{ authStore.user?.email }}</p>
      </div>
    </div>

    <v-row>
      <!-- Progress Section -->
      <v-col cols="12" md="8">
        <v-card class="mb-6">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Your Progress</span>
            <v-chip v-if="latestProgress" size="small" color="success">
              Last updated: {{ formatDate(latestProgress.updated_at || latestProgress.created_at) }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <div v-if="latestProgress" class="d-flex justify-space-between text-center mb-6">
              <div>
                <div class="text-h4 font-weight-bold text-primary">{{ latestProgress.current_weight }} <span class="text-body-1">kg</span></div>
                <div class="text-caption">Current Weight</div>
              </div>
              <div>
                <div class="text-h4 font-weight-bold">{{ latestProgress.target_weight }} <span class="text-body-1">kg</span></div>
                <div class="text-caption">Target Weight</div>
              </div>
              <div>
                <div class="text-h4 font-weight-bold">{{ latestProgress.steps_walked }}</div>
                <div class="text-caption">Steps</div>
              </div>
              <div>
                <div class="text-h4 font-weight-bold">{{ latestProgress.water_intake }} <span class="text-body-1">L</span></div>
                <div class="text-caption">Water</div>
              </div>
            </div>

            <div v-else class="text-center py-4 text-medium-emphasis">
              No progress logged yet. Start tracking today!
            </div>

            <v-divider class="my-4"></v-divider>

            <h3 class="text-h6 mb-3">Log Update</h3>
            <v-form @submit.prevent="saveProgress">
               <v-row dense>
                 <v-col cols="6" sm="3">
                   <v-text-field v-model.number="form.current_weight" label="Weight (kg)" type="number" density="compact" variant="outlined" hide-details></v-text-field>
                 </v-col>
                 <v-col cols="6" sm="3">
                   <v-text-field v-model.number="form.target_weight" label="Target (kg)" type="number" density="compact" variant="outlined" hide-details></v-text-field>
                 </v-col>
                 <v-col cols="6" sm="3">
                   <v-text-field v-model.number="form.steps_walked" label="Steps" type="number" density="compact" variant="outlined" hide-details></v-text-field>
                 </v-col>
                 <v-col cols="6" sm="3">
                   <v-text-field v-model.number="form.water_intake" label="Water (L)" type="number" density="compact" variant="outlined" hide-details></v-text-field>
                 </v-col>
               </v-row>
               <v-btn type="submit" color="primary" class="mt-4" :loading="saving">Save Progress</v-btn>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- History -->
        <v-card title="History">
          <v-list lines="two" v-if="history.length">
            <v-list-item
              v-for="record in history"
              :key="record.id"
              :subtitle="formatDate(record.updated_at || record.created_at)"
            >
              <template v-slot:title>
                <div class="d-flex gap-4">
                  <span>{{ record.current_weight }} kg</span>
                  <span class="text-medium-emphasis text-caption align-self-center">Target: {{ record.target_weight }}</span>
                </div>
              </template>
              <template v-slot:append>
                <div class="text-right">
                  <div class="text-caption">Steps: {{ record.steps_walked }}</div>
                  <div class="text-caption">Water: {{ record.water_intake }}L</div>
                </div>
              </template>
            </v-list-item>
          </v-list>
          <v-card-text v-else class="text-center text-medium-emphasis">No history yet.</v-card-text>
        </v-card>
      </v-col>

      <!-- Sidebar -->
      <v-col cols="12" md="4">
        <v-card title="My Training Plans" class="h-100">
           <v-list v-if="userPlans.length">
             <v-list-item
               v-for="plan in userPlans"
               :key="plan.id"
               :to="'/training-plans/' + plan.training_plan_id"
               link
             >
               <v-list-item-title class="font-weight-bold">Plan #{{ plan.training_plan_id }}</v-list-item-title>
               <v-list-item-subtitle>Click to view details</v-list-item-subtitle>
               <template v-slot:append>
                 <v-icon icon="mdi-chevron-right"></v-icon>
               </template>
             </v-list-item>
           </v-list>
           <v-card-text v-else>
             <p class="text-medium-emphasis mb-4">You haven't joined any training plans yet.</p>
             <v-btn to="/training-plans" variant="outlined" block>Browse Plans</v-btn>
           </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { getUserProgress, updateUserProgress, getUserTrainingPlans, type UserProgress, type UserTrainingPlan } from '@/api/progress';

const authStore = useAuthStore();
const progressData = ref<UserProgress[]>([]);
const userPlans = ref<UserTrainingPlan[]>([]);
const saving = ref(false);

const form = ref({
  current_weight: undefined as number | undefined,
  target_weight: undefined as number | undefined,
  steps_walked: undefined as number | undefined,
  water_intake: undefined as number | undefined
});

const initials = computed(() => {
  return (authStore.userName || 'GG')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

const latestProgress = computed(() => progressData.value[0]);
const history = computed(() => progressData.value.slice(0, 5));

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString();
}

async function loadData() {
  if (!authStore.user?.id) return;
  try {
    const [progress, plans] = await Promise.all([
      getUserProgress(),
      getUserTrainingPlans()
    ]);

    // Filter by user ID just in case API returns all
    progressData.value = progress
      .filter(p => String(p.user_id) === String(authStore.user?.id))
      .sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime());

    userPlans.value = plans.filter(p => String(p.user_id) === String(authStore.user?.id));

    if (latestProgress.value) {
      form.value = {
        current_weight: latestProgress.value.current_weight,
        target_weight: latestProgress.value.target_weight,
        steps_walked: latestProgress.value.steps_walked,
        water_intake: latestProgress.value.water_intake
      };
    }
  } catch (e) {
    console.error('Failed to load dashboard data', e);
  }
}

async function saveProgress() {
  if (!authStore.user?.id) return;
  saving.value = true;
  try {
    await updateUserProgress({
      user_id: authStore.user.id,
      ...form.value
    });
    await loadData();
  } catch (e) {
    console.error(e);
    alert('Failed to save progress');
  } finally {
    saving.value = false;
  }
}

onMounted(loadData);
</script>
