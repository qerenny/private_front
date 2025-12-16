<template>
  <div class="container py-5">
    <h1 class="display-6 fw-bold mb-5">Blog</h1>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else class="row g-4" id="blogList">
       <div v-if="!posts.length" class="col-12 text-center text-muted">
         <p>No posts yet.</p>
       </div>
       <div v-for="post in posts" :key="post.id" class="col-md-6 col-lg-4">
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
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useBlog } from '@/composables/useBlog';

const { posts, loading, error, fetchPosts } = useBlog();

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString();
}

function getPreview(content: string | { text?: string }) {
  const text = typeof content === 'string' ? content : (content?.text || '');
  return text.length > 100 ? text.slice(0, 100) + '...' : text;
}

onMounted(() => {
  fetchPosts();
});
</script>
