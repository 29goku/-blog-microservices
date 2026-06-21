import { useState } from 'react';
import { userAPI } from '../api/client';
import './CreateUserForm.css';

interface CreateUserFormProps {
  onUserCreated?: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  bio: string;
}

export default function CreateUserForm({ onUserCreated, onCancel, compact = false }: CreateUserFormProps) {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    fullName: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { username, email, password, fullName } = formData;
    if (!username || !email || !password || !fullName) {
      setError('Username, email, password, and full name are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await userAPI.create({
        username,
        email,
        password,
        fullName,
        bio: formData.bio,
      });
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        bio: '',
      });
      onUserCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const className = compact ? 'create-user-form compact' : 'create-user-form';

  return (
    <form className={className} onSubmit={handleSubmit}>
      <h2>{compact ? 'Create User' : 'Create New User'}</h2>
      {error && <div className="error">{error}</div>}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="username">Username *</label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="username"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="password"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="fullName">Full Name *</label>
          <input
            id="fullName"
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Tell us about yourself..."
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating...' : 'Create User'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
