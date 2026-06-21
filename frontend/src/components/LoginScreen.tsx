import { useState, useEffect } from 'react';
import { userAPI } from '../api/client';
import CreateUserForm from './CreateUserForm';
import './LoginScreen.css';

interface LoginScreenProps {
  onLogin: (userId: number, username: string) => void;
}

interface User {
  id: number;
  username: string;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userAPI.getAll();
      setUsers(data);
      if (data.length > 0) {
        setSelectedUserId(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId === '') {
      setError('Please select a user');
      return;
    }
    const user = users.find((u) => u.id === selectedUserId);
    if (user) {
      onLogin(user.id, user.username);
    }
  };

  const handleUserCreated = async () => {
    setShowCreateForm(false);
    await loadUsers();
  };

  if (loading) {
    return <div className="login-screen loading">Loading users...</div>;
  }

  if (showCreateForm) {
    return (
      <div className="login-screen">
        <div className="login-card create-user-wrapper">
          <h1>📝 Blog Platform</h1>
          <CreateUserForm
            onUserCreated={handleUserCreated}
            onCancel={() => setShowCreateForm(false)}
            compact
          />
        </div>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>📝 Blog Platform</h1>
        <p className="welcome-text">Welcome! Select a user to continue</p>

        <form onSubmit={handleLogin}>
          {error && <div className="error">{error}</div>}

          <div className="form-group">
            <label htmlFor="user-select">Select User</label>
            <select
              id="user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
            >
              <option value="">-- Choose a user --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-login">
            Login
          </button>
        </form>

        {users.length === 0 ? (
          <div className="no-users-section">
            <p className="no-users">No users found yet.</p>
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="btn-create-link"
            >
              Create one now →
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="btn-create-link"
          >
            Or create a new user
          </button>
        )}
      </div>
    </div>
  );
}
