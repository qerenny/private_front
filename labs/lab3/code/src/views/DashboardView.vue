<template>
  <div class="container py-4 dashboard">
    <div class="d-flex justify-content-between align-items-center">
      <div>
        <h1 class="h2 mb-0 fw-bold">Your den</h1>
        <p class="text-muted mb-0">Manage your progress and training plans.</p>
      </div>
      <router-link to="/workouts" class="btn btn-brand-primary">Browse workouts</router-link>
    </div>

    <div class="dashboard__columns">
      <aside class="dashboard__sidebar p-4">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="avatar-circle">
              {{ initials }}
            </div>
            <div class="overflow-hidden">
              <h5 class="mb-1 text-truncate">{{ authStore.userName || 'Athlete' }}</h5>
              <p class="mb-0 text-muted small text-truncate">{{ authStore.user?.email }}</p>
            </div>
          </div>
          <div class="d-flex flex-column gap-2 mt-auto">
            <router-link class="btn btn-sm btn-outline-dark" to="/workouts">
              <i class="bi bi-search me-2"></i>Find workouts
            </router-link>
            <router-link class="btn btn-sm btn-outline-dark" to="/blog">
              <i class="bi bi-journal-text me-2"></i>Read the blog
            </router-link>
            <button class="btn btn-sm btn-brand-primary" @click="handleLogout">
              <i class="bi bi-box-arrow-right me-2"></i>Logout
            </button>
          </div>
      </aside>

      <section class="flex-grow-1 dashboard__content">
        
        <div class="dashboard-card">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0 fw-bold">Progress tracking</h5>
            <span class="badge bg-dark">Live</span>
          </div>

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
                <p class="text-muted small mb-0 mt-3">
                  Last updated: {{ formatDate(latestProgress.updated_at || latestProgress.created_at) }}
                </p>
             </div>
             <p v-else class="mb-2 text-muted">No progress yet. Log your first update below.</p>
          </div>

          <div class="mt-3" v-if="history.length">
             <hr class="text-muted opacity-25">
             <h6 class="fw-bold mb-2">Recent updates</h6>
             <ul class="list-unstyled mb-0">
                <li v-for="record in history" :key="record.id" class="d-flex justify-content-between align-items-start py-2 border-bottom small gap-3">
                  <div class="flex-grow-1">
                    <span class="fw-semibold">{{ record.current_weight ?? '-' }} kg</span>
                    <span class="text-muted mx-1">/</span>
                    <span class="text-muted">{{ record.steps_walked ?? 0 }} steps</span>
                  </div>
                  <div class="text-end text-muted">
                    {{ formatDate(record.updated_at || record.created_at) }}
                  </div>
                </li>
             </ul>
          </div>

          <div v-if="successMsg" class="alert alert-success mt-3 py-2 small">{{ successMsg }}</div>
          <div v-if="errorMsg" class="alert alert-danger mt-3 py-2 small">{{ errorMsg }}</div>

          <form @submit.prevent="saveProgress" class="row g-3 mt-2">
            <div class="col-md-6">
              <label for="current_weight" class="form-label small text-muted mb-1">Current weight (kg)</label>
              <input v-model.number="form.current_weight" type="number" class="form-control" id="current_weight" step="0.1">
            </div>
            <div class="col-md-6">
              <label for="target_weight" class="form-label small text-muted mb-1">Target weight (kg)</label>
              <input v-model.number="form.target_weight" type="number" class="form-control" id="target_weight" step="0.1">
            </div>
            <div class="col-md-6">
              <label for="steps_walked" class="form-label small text-muted mb-1">Steps walked</label>
              <input v-model.number="form.steps_walked" type="number" class="form-control" id="steps_walked">
            </div>
            <div class="col-md-6">
              <label for="water_intake" class="form-label small text-muted mb-1">Water intake (L)</label>
              <input v-model.number="form.water_intake" type="number" class="form-control" id="water_intake" step="0.1">
            </div>
            <div class="col-12">
              <button type="submit" class="btn btn-brand-primary w-100 w-md-auto" :disabled="saving">
                {{ saving ? 'Saving...' : 'Update progress' }}
              </button>
            </div>
          </form>
        </div>

        <div class="dashboard-card">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="mb-0 fw-bold">Your training plans</h5>
            <router-link to="/training-plans" class="btn btn-sm btn-outline-dark">Explore plans</router-link>
          </div>
          
          <div class="small">
              <div v-if="loadingPlans" class="text-center py-3 text-muted">
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Loading...
              </div>

              <ul v-else-if="enrichedPlans.length" class="list-group list-group-flush">
                <li v-for="plan in enrichedPlans" :key="plan.id" class="list-group-item d-flex flex-column px-0 py-3 border-bottom">
                  <strong>{{ plan.title }}</strong>
                  <small class="text-muted mb-2">{{ plan.description }}</small>
                  
                  <div class="d-flex gap-2">
                    <router-link :to="'/training-plans/' + plan.training_plan_id" class="btn btn-sm btn-brand-primary">
                      View plan
                    </router-link>
                    <button class="btn btn-sm btn-outline-danger" @click="removePlan(plan.id)">
                      Remove
                    </button>
                  </div>
                </li>
              </ul>
              
              <p v-else class="text-muted mb-0">No training plans linked yet.</p>
          </div>
        </div>

        <div class="dashboard-card">
          <h5 class="mb-2 fw-bold">Need inspiration?</h5>
          <p class="text-muted small">Head to workouts search and the blog to keep the fire burning.</p>
          <div class="d-flex gap-2 flex-wrap">
            <router-link class="btn btn-sm btn-brand-primary" to="/workouts">Search workouts</router-link>
            <router-link class="btn btn-sm btn-outline-dark" to="/blog">Read blog</router-link>
          </div>
        </div>

      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
// !Важно: Добавьте getTrainingPlan в импорты
import { 
  getUserProgress, 
  updateUserProgress, 
  getUserTrainingPlans, 
  getTrainingPlan,     // <--- Добавлено
  deleteUserTrainingPlan,
  type UserProgress 
} from '@/api/progress';

// Интерфейс для отображения (обогащенный план)
interface EnrichedPlan {
  id: number; // ID связи
  training_plan_id: number;
  title: string;
  description: string;
}

const authStore = useAuthStore();
const router = useRouter();
const progressData = ref<UserProgress[]>([]);
const enrichedPlans = ref<EnrichedPlan[]>([]);
const loadingPlans = ref(false); 

function handleLogout() {
  authStore.logout();
  router.push('/');
}

const saving = ref(false);
const successMsg = ref('');
const errorMsg = ref('');

const form = ref({
  current_weight: undefined as number | undefined,
  target_weight: undefined as number | undefined,
  steps_walked: undefined as number | undefined,
  water_intake: undefined as number | undefined
});

// Initials Logic
const initials = computed(() => {
  return (authStore.userName || 'GG')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2);
});

const latestProgress = computed(() => progressData.value[0]);
const history = computed(() => progressData.value.slice(1, 4));

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString(undefined, {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}


function extractPlanTitle(planInfo: unknown, id: number): string {
  if (planInfo && typeof planInfo === 'object' && 'training_plan' in planInfo) {
      const nested = extractPlanTitle((planInfo as { training_plan: unknown }).training_plan, id);
      if (nested && nested !== `Plan #${id}`) return nested;
  }
  const pi = planInfo as { plan_name?: string; title?: string; name?: string; workout?: { title?: string } };
  if (pi?.plan_name) return pi.plan_name;
  if (pi?.title) return pi.title;
  if (pi?.name) return pi.name;
  if (pi?.workout?.title) return pi.workout.title;
  
  return `Plan #${id}`;
}

function extractPlanDescription(planInfo: unknown): string {
  if (planInfo && typeof planInfo === 'object' && 'training_plan' in planInfo) {
      const nested = extractPlanDescription((planInfo as { training_plan: unknown }).training_plan);
      if (nested && nested !== 'No description available.') return nested;
  }
  const pi = planInfo as { description?: string };
  if (typeof pi?.description === 'string' && pi.description.trim()) {
      return pi.description.trim();
  }
  return 'No description available.';
}


async function loadData() {
  if (!authStore.user?.id) return;
  
  try {
    // 1. Загружаем прогресс
    const progress = await getUserProgress();
    progressData.value = progress
      .filter(p => String(p.user_id) === String(authStore.user?.id))
      .sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime());

    // Заполняем форму
    if (latestProgress.value) {
      form.value = {
        current_weight: latestProgress.value.current_weight,
        target_weight: latestProgress.value.target_weight,
        steps_walked: latestProgress.value.steps_walked,
        water_intake: latestProgress.value.water_intake
      };
    }

    loadingPlans.value = true;
    const allPlans = await getUserTrainingPlans();
    
    const myRawPlans = allPlans.filter(p => String(p.user_id) === String(authStore.user?.id));

    enrichedPlans.value = await Promise.all(myRawPlans.map(async (p) => {
      try {
        const planInfo = await getTrainingPlan(p.training_plan_id);
        return {
          id: p.id!, // ID связи
          training_plan_id: p.training_plan_id,
          title: extractPlanTitle(planInfo, p.training_plan_id),
          description: extractPlanDescription(planInfo)
        };
      } catch (e) {
        console.error(e);
        return {
          id: p.id!,
          training_plan_id: p.training_plan_id,
          title: `Plan #${p.training_plan_id}`,
          description: 'Description unavailable'
        };
      }
    }));

  } catch (e) {
    console.error('Failed to load dashboard data', e);
  } finally {
    loadingPlans.value = false;
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
    setTimeout(() => successMsg.value = '', 3000);
  } catch (e) {
    console.error(e);
    errorMsg.value = 'Failed to save progress';
  } finally {
    saving.value = false;
  }
}

async function removePlan(id: number) {
  if (!confirm('Are you sure you want to remove this plan from your dashboard?')) return;
  try {
    await deleteUserTrainingPlan(id);
    await loadData();
  } catch (e) {
    console.error(e);
    alert('Failed to remove plan');
  }
}

onMounted(loadData);
</script>
