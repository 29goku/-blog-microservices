import { useState, useEffect } from 'react';
import { postAPI, tagAPI, type Tag } from '../api/client';
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
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  useEffect(() => {
    tagAPI.getAll().then(setAvailableTags).catch(() => {});
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleTag = (id: number) => {
    setSelectedTagIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
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
      const post = await postAPI.create({
        userId: Number(formData.userId),
        title: formData.title,
        content: formData.content,
        tags: formData.tags,
      });
      await Promise.all(
        selectedTagIds.map(tagId => tagAPI.assignToPost(post.id, tagId).catch(() => {}))
      );
      setFormData({ userId: '', title: '', content: '', tags: '' });
      setSelectedTagIds([]);
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

      {availableTags.length > 0 && (
        <div className="form-group">
          <label>Tags</label>
          <div className="tag-picker">
            {availableTags.map(tag => (
              <button
                key={tag.id}
                type="button"
                className={`tag-pill${selectedTagIds.includes(tag.id) ? ' selected' : ''}`}
                style={{ '--tag-color': tag.color } as React.CSSProperties}
                onClick={() => toggleTag(tag.id)}
              >
                <span className="tag-pill-dot" />
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

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
