import { apiFetch, BLOG_API_URL } from './client';

export interface BlogPost {
  id: number;
  title: string;
  content: string | { text?: string };
  created_at?: string;
  author?: string | { name?: string; fullName?: string; username?: string };
  comments?: BlogComment[];
}

export interface BlogComment {
  post_id: number;
  user_id: number;
  comment_text: string;
  user_name?: string;
  user?: string | { name?: string };
  created_at?: string;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  return apiFetch<BlogPost[]>(`${BLOG_API_URL}/blog-posts`);
}

export async function getBlogPost(id: string | number): Promise<BlogPost> {
  return apiFetch<BlogPost>(`${BLOG_API_URL}/blog-posts/${id}`);
}

export async function createBlogComment(payload: BlogComment): Promise<unknown> {
  return apiFetch(`${BLOG_API_URL}/blog-comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}
