<template>
  <div>
    <!-- Hero Section -->
    <header class="hero">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-7">
            <div class="hero__content">
              <div class="hero__badge mb-3">Train like a grizzly</div>
              <h1 class="display-4 fw-bold text-uppercase">Brutal. Precise. Powerful.</h1>
              <p class="lead mt-3 mb-4">Grizzly Gym is your digital strength den – plans, workouts, progress and community, all in one brutal yet clean interface.</p>
                <div class="d-flex hero__cta flex-wrap">
                  <router-link class="btn btn-brand-primary btn-lg px-5" to="/register">Start Free Trial</router-link>
                  <router-link class="btn btn-outline-light btn-lg px-5" to="/workouts">Explore Workouts</router-link>
              </div>
            </div>
          </div>
          <div class="col-lg-5 text-center mt-4 mt-lg-0">
            <svg class="img-fluid" style="height: 460px; width: 100%;" role="img" aria-label="Grizzly bear logo">
              <use href="/assets/sprite.svg#logo-grizzly-gym"></use>
            </svg>
          </div>
        </div>
      </div>
    </header>

    <!-- Features -->
    <section class="py-5" id="plans">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap">
          <h2 class="section-title mb-0">Why Grizzly Gym</h2>
          <p class="text-muted mb-0">Tools crafted for relentless athletes.</p>
        </div>
        <div class="row g-3">
          <div class="col-md-6 col-lg-3 d-flex">
            <div class="feature-card p-4 w-100 d-flex flex-column gap-2">
              <span class="feature-card__icon"><i class="bi bi-activity" aria-hidden="true"></i></span>
              <h5 class="fw-bold">Smart workout plans</h5>
              <p class="text-muted mb-0">Adaptive programming aligned with your goals.</p>
            </div>
          </div>
          <div class="col-md-6 col-lg-3 d-flex">
            <div class="feature-card p-4 w-100 d-flex flex-column gap-2">
              <span class="feature-card__icon"><i class="bi bi-graph-up" aria-hidden="true"></i></span>
              <h5 class="fw-bold">Progress tracking</h5>
              <p class="text-muted mb-0">Keep weight, steps, water and lifts in one vault.</p>
            </div>
          </div>
          <div class="col-md-6 col-lg-3 d-flex">
            <div class="feature-card p-4 w-100 d-flex flex-column gap-2">
              <span class="feature-card__icon"><i class="bi bi-camera-video" aria-hidden="true"></i></span>
              <h5 class="fw-bold">Video workouts</h5>
              <p class="text-muted mb-0">Coach-led sessions to perfect your form.</p>
            </div>
          </div>
          <div class="col-md-6 col-lg-3 d-flex">
            <div class="feature-card p-4 w-100 d-flex flex-column gap-2">
              <span class="feature-card__icon"><i class="bi bi-heart-pulse" aria-hidden="true"></i></span>
              <h5 class="fw-bold">Health & nutrition</h5>
                <p class="text-muted mb-0">Fuel and recovery guidance from pros.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Previews -->
    <section class="py-5">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="section-title">Featured Workouts</h2>
          <router-link class="btn btn-sm btn-brand-primary" to="/workouts">Browse all</router-link>
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
          <h2 class="section-title">From the Blog</h2>
          <router-link class="btn btn-sm btn-brand-primary" to="/blog">Read more</router-link>
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
