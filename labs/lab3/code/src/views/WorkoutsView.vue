<template>
  <v-container>
    <div class="d-flex flex-column flex-md-row justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold">Workouts</h1>

      <!-- Filters -->
      <div class="d-flex gap-2 mt-4 mt-md-0">
        <v-select
          v-model="filters.level"
          :items="['beginner', 'intermediate', 'advanced']"
          label="Level"
          density="compact"
          variant="outlined"
          hide-details
          class="min-w-150"
          clearable
        ></v-select>
        <v-select
          v-model="filters.type"
          :items="['strength', 'cardio', 'flexibility', 'hiit']"
          label="Type"
          density="compact"
          variant="outlined"
          hide-details
          class="min-w-150"
          clearable
        ></v-select>
      </div>
    </div>

    <v-row v-if="loading">
       <v-col v-for="n in 6" :key="n" cols="12" sm="6" md="4">
         <v-skeleton-loader type="card"></v-skeleton-loader>
       </v-col>
    </v-row>

    <v-row v-else-if="filteredWorkouts.length">
      <v-col
        v-for="workout in filteredWorkouts"
        :key="workout.id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card class="h-100 d-flex flex-column" hover :to="'/workouts/' + workout.id">
          <v-card-item>
            <div class="d-flex justify-space-between mb-2">
              <v-chip size="small" color="primary" class="text-capitalize">{{ workout.level || 'All Levels' }}</v-chip>
              <span class="text-caption text-medium-emphasis">{{ workout.duration_min }} min</span>
            </div>
            <v-card-title>{{ workout.title }}</v-card-title>
            <v-card-subtitle class="text-capitalize">{{ workout.workout_type }}</v-card-subtitle>
          </v-card-item>

          <v-card-text>
            {{ workout.description }}
          </v-card-text>

          <v-card-actions class="mt-auto">
            <v-btn variant="text" color="primary" block>View Details</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-alert v-else type="info" variant="tonal" class="mt-4">
      No workouts found matching your criteria.
    </v-alert>

    <v-alert v-if="error" type="error" class="mt-4">
      {{ error }}
    </v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useWorkouts } from '@/composables/useWorkouts';

const { workouts, loading, error, fetchWorkouts } = useWorkouts();

const filters = ref({
  level: null as string | null,
  type: null as string | null
});

const filteredWorkouts = computed(() => {
  return workouts.value.filter(w => {
    if (filters.value.level && w.level !== filters.value.level) return false;
    if (filters.value.type && w.workout_type !== filters.value.type) return false;
    return true;
  });
});

onMounted(() => {
  fetchWorkouts();
});
</script>

<style scoped>
.min-w-150 {
  min-width: 150px;
}
</style>
