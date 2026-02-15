import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const themeLabel = useMemo(() => (theme === 'dark' ? 'Light mode' : 'Dark mode'), [theme]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">LinkVault</Link>
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
          aria-label={themeLabel}
        >
          {themeLabel}
        </button>
      </header>

      <main className="page-wrap">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/content/:id" element={<ViewPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
