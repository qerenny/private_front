<template>
  <v-container>
    <h1 class="text-h4 font-weight-bold mb-6">Blog</h1>

    <div v-if="loading" class="d-flex justify-center py-12">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <v-alert v-else-if="error" type="error">{{ error }}</v-alert>

    <v-row v-else>
      <v-col
        v-for="post in posts"
        :key="post.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="h-100 d-flex flex-column" hover :to="'/blog/' + post.id">
          <v-card-item>
            <div class="text-caption text-medium-emphasis mb-1">
              {{ formatDate(post.created_at) }}
            </div>
            <v-card-title>{{ post.title }}</v-card-title>
          </v-card-item>

          <v-card-text class="flex-grow-1">
            {{ getPreview(post.content) }}
          </v-card-text>

          <v-card-actions class="mt-auto">
            <v-btn variant="text" color="primary">Read More</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
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
