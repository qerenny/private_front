<template>
  <div class="container py-5">
    <div v-if="loading" class="text-center py-5">
       <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else-if="workout" id="workoutDetail">
       <div class="card border-0 shadow-sm">
         <div class="card-body p-4">
           <div class="d-flex flex-wrap justify-content-between align-items-center mb-4">
             <div>
               <h2 class="section-title mb-2">{{ workout.title }}</h2>
               <p class="text-muted mb-0">{{ workout.workout_type || '' }} · {{ workout.level || '' }} · {{ workout.duration_min || 0 }} minutes</p>
             </div>
             <span class="card-tag card-tag--accent">Featured</span>
           </div>

           <p class="lead">{{ workout.description || 'No description provided.' }}</p>

           <hr class="my-4">

           <h4 class="fw-bold mb-3">Instructions</h4>
           <p>{{ workout.instructions || 'Follow the trainer guidance and maintain form.' }}</p>

           <div v-if="workout.video_url" class="ratio ratio-16x9 mt-4">
              <iframe :src="workout.video_url" title="Workout video" allowfullscreen></iframe>
           </div>
         </div>
       </div>
       <div class="mt-4">
         <router-link to="/workouts" class="btn btn-outline-secondary">Back to Workouts</router-link>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getWorkout, type Workout } from '@/api/workouts';

const route = useRoute();
const workout = ref<Workout | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  const id = route.params.id as string;
  try {
    workout.value = await getWorkout(id);
  } catch (e) {
    console.error(e);
    error.value = 'Failed to load workout details';
  } finally {
    loading.value = false;
  }
});
</script>
