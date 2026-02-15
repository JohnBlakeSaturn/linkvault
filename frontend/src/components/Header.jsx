import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useSectionScroll } from '../hooks/useSectionScroll';
import { useToast } from '../context/ToastContext';
import NavbarBrand from './NavbarBrand';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { scrollToSection } = useSectionScroll();
  const { addToast } = useToast();

  return (
    <header className="sticky top-4 z-30 mx-auto w-full max-w-6xl px-4 md:px-8">
      <div className="flex items-center justify-between rounded-full border border-white/45 bg-white/55 px-5 py-3 shadow-sm backdrop-blur-lg dark:border-slate-700 dark:bg-slate-900/70">
        <Link to="/" aria-label="Link Vault home">
          <NavbarBrand />
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-slate-600 md:flex dark:text-slate-300">
          <button type="button" onClick={() => scrollToSection('features')} className="nav-link">
            Features
          </button>
          <button type="button" onClick={() => scrollToSection('create')} className="nav-link">
            Create
          </button>
          <button type="button" onClick={() => scrollToSection('testimonials')} className="nav-link">
            Stories
          </button>
        </nav>
        <ThemeToggle />
        {user ? (
          <div className="flex items-center gap-3 pl-2">
            <Link to="/dashboard" className="text-sm text-slate-600 transition hover:text-brand-700 dark:text-slate-300 dark:hover:text-brand-200">
              Dashboard
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
                addToast({ title: 'Logged out', message: 'You have been signed out safely.', type: 'info' });
                navigate('/');
              }}
              className="text-sm text-slate-600 underline-offset-4 transition hover:text-brand-700 hover:underline dark:text-slate-300 dark:hover:text-brand-200"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/auth" className="nav-link pl-2">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
