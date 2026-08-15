import { useState, useEffect } from 'react';
import { postAPI, userAPI } from './api/client'; // v2
import PostList from './components/PostList';
import PostForm from './components/PostForm';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import LoginScreen from './components/LoginScreen';
import TagManager from './components/TagManager';
import { RequestFlowSidebar } from './components/RequestFlowSidebar';
import './App.css';

type View = 'posts' | 'users' | 'tags';

function App() {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [view, setView] = useState<View>('posts');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
    loadUsers();
  }, []);

  // Postgres doesn't guarantee row order, and an UPDATE (e.g. commentCount via
  // Kafka) can shift a row's position in an unordered scan. Sort by id so the
  // list order stays stable across refetches instead of visually reshuffling.
  const sortPosts = (data: any[]) => [...data].sort((a, b) => b.id - a.id);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postAPI.getAll();
      setPosts(sortPosts(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  // Refetches posts (e.g. for an updated Kafka-driven commentCount) without
  // toggling `loading`, so the post list doesn't unmount/collapse mid-view.
  const refreshPostsSilently = async () => {
    try {
      const data = await postAPI.getAll();
      setPosts(sortPosts(data));
    } catch (err) {
      console.error('Failed to refresh posts:', err);
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
            <button
              className={`nav-btn ${view === 'tags' ? 'active' : ''}`}
              onClick={() => setView('tags')}
            >
              Tags
            </button>
          </nav>
        </div>
        <div className="header-right">
          <span className="user-badge">👤 {currentUsername}</span>
          <button
            className="btn-theme-toggle"
            onClick={() => setDarkMode(d => !d)}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
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
                  onRefresh={refreshPostsSilently}
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

          {view === 'tags' && (
            <div className="section">
              <TagManager />
            </div>
          )}
        </main>

        <RequestFlowSidebar isVisible={sidebarVisible} onHide={() => setSidebarVisible(false)} />
      </div>

      {!sidebarVisible && (
        <button
          className="sidebar-reveal-btn"
          onClick={() => setSidebarVisible(true)}
          title="Show requests panel"
        >
          📊
        </button>
      )}
    </div>
  );
}

export default App;
