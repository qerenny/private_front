<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="text-center py-12">
        <h1 class="text-h2 font-weight-bold mb-4">Grizzly Fitness</h1>
        <p class="text-h5 text-medium-emphasis mb-6">Train like a beast. Recover like a bear.</p>
        <div class="d-flex justify-center gap-4">
          <v-btn
            color="primary"
            size="x-large"
            to="/register"
            prepend-icon="mdi-account-plus"
            class="mr-4"
          >
            Join the Pack
          </v-btn>
          <v-btn
            variant="outlined"
            size="x-large"
            to="/workouts"
            prepend-icon="mdi-dumbbell"
          >
            Browse Workouts
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row class="mt-8">
      <v-col cols="12" md="4">
        <v-card class="h-100" hover>
          <v-card-item>
            <v-icon color="primary" size="large" class="mb-3">mdi-fire</v-icon>
            <v-card-title>Intense Workouts</v-card-title>
            <v-card-subtitle>For every level</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            Access our library of professionally designed workouts, from HIIT to Strength training.
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="h-100" hover>
          <v-card-item>
            <v-icon color="primary" size="large" class="mb-3">mdi-chart-line</v-icon>
            <v-card-title>Track Progress</v-card-title>
            <v-card-subtitle>See your gains</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            Log your weight, water intake, and steps. Visualize your journey to success.
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="h-100" hover>
          <v-card-item>
            <v-icon color="primary" size="large" class="mb-3">mdi-book-open-variant</v-icon>
            <v-card-title>Expert Advice</v-card-title>
            <v-card-subtitle>Learn and grow</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            Read our blog for tips on nutrition, recovery, and mindset.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
// Logic for landing page
</script>
