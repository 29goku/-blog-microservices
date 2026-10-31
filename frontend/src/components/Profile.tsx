import { useEffect, useState } from 'react';
import { userAPI, type User } from '../api/client';
import { useAvatar, AVATAR_UPDATED_EVENT } from '../hooks/useAvatar';
import './Profile.css';

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

interface ProfileProps {
  currentUserId: number;
}

export default function Profile({ currentUserId }: ProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const avatarSrc = useAvatar(currentUserId);

  useEffect(() => {
    loadUser();
  }, [currentUserId]);

  const loadUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userAPI.getById(currentUserId);
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPEG, PNG, WebP, or GIF images are allowed');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('Image must be 2MB or smaller');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const updated = await userAPI.uploadAvatar(currentUserId, file);
      setUser(updated);
      window.dispatchEvent(new Event(AVATAR_UPDATED_EVENT));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!user) {
    return error ? <div className="error">{error}</div> : null;
  }

  return (
    <div className="profile">
      <h2>Profile</h2>
      {error && <div className="error">{error}</div>}

      <div className="profile-card">
        <div className="profile-avatar">
          {avatarSrc ? (
            <img src={avatarSrc} alt={`${user.username}'s avatar`} />
          ) : (
            <div className="profile-avatar-placeholder">
              {user.username.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        <div className="profile-info">
          <div className="profile-name">{user.fullName}</div>
          <div className="profile-username">@{user.username}</div>
          {user.bio && <div className="profile-bio">{user.bio}</div>}
        </div>

        <label className="btn-primary profile-upload-btn">
          {uploading ? 'Uploading...' : 'Change avatar'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={uploading}
            hidden
          />
        </label>
      </div>
    </div>
  );
}
