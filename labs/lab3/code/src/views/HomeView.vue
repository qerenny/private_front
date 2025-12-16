<template>
  <div>
    <!-- Hero Section -->
    <header class="hero-section text-center text-white d-flex align-items-center justify-content-center" style="background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/assets/hero-bg.jpg') no-repeat center center / cover; min-height: 60vh;">
      <div class="container">
        <h1 class="display-3 fw-bold mb-3">Train Like a Beast</h1>
        <p class="lead mb-4">Your journey to peak performance starts here. Join the pack.</p>
        <div class="d-flex gap-3 justify-content-center">
          <router-link class="btn btn-brand-primary btn-lg px-5" to="/register">Start Free Trial</router-link>
          <router-link class="btn btn-outline-light btn-lg px-5" to="/workouts">Explore Workouts</router-link>
        </div>
      </div>
    </header>

    <!-- Features -->
    <section class="py-5">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-4 text-center">
            <div class="feature-icon bg-brand-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 64px; height: 64px;">
              <svg width="32" height="32" fill="currentColor"><use href="/assets/sprite.svg#icon-dumbbell"></use></svg>
            </div>
            <h3>Expert Workouts</h3>
            <p class="text-muted">Curated plans for every level, from HIIT to Strength.</p>
          </div>
          <div class="col-md-4 text-center">
            <div class="feature-icon bg-brand-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 64px; height: 64px;">
              <svg width="32" height="32" fill="currentColor"><use href="/assets/sprite.svg#icon-chart"></use></svg>
            </div>
            <h3>Track Progress</h3>
            <p class="text-muted">Monitor your stats and see your improvement over time.</p>
          </div>
          <div class="col-md-4 text-center">
            <div class="feature-icon bg-brand-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 64px; height: 64px;">
              <svg width="32" height="32" fill="currentColor"><use href="/assets/sprite.svg#icon-users"></use></svg>
            </div>
            <h3>Community</h3>
            <p class="text-muted">Join thousands of athletes pushing their limits.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Previews -->
    <section class="py-5 bg-light-subtle">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="section-title">Trending Workouts</h2>
          <router-link class="btn btn-link link-brand-primary" to="/workouts">View all</router-link>
        </div>
        <div class="row g-4" id="workoutsPreview">
           <div v-for="w in featuredWorkouts" :key="w.id" class="col-md-6 col-lg-3">
              <div class="card workout-card h-100">
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
    </section>

    <section class="py-5">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="section-title">Latest from the Blog</h2>
          <router-link class="btn btn-link link-brand-primary" to="/blog">Read more</router-link>
        </div>
        <div class="row g-4" id="blogPreview">
           <div v-for="post in recentPosts" :key="post.id" class="col-md-4">
              <div class="card h-100">
                <div class="card-body d-flex flex-column">
                  <h5 class="card-title">{{ post.title }}</h5>
                  <p class="card-text text-muted small">{{ formatDate(post.created_at) }}</p>
                  <p class="card-text flex-grow-1">{{ getPreview(post.content) }}</p>
                  <router-link class="btn btn-sm btn-brand-primary mt-auto align-self-start" :to="'/blog/' + post.id">Read more</router-link>
                </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getWorkouts, type Workout } from '@/api/workouts';
import { getBlogPosts, type BlogPost } from '@/api/blog';

const featuredWorkouts = ref<Workout[]>([]);
const recentPosts = ref<BlogPost[]>([]);

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString();
}

function getPreview(content: string | { text?: string } | undefined) {
  if (!content) return 'Read the full story inside.';
  const text = typeof content === 'string' ? content : (content.text || '');
  return text.length > 120 ? text.slice(0, 120) + '...' : text;
}

onMounted(async () => {
  try {
    const workouts = await getWorkouts();
    featuredWorkouts.value = workouts.slice(0, 4);
  } catch (e) {
    console.error(e);
    // Fallback data
    featuredWorkouts.value = [
       { id: 1, title: 'Power HIIT', level: 'advanced', workout_type: 'cardio', duration_min: 25 },
       { id: 2, title: 'Strength 101', level: 'beginner', workout_type: 'strength', duration_min: 40 },
    ];
  }

  try {
    const posts = await getBlogPosts();
    recentPosts.value = posts.slice(0, 3);
  } catch (e) {
    console.error(e);
    // Fallback data
    recentPosts.value = [
      { id: 1, title: 'Fuel like a bear', content: 'Basics of nutrition.', created_at: '2025-01-10' },
      { id: 2, title: 'Mobility every day', content: 'Stretch to grow.', created_at: '2025-01-15' },
    ];
  }
});
</script>
