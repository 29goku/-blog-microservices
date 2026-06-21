import { useState, useEffect } from 'react';
import { postAPI, userAPI } from './api/client';
import PostList from './components/PostList';
import PostForm from './components/PostForm';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import LoginScreen from './components/LoginScreen';
import { RequestFlowSidebar } from './components/RequestFlowSidebar';
import './App.css';

type View = 'posts' | 'users';

function App() {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [view, setView] = useState<View>('posts');
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
    loadUsers();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postAPI.getAll();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await userAPI.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handlePostCreated = async () => {
    await loadPosts();
  };

  const handlePostDeleted = async () => {
    await loadPosts();
  };

  const handleUserCreated = async () => {
    await loadUsers();
  };

  const handleUserDeleted = async () => {
    await loadUsers();
  };

  const handleLogin = (userId: number, username: string) => {
    setCurrentUserId(userId);
    setCurrentUsername(username);
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    setCurrentUsername(null);
  };

  if (!currentUserId) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1>📝 Blog Platform</h1>
          <nav className="nav">
            <button
              className={`nav-btn ${view === 'posts' ? 'active' : ''}`}
              onClick={() => setView('posts')}
            >
              Posts
            </button>
            <button
              className={`nav-btn ${view === 'users' ? 'active' : ''}`}
              onClick={() => setView('users')}
            >
              Users
            </button>
          </nav>
        </div>
        <div className="header-right">
          <span className="user-badge">👤 {currentUsername}</span>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="app-with-sidebar">
        <main className="main">
          {error && <div className="error">{error}</div>}

          {view === 'posts' && (
            <div className="section">
              <PostForm onPostCreated={handlePostCreated} users={users} currentUserId={currentUserId} />
              {loading ? (
                <div className="loading">Loading posts...</div>
              ) : (
                <PostList
                  posts={posts}
                  users={users}
                  onPostDeleted={handlePostDeleted}
                  onRefresh={loadPosts}
                  currentUserId={currentUserId}
                />
              )}
            </div>
          )}

          {view === 'users' && (
            <div className="section">
              <UserForm onUserCreated={handleUserCreated} />
              <UserList
                users={users}
                onUserDeleted={handleUserDeleted}
                onRefresh={loadUsers}
              />
            </div>
          )}
        </main>

        <RequestFlowSidebar />
      </div>
    </div>
  );
}

export default App;
