import { ref } from 'vue';
import { getBlogPosts, type BlogPost } from '@/api/blog';

export function useBlog() {
  const posts = ref<BlogPost[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchPosts() {
    loading.value = true;
    error.value = null;
    try {
      posts.value = await getBlogPosts();
    } catch (e) {
      error.value = 'Failed to load blog posts';
      console.error(e);
    } finally {
      loading.value = false;
    }
  }

  return {
    posts,
    loading,
    error,
    fetchPosts
  };
}
