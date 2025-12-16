<template>
  <div class="container py-5">
    <div class="d-flex align-items-center mb-5">
      <div class="user-initials-badge user-initials-badge--lg me-3" id="userInitials">{{ initials }}</div>
      <div>
        <h1 class="display-5 fw-bold mb-0">Welcome back, <span id="userName">{{ authStore.userName }}</span></h1>
        <p class="text-muted mb-0" id="userEmail">{{ authStore.user?.email }}</p>
      </div>
    </div>

    <div class="row g-4">
      <!-- Progress Section -->
      <div class="col-lg-8">
        <div class="card h-100 shadow-sm">
          <div class="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
            <h5 class="mb-0 fw-bold">Your Progress</h5>
            <span v-if="latestProgress" class="badge bg-success bg-opacity-10 text-success">
              Last updated: {{ formatDate(latestProgress.updated_at || latestProgress.created_at) }}
            </span>
          </div>
          <div class="card-body">
            <div id="progressContainer">
              <div v-if="latestProgress" class="progress-card">
                <div class="d-flex justify-content-between">
                  <div>
                    <p class="mb-1 text-muted">Current weight</p>
                    <h5 class="fw-bold">{{ latestProgress.current_weight ?? '-' }} kg</h5>
                  </div>
                  <div>
                    <p class="mb-1 text-muted">Target weight</p>
                    <h5 class="fw-bold">{{ latestProgress.target_weight ?? '-' }} kg</h5>
                  </div>
                </div>
                <div class="mt-3 d-flex justify-content-between">
                  <div>
                    <p class="mb-1 text-muted">Steps walked</p>
                    <h6>{{ latestProgress.steps_walked ?? 0 }}</h6>
                  </div>
                  <div>
                    <p class="mb-1 text-muted">Water intake</p>
                    <h6>{{ latestProgress.water_intake ?? 0 }} L</h6>
                  </div>
                </div>
                <p class="text-muted small mb-0 mt-3">Last updated: {{ formatDate(latestProgress.updated_at || latestProgress.created_at) }}</p>
              </div>
              <p v-else class="mb-2">No progress yet. Log your first update below to start tracking.</p>
            </div>

            <hr class="my-4">

            <h6 class="fw-bold mb-3">Log Update</h6>
            <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>
            <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

            <form @submit.prevent="saveProgress" id="progressForm" class="row g-3">
              <div class="col-sm-3">
                <label for="current_weight" class="form-label small text-muted">Weight (kg)</label>
                <input v-model.number="form.current_weight" type="number" class="form-control form-control-sm" id="current_weight" step="0.1">
              </div>
              <div class="col-sm-3">
                <label for="target_weight" class="form-label small text-muted">Target (kg)</label>
                <input v-model.number="form.target_weight" type="number" class="form-control form-control-sm" id="target_weight" step="0.1">
              </div>
              <div class="col-sm-3">
                <label for="steps_walked" class="form-label small text-muted">Steps</label>
                <input v-model.number="form.steps_walked" type="number" class="form-control form-control-sm" id="steps_walked">
              </div>
              <div class="col-sm-3">
                <label for="water_intake" class="form-label small text-muted">Water (L)</label>
                <input v-model.number="form.water_intake" type="number" class="form-control form-control-sm" id="water_intake" step="0.1">
              </div>
              <div class="col-12 mt-3">
                <button type="submit" class="btn btn-sm btn-dark" :disabled="saving">
                  {{ latestProgress ? 'Log new progress' : 'Save first progress entry' }}
                </button>
              </div>
            </form>
          </div>

          <!-- History -->
          <div class="card-footer bg-light-subtle border-top-0">
             <div id="progressHistory">
                <div v-if="history.length" class="mt-3">
                  <h6 class="fw-bold mb-2">Recent updates</h6>
                  <ul class="list-unstyled mb-0">
                    <li v-for="record in history" :key="record.id" class="d-flex justify-content-between align-items-start py-2 border-bottom small gap-3">
                      <div class="flex-grow-1">
                        <div class="fw-semibold">{{ record.current_weight ?? '-' }} kg</div>
                        <div class="text-muted">Target: {{ record.target_weight ?? '-' }} kg</div>
                        <div class="text-muted">Steps: {{ record.steps_walked ?? 0 }} · Water: {{ record.water_intake ?? 0 }} L</div>
                      </div>
                      <div class="text-end text-muted">
                        {{ formatDate(record.updated_at || record.created_at) }}
                        <span v-if="record.id === latestProgress?.id" class="badge bg-dark ms-2">Latest</span>
                      </div>
                    </li>
                  </ul>
                </div>
                <p v-else class="text-muted small mb-0">No previous updates yet.</p>
             </div>
          </div>
        </div>
      </div>

      <!-- Training Plans -->
      <div class="col-lg-4">
        <div class="card h-100 shadow-sm">
          <div class="card-header bg-transparent border-0">
            <h5 class="mb-0 fw-bold">My Training Plans</h5>
          </div>
          <div id="trainingPlansContainer">
            <ul v-if="userPlans.length" class="list-group list-group-flush">
              <li v-for="plan in userPlans" :key="plan.id" class="list-group-item d-flex flex-column">
                <strong>{{ getPlanTitle(plan.training_plan_id) }}</strong>
                <small class="text-muted">Plan #{{ plan.training_plan_id }}</small>
                <div class="mt-2 d-flex gap-2">
                  <router-link class="btn btn-sm btn-brand-primary" :to="'/training-plans/' + plan.training_plan_id">View plan</router-link>
                </div>
              </li>
            </ul>
            <p v-else class="p-3 mb-0">No training plans linked yet.</p>
          </div>
          <div v-if="!userPlans.length" class="card-body">
             <router-link to="/training-plans" class="btn btn-outline-dark w-100">Find a Plan</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { getUserProgress, updateUserProgress, getUserTrainingPlans, type UserProgress, type UserTrainingPlan } from '@/api/progress';

const authStore = useAuthStore();
const progressData = ref<UserProgress[]>([]);
const userPlans = ref<UserTrainingPlan[]>([]);
const saving = ref(false);
const successMsg = ref('');
const errorMsg = ref('');

const form = ref({
  current_weight: undefined as number | undefined,
  target_weight: undefined as number | undefined,
  steps_walked: undefined as number | undefined,
  water_intake: undefined as number | undefined
});

const initials = computed(() => {
  return (authStore.userName || 'GG')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2);
});

const latestProgress = computed(() => progressData.value[0]);
// Exclude the latest one from history if desired, or show all. Lab 1 showed all in history list but highlighted latest.
// But the sort order was desc.
const history = computed(() => progressData.value.slice(0, 7));

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getPlanTitle(id: number) {
  // In a real app we would fetch the plan details or have them in store.
  // For now, mirroring Lab 1 fallback behavior
  return `Plan #${id}`;
}

async function loadData() {
  if (!authStore.user?.id) return;
  try {
    const [progress, plans] = await Promise.all([
      getUserProgress(),
      getUserTrainingPlans()
    ]);

    // Client-side filter
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
  successMsg.value = '';
  errorMsg.value = '';
  try {
    await updateUserProgress({
      user_id: authStore.user.id,
      ...form.value
    });
    successMsg.value = 'Progress saved!';
    await loadData();
  } catch (e) {
    console.error(e);
    errorMsg.value = 'Failed to save progress';
  } finally {
    saving.value = false;
  }
}

onMounted(loadData);
</script>
