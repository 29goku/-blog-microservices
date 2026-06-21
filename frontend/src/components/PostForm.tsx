import { useState } from 'react';
import { postAPI } from '../api/client';
import './PostForm.css';

interface PostFormProps {
  onPostCreated: () => void;
  users: any[];
  currentUserId: number;
}

export default function PostForm({ onPostCreated, users, currentUserId }: PostFormProps) {
  const [formData, setFormData] = useState({
    userId: String(currentUserId),
    title: '',
    content: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId || !formData.title || !formData.content) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await postAPI.create({
        userId: Number(formData.userId),
        title: formData.title,
        content: formData.content,
        tags: formData.tags,
      });
      setFormData({ userId: '', title: '', content: '', tags: '' });
      onPostCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <h2>Create New Post</h2>
      {error && <div className="error">{error}</div>}

      <div className="form-group">
        <label htmlFor="userId">Author</label>
        <div className="author-display">
          {users.find((u) => u.id === currentUserId)?.username || `User ${currentUserId}`}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Post title"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="content">Content *</label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Post content"
          rows={5}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags (comma-separated)</label>
        <input
          id="tags"
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="e.g., react, typescript, web"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Publishing...' : 'Publish Post'}
      </button>
    </form>
  );
}

const style = document.createElement('style');
style.textContent = `
.author-display {
  padding: 0.75rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-weight: 500;
  color: #333;
}
`;
