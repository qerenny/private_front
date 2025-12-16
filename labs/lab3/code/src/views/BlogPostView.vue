<template>
  <div class="container py-5">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else-if="post" id="blogPost">
       <div class="card border-0 shadow-sm mb-5">
         <div class="card-body p-4">
           <span class="card-tag mb-2 d-inline-block">{{ formatDate(post.created_at) }}</span>
           <h2 class="section-title mb-1">{{ post.title }}</h2>
           <p class="text-muted mb-4">{{ formatAuthor(post.author) }}</p>
           <div class="blog-content">
              <p>{{ getContent(post.content) }}</p>
           </div>
         </div>
       </div>

       <!-- Comments -->
       <div class="card border-0 shadow-sm">
         <div class="card-body p-4">
           <h4 class="fw-bold mb-4">Comments</h4>
           <div id="commentsList" class="mb-4">
              <div v-if="post.comments && post.comments.length">
                 <div v-for="(c, idx) in post.comments" :key="idx" class="comment-box mb-2 p-3 bg-light rounded">
                   <div class="d-flex justify-content-between align-items-center mb-1">
                      <strong>{{ formatAuthor(c.user_name || c.user) }}</strong>
                      <small class="text-muted">{{ formatDate(c.created_at) }}</small>
                   </div>
                   <p class="mb-0">{{ c.comment_text }}</p>
                 </div>
              </div>
              <p v-else class="text-muted">No comments yet.</p>
           </div>

           <div v-if="isAuthenticated">
             <form @submit.prevent="submitComment" id="commentForm">
               <div v-if="commentError" class="alert alert-danger">{{ commentError }}</div>
               <div class="mb-3">
                 <label for="comment_text" class="form-label">Leave a comment</label>
                 <textarea v-model="newComment" class="form-control" id="comment_text" rows="3" required></textarea>
               </div>
               <button type="submit" class="btn btn-brand-primary" :disabled="submitting">
                 <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                 Post Comment
               </button>
             </form>
           </div>
           <div v-else class="alert alert-info">
              Please <router-link to="/login">login</router-link> to leave a comment.
           </div>
         </div>
       </div>

       <div class="mt-4">
          <router-link to="/blog" class="btn btn-outline-secondary">Back to Blog</router-link>
       </div>
    </div>
  </div>
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
const commentError = ref<string | null>(null);

const isAuthenticated = computed(() => authStore.isAuthenticated);

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString();
}

function formatAuthor(author: string | { name?: string; fullName?: string; username?: string } | undefined) {
  if (typeof author === 'string') return author;
  return author?.name || author?.fullName || author?.username || 'Grizzly Coach';
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
  commentError.value = null;
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
    commentError.value = 'Failed to post comment';
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  await loadPost();
  loading.value = false;
});
</script>
