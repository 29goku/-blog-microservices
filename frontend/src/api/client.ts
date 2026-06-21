// In production we deploy behind Vercel, which proxies `/api/*` to the
// Render-hosted API gateway via `vercel.json` rewrites. That keeps requests
// same-origin (no CORS) and avoids hard-coding the backend URL in the bundle.
// For local development, set VITE_API_URL=http://localhost:8080 in `.env.local`.
const BASE = import.meta.env.VITE_API_URL ?? '';

const API_BASE = {
  users: `${BASE}/api`,
  posts: `${BASE}/api`,
  comments: `${BASE}/api`,
};

export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  fullName: string;
  bio: string;
  createdAt: number;
}

export interface Post {
  id: number;
  userId: number;
  title: string;
  content: string;
  tags: string;
  createdAt: number;
  updatedAt: number;
  user?: User;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: number;
  updatedAt: number;
  user?: User;
  post?: Post;
}

export interface LikeDislike {
  userId: number;
  postId: number;
  likeDislikeType: 'LIKE' | 'DISLIKE';
}

export interface LikeDislikeCount {
  postId: number;
  likeCount: number;
  dislikeCount: number;
}

// User API
export const userAPI = {
  getAll: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE.users}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },
  getById: async (id: number): Promise<User> => {
    const res = await fetch(`${API_BASE.users}/users/${id}`);
    if (!res.ok) throw new Error('User not found');
    return res.json();
  },
  create: async (user: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const res = await fetch(`${API_BASE.users}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error('Failed to create user');
    return res.json();
  },
  update: async (id: number, user: Partial<User>): Promise<User> => {
    const res = await fetch(`${API_BASE.users}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
  },
  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE.users}/users/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete user');
  },
};

// Post API
export const postAPI = {
  getAll: async (): Promise<Post[]> => {
    const res = await fetch(`${API_BASE.posts}/posts`);
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
  },
  getById: async (id: number): Promise<Post> => {
    const res = await fetch(`${API_BASE.posts}/posts/${id}`);
    if (!res.ok) throw new Error('Post not found');
    return res.json();
  },
  getByUserId: async (userId: number): Promise<Post[]> => {
    const res = await fetch(`${API_BASE.posts}/posts/user/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch user posts');
    return res.json();
  },
  search: async (title: string): Promise<Post[]> => {
    const res = await fetch(`${API_BASE.posts}/posts/search?title=${encodeURIComponent(title)}`);
    if (!res.ok) throw new Error('Failed to search posts');
    return res.json();
  },
  create: async (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> => {
    const res = await fetch(`${API_BASE.posts}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    if (!res.ok) throw new Error('Failed to create post');
    return res.json();
  },
  update: async (id: number, post: Partial<Post>): Promise<Post> => {
    const res = await fetch(`${API_BASE.posts}/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    if (!res.ok) throw new Error('Failed to update post');
    return res.json();
  },
  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE.posts}/posts/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete post');
  },
};

// Comment API
export const commentAPI = {
  getAll: async (): Promise<Comment[]> => {
    const res = await fetch(`${API_BASE.comments}/comments`);
    if (!res.ok) throw new Error('Failed to fetch comments');
    return res.json();
  },
  getById: async (id: number): Promise<Comment> => {
    const res = await fetch(`${API_BASE.comments}/comments/${id}`);
    if (!res.ok) throw new Error('Comment not found');
    return res.json();
  },
  getByPostId: async (postId: number): Promise<Comment[]> => {
    const res = await fetch(`${API_BASE.comments}/comments/post/${postId}`);
    if (!res.ok) throw new Error('Failed to fetch post comments');
    return res.json();
  },
  getByUserId: async (userId: number): Promise<Comment[]> => {
    const res = await fetch(`${API_BASE.comments}/comments/user/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch user comments');
    return res.json();
  },
  create: async (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment> => {
    const res = await fetch(`${API_BASE.comments}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment),
    });
    if (!res.ok) throw new Error('Failed to create comment');
    return res.json();
  },
  update: async (id: number, comment: Partial<Comment>): Promise<Comment> => {
    const res = await fetch(`${API_BASE.comments}/comments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment),
    });
    if (!res.ok) throw new Error('Failed to update comment');
    return res.json();
  },
  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE.comments}/comments/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete comment');
  },
};

// Like/Dislike API
export const likeDislikeAPI = {
  getCount: async (postId: number): Promise<LikeDislikeCount> => {
    const res = await fetch(`${API_BASE.posts}/likedislike/count/${postId}`);
    if (!res.ok) throw new Error('Failed to fetch like/dislike count');
    return res.json();
  },
  toggle: async (userId: number, postId: number, type: 'LIKE' | 'DISLIKE'): Promise<void> => {
    const res = await fetch(`${API_BASE.posts}/likedislike`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, postId, likeDislikeType: type }),
    });
    if (!res.ok) throw new Error('Failed to update like/dislike');
  },
};
