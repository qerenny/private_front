<template>
  <v-container>
    <div v-if="loading" class="d-flex justify-center py-12">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <v-alert v-else-if="error" type="error">{{ error }}</v-alert>

    <div v-else-if="post">
      <v-btn variant="text" prepend-icon="mdi-arrow-left" to="/blog" class="mb-4">Back to Blog</v-btn>

      <v-card class="mb-6">
        <v-card-text>
          <div class="text-caption text-medium-emphasis mb-2">
            {{ formatDate(post.created_at) }} · By {{ formatAuthor(post.author) }}
          </div>
          <h1 class="text-h3 font-weight-bold mb-6">{{ post.title }}</h1>
          <div class="text-body-1 whitespace-pre-wrap">
            {{ getContent(post.content) }}
          </div>
        </v-card-text>
      </v-card>

      <!-- Comments -->
      <v-card>
        <v-card-title>Comments</v-card-title>
        <v-card-text>
          <v-list v-if="post.comments && post.comments.length">
            <v-list-item
              v-for="(comment, idx) in post.comments"
              :key="idx"
              class="mb-2"
            >
               <v-list-item-title class="font-weight-bold text-body-2">
                 {{ formatAuthor(comment.user_name || comment.user) }}
                 <span class="text-caption text-medium-emphasis ml-2">{{ formatDate(comment.created_at) }}</span>
               </v-list-item-title>
               <p class="text-body-2 mt-1">{{ comment.comment_text }}</p>
            </v-list-item>
          </v-list>
          <p v-else class="text-medium-emphasis mb-4">No comments yet. Be the first to share your thoughts!</p>

          <v-divider class="my-4"></v-divider>

          <div v-if="isAuthenticated">
            <h4 class="text-subtitle-1 mb-2">Leave a comment</h4>
            <v-form @submit.prevent="submitComment">
              <v-textarea
                v-model="newComment"
                variant="outlined"
                rows="3"
                label="Your comment"
                hide-details
                class="mb-3"
              ></v-textarea>
              <v-btn type="submit" color="primary" :loading="submitting">Post Comment</v-btn>
            </v-form>
          </div>
          <v-alert v-else type="info" variant="tonal" class="mt-4">
            <router-link to="/login" class="text-decoration-none font-weight-bold">Log in</router-link> to leave a comment.
          </v-alert>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getBlogPost, createBlogComment, type BlogPost } from '@/api/blog';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const authStore = useAuthStore();

const post = ref<BlogPost | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const newComment = ref('');
const submitting = ref(false);

const isAuthenticated = computed(() => authStore.isAuthenticated);

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString();
}

function formatAuthor(author: string | { name?: string; fullName?: string; username?: string } | undefined) {
  if (typeof author === 'string') return author;
  return author?.name || author?.fullName || author?.username || 'Grizzly Author';
}

function getContent(content: string | { text?: string } | undefined) {
  if (!content) return '';
  return typeof content === 'string' ? content : (content.text || '');
}

async function loadPost() {
  const id = route.params.id as string;
  try {
    post.value = await getBlogPost(id);
  } catch (e) {
    console.error(e);
    error.value = 'Failed to load post';
  }
}

async function submitComment() {
  if (!newComment.value.trim() || !post.value || !authStore.user?.id) return;
  submitting.value = true;
  try {
    await createBlogComment({
      post_id: post.value.id,
      user_id: authStore.user.id,
      comment_text: newComment.value,
      user_name: authStore.userName
    });
    newComment.value = '';
    await loadPost(); // Reload to see new comment
  } catch (e) {
    console.error(e);
    alert('Failed to post comment');
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  await loadPost();
  loading.value = false;
});
</script>

<style scoped>
.whitespace-pre-wrap {
  white-space: pre-wrap;
}
</style>
