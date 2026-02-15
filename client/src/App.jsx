import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UploadPage from './pages/UploadPage';
import ViewPage from './pages/ViewPage';

const THEME_KEY = 'linkvault_theme';

function getInitialTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const { user, isAuthenticated, logout, authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const themeLabel = useMemo(() => (theme === 'dark' ? 'Light mode' : 'Dark mode'), [theme]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">LinkVault</Link>

        <nav className="nav-actions">
          <Link to="/" className="btn btn-secondary">Home</Link>
          <Link to="/upload" className="btn btn-secondary">Upload</Link>

          {authLoading ? null : isAuthenticated ? (
            <>
              <span className="user-pill">{user.name}</span>
              <button type="button" className="btn btn-secondary" onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">Sign in</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}

          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            aria-label={themeLabel}
          >
            {themeLabel}
          </button>
        </nav>
      </header>

      <main className="page-wrap">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/upload"
            element={(
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            )}
          />
          <Route path="/content/:id" element={<ViewPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
