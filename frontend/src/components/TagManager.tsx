import { useState, useEffect } from 'react';
import { tagAPI, type Tag } from '../api/client';
import './TagManager.css';

export default function TagManager() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', color: '#3b82f6' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tagAPI.getAll();
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await tagAPI.create(form);
      setForm({ name: '', description: '', color: '#3b82f6' });
      await loadTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this tag?')) return;
    try {
      await tagAPI.delete(id);
      await loadTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tag');
    }
  };

  return (
    <div className="tag-manager">
      <form className="tag-form" onSubmit={handleCreate}>
        <h2>Create Tag</h2>
        {error && <div className="error">{error}</div>}
        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Tag name"
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Optional description"
          />
        </div>
        <div className="form-group form-group-color">
          <label>Color</label>
          <input
            type="color"
            value={form.color}
            onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
          />
          <span className="color-value">{form.color}</span>
        </div>
        <button type="submit" className="btn-primary" disabled={creating}>
          {creating ? 'Creating...' : 'Create Tag'}
        </button>
      </form>

      <div className="tag-list-section">
        <h2>All Tags</h2>
        {loading ? (
          <div className="loading">Loading tags...</div>
        ) : tags.length === 0 ? (
          <p className="empty">No tags yet. Create one!</p>
        ) : (
          <div className="tag-grid">
            {tags.map(tag => (
              <div key={tag.id} className="tag-card">
                <span className="tag-dot" style={{ backgroundColor: tag.color }} />
                <div className="tag-info">
                  <strong>{tag.name}</strong>
                  {tag.description && <p>{tag.description}</p>}
                </div>
                <button className="btn-delete" onClick={() => handleDelete(tag.id)} title="Delete tag">
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
