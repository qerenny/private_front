<template>
  <div class="container py-5">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
      <div class="d-flex justify-content-between align-items-center flex-wrap mb-3">
        <div>
          <h1 class="section-title mb-0">Workouts</h1>
          <p class="text-muted">Browse all workouts for inspiration. Add complete programs from the Training plans page.</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3 align-items-end">
            
            <div class="col-md-4">
              <label class="form-label" for="filterLevel">Level</label>
              <select 
                id="filterLevel"
                v-model="filters.level" 
                class="form-select form-select-sm" 
                aria-label="Filter by Level"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label" for="filterType">Type</label>
              <select 
                id="filterType"
                v-model="filters.type" 
                class="form-select form-select-sm" 
                aria-label="Filter by Type"
              >
                <option value="">All Types</option>
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="flexibility">Flexibility</option>
                <option value="hiit">HIIT</option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label" for="filterDuration">Duration</label>
              <select 
                id="filterDuration"
                v-model="filters.duration" 
                class="form-select form-select-sm" 
                aria-label="Filter by Duration"
              >
                <option value="">Any Duration</option>
                <option value="<20">&lt; 20 min</option>
                <option value="20-40">20-40 min</option>
                <option value=">40">&gt; 40 min</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
       <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else class="row g-4" id="workoutsGrid">
       <div v-if="!filteredWorkouts.length" class="col-12 text-center text-muted">
         <p>No workouts found matching your criteria.</p>
       </div>
       <div v-for="w in filteredWorkouts" :key="w.id" class="col-md-6 col-lg-4">
          <div class="workout-card card h-100">
            <div class="card-body d-flex flex-column">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="card-title mb-0">{{ w.title }}</h5>
                <span class="card-tag">{{ w.level || 'all levels' }}</span>
              </div>
              <p class="card-text text-muted small">{{ w.workout_type || 'mixed' }} · {{ w.duration_min || 0 }} min</p>
              <p class="card-text flex-grow-1">{{ w.description || '' }}</p>
              <router-link class="btn btn-sm btn-brand-primary mt-auto align-self-start" :to="'/workouts/' + w.id">View details</router-link>
            </div>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useWorkouts } from '@/composables/useWorkouts';

const { workouts, loading, error, fetchWorkouts } = useWorkouts();

const filters = ref({
  level: '',
  type: '',
  duration: ''
});

const filteredWorkouts = computed(() => {
  return workouts.value.filter(w => {
    if (filters.value.level && w.level !== filters.value.level) return false;
    if (filters.value.type && w.workout_type !== filters.value.type) return false;

    if (filters.value.duration) {
      const d = w.duration_min || 0;
      if (filters.value.duration === '<20' && d >= 20) return false;
      if (filters.value.duration === '20-40' && (d < 20 || d > 40)) return false;
      if (filters.value.duration === '>40' && d <= 40) return false;
    }

    return true;
  });
});

onMounted(() => {
  fetchWorkouts();
});
</script>
