import { useState } from 'react';
import { authAPI } from '../api/client';
import CreateUserForm from './CreateUserForm';
import './LoginScreen.css';

interface LoginScreenProps {
  onLogin: (userId: number, username: string, token: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [justCreated, setJustCreated] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter your username and password');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { token, userId, username: loggedInUsername } = await authAPI.login(username, password);
      onLogin(userId, loggedInUsername, token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUserCreated = () => {
    setShowCreateForm(false);
    setJustCreated(true);
    setPassword('');
  };

  if (showCreateForm) {
    return (
      <div className="login-screen">
        <div className="login-card create-user-wrapper">
          <h1>Blog Platform</h1>
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
        <h1>Blog Platform</h1>
        <p className="welcome-text">Welcome back! Sign in to continue</p>

        <form onSubmit={handleLogin}>
          {error && <div className="error">{error}</div>}
          {justCreated && !error && (
            <div className="success">Account created — sign in below</div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="btn-create-link"
        >
          Or create a new user
        </button>
      </div>
    </div>
  );
}
