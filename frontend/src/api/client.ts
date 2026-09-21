// In production we deploy behind Vercel, which proxies `/api/*` to the
// Render-hosted API gateway via `vercel.json` rewrites. That keeps requests
// same-origin (no CORS) and avoids hard-coding the backend URL in the bundle.
// For local development, set VITE_API_URL=http://localhost:8080 in `.env.local`.
const BASE = import.meta.env.VITE_API_URL ?? '';

const API_BASE = {
  users: `${BASE}/api`,
  posts: `${BASE}/api`,
  comments: `${BASE}/api`,
  tags: `${BASE}/api`,
};

// Attaches the stored JWT (if any) so the gateway can authorize the request
// once it starts enforcing auth. Harmless to send on public routes today.
function authHeader(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Central place to react to an expired/invalid token: clear the stored
// session and send the user back to the login screen instead of leaving
// the app stuck on a generic fetch error with no way to recover.
// `skipOn401` is for the login call itself, where a 401 means "wrong
// password", not "session expired" — it must not trigger a reload.
function ensureOk(res: Response, message: string, opts?: { skipOn401?: boolean }) {
  if (res.status === 401 && !opts?.skipOn401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUserId');
    localStorage.removeItem('authUsername');
    window.location.reload();
    throw new Error('Session expired, please log in again');
  }
  if (!res.ok) throw new Error(message);
}

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
  commentCount: number;
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
    const res = await fetch(`${API_BASE.users}/users`, { headers: authHeader() });
    ensureOk(res, 'Failed to fetch users');
    return res.json();
  },
  getById: async (id: number): Promise<User> => {
    const res = await fetch(`${API_BASE.users}/users/${id}`, { headers: authHeader() });
    ensureOk(res, 'User not found');
    return res.json();
  },
  create: async (user: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const res = await fetch(`${API_BASE.users}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(user),
    });
    ensureOk(res, 'Failed to create user');
    return res.json();
  },
  update: async (id: number, user: Partial<User>): Promise<User> => {
    const res = await fetch(`${API_BASE.users}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(user),
    });
    ensureOk(res, 'Failed to update user');
    return res.json();
  },
  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE.users}/users/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    });
    ensureOk(res, 'Failed to delete user');
  },
};

// Auth API
export interface LoginResult {
  token: string;
  userId: number;
  username: string;
}

export const authAPI = {
  login: async (username: string, password: string): Promise<LoginResult> => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    ensureOk(res, 'Invalid username or password', { skipOn401: true });
    return res.json();
  },
};

// Post API
export const postAPI = {
  getAll: async (): Promise<Post[]> => {
    const res = await fetch(`${API_BASE.posts}/posts`, { headers: authHeader() });
    ensureOk(res, 'Failed to fetch posts');
    return res.json();
  },
  getById: async (id: number): Promise<Post> => {
    const res = await fetch(`${API_BASE.posts}/posts/${id}`, { headers: authHeader() });
    ensureOk(res, 'Post not found');
    return res.json();
  },
  getByUserId: async (userId: number): Promise<Post[]> => {
    const res = await fetch(`${API_BASE.posts}/posts/user/${userId}`, { headers: authHeader() });
    ensureOk(res, 'Failed to fetch user posts');
    return res.json();
  },
  search: async (title: string): Promise<Post[]> => {
    const res = await fetch(`${API_BASE.posts}/posts/search?title=${encodeURIComponent(title)}`, {
      headers: authHeader(),
    });
    ensureOk(res, 'Failed to search posts');
    return res.json();
  },
  create: async (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'commentCount'>): Promise<Post> => {
    const res = await fetch(`${API_BASE.posts}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(post),
    });
    ensureOk(res, 'Failed to create post');
    return res.json();
  },
  update: async (id: number, post: Partial<Post>): Promise<Post> => {
    const res = await fetch(`${API_BASE.posts}/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(post),
    });
    ensureOk(res, 'Failed to update post');
    return res.json();
  },
  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE.posts}/posts/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    });
    ensureOk(res, 'Failed to delete post');
  },
};

// Comment API
export const commentAPI = {
  getAll: async (): Promise<Comment[]> => {
    const res = await fetch(`${API_BASE.comments}/comments`, { headers: authHeader() });
    ensureOk(res, 'Failed to fetch comments');
    return res.json();
  },
  getById: async (id: number): Promise<Comment> => {
    const res = await fetch(`${API_BASE.comments}/comments/${id}`, { headers: authHeader() });
    ensureOk(res, 'Comment not found');
    return res.json();
  },
  getByPostId: async (postId: number): Promise<Comment[]> => {
    const res = await fetch(`${API_BASE.comments}/comments/post/${postId}`, { headers: authHeader() });
    ensureOk(res, 'Failed to fetch post comments');
    return res.json();
  },
  getByUserId: async (userId: number): Promise<Comment[]> => {
    const res = await fetch(`${API_BASE.comments}/comments/user/${userId}`, { headers: authHeader() });
    ensureOk(res, 'Failed to fetch user comments');
    return res.json();
  },
  create: async (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment> => {
    const res = await fetch(`${API_BASE.comments}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(comment),
    });
    ensureOk(res, 'Failed to create comment');
    return res.json();
  },
  update: async (id: number, comment: Partial<Comment>): Promise<Comment> => {
    const res = await fetch(`${API_BASE.comments}/comments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(comment),
    });
    ensureOk(res, 'Failed to update comment');
    return res.json();
  },
  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE.comments}/comments/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    });
    ensureOk(res, 'Failed to delete comment');
  },
};

export interface Tag {
  id: number;
  name: string;
  description: string;
  color: string;
}

// Tag API
export const tagAPI = {
  getAll: async (): Promise<Tag[]> => {
    const res = await fetch(`${API_BASE.tags}/tags`, { headers: authHeader() });
    ensureOk(res, 'Failed to fetch tags');
    return res.json();
  },
  getById: async (id: number): Promise<Tag> => {
    const res = await fetch(`${API_BASE.tags}/tags/${id}`, { headers: authHeader() });
    ensureOk(res, 'Tag not found');
    return res.json();
  },
  getByPostId: async (postId: number): Promise<Tag[]> => {
    const res = await fetch(`${API_BASE.tags}/tags/post/${postId}`, { headers: authHeader() });
    ensureOk(res, 'Failed to fetch tags for post');
    return res.json();
  },
  create: async (tag: Omit<Tag, 'id'>): Promise<Tag> => {
    const res = await fetch(`${API_BASE.tags}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(tag),
    });
    ensureOk(res, 'Failed to create tag');
    return res.json();
  },
  update: async (id: number, tag: Omit<Tag, 'id'>): Promise<Tag> => {
    const res = await fetch(`${API_BASE.tags}/tags/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(tag),
    });
    ensureOk(res, 'Failed to update tag');
    return res.json();
  },
  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE.tags}/tags/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    });
    ensureOk(res, 'Failed to delete tag');
  },
  assignToPost: async (postId: number, tagId: number): Promise<void> => {
    const res = await fetch(`${API_BASE.tags}/tags/assign?postId=${postId}&tagId=${tagId}`, {
      method: 'POST',
      headers: authHeader(),
    });
    ensureOk(res, 'Failed to assign tag to post');
  },
  removeFromPost: async (postId: number, tagId: number): Promise<void> => {
    const res = await fetch(`${API_BASE.tags}/tags/unassign?postId=${postId}&id=${tagId}`, {
      method: 'DELETE',
      headers: authHeader(),
    });
    ensureOk(res, 'Failed to remove tag from post');
  },
};

// Like/Dislike API
export const likeDislikeAPI = {
  getCount: async (postId: number): Promise<LikeDislikeCount> => {
    const res = await fetch(`${API_BASE.posts}/likedislike/count/${postId}`, { headers: authHeader() });
    ensureOk(res, 'Failed to fetch like/dislike count');
    return res.json();
  },
  toggle: async (userId: number, postId: number, type: 'LIKE' | 'DISLIKE'): Promise<void> => {
    const res = await fetch(`${API_BASE.posts}/likedislike`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ userId, postId, likeDislikeType: type }),
    });
    ensureOk(res, 'Failed to update like/dislike');
  },
};
