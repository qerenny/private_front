<template>
  <v-container>
    <div v-if="loading" class="d-flex justify-center py-12">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <v-alert v-else-if="error" type="error">{{ error }}</v-alert>

    <div v-else-if="workout">
      <v-btn variant="text" prepend-icon="mdi-arrow-left" to="/workouts" class="mb-4">Back to Workouts</v-btn>

      <v-card>
        <v-card-text>
          <div class="d-flex flex-wrap justify-space-between align-center mb-4">
            <h1 class="text-h4 font-weight-bold">{{ workout.title }}</h1>
            <div class="d-flex gap-2">
              <v-chip color="primary">{{ workout.level }}</v-chip>
              <v-chip variant="outlined">{{ workout.duration_min }} min</v-chip>
              <v-chip variant="outlined">{{ workout.workout_type }}</v-chip>
            </div>
          </div>

          <p class="text-body-1 mb-6">{{ workout.description }}</p>

          <v-divider class="mb-6"></v-divider>

          <h2 class="text-h5 font-weight-bold mb-4">Instructions</h2>
          <p class="text-body-1 whitespace-pre-line mb-6">{{ workout.instructions || 'Follow the video guidance.' }}</p>

          <div v-if="workout.video_url" class="video-container">
             <iframe
               width="100%"
               height="400"
               :src="workout.video_url"
               title="Workout Video"
               frameborder="0"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               allowfullscreen
             ></iframe>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
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

<style scoped>
.whitespace-pre-line {
  white-space: pre-line;
}
</style>
