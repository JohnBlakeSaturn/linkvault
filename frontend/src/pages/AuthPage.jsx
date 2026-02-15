import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useReveal } from '../hooks/useReveal';
import LogoLoader from '../components/LogoLoader';
import { useToast } from '../context/ToastContext';

function sanitizeName(value) {
  return value.replace(/[^\w\s'.-]/g, '').replace(/\s+/g, ' ').slice(0, 80);
}

function sanitizeEmail(value) {
  return value.replace(/\s+/g, '').toLowerCase();
}

function passwordScore(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password) && /\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score += 1;
  return Math.min(score, 4);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function AuthPage() {
  const revealRef = useReveal();
  const { user, login, register } = useAuth();
  const { addToast } = useToast();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, name: false, password: false });
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const score = useMemo(() => passwordScore(form.password), [form.password]);
  const scoreLabel = ['Very weak', 'Weak', 'Fair', 'Strong', 'Excellent'][score];
  const scoreWidth = `${(score / 4) * 100}%`;
  const scoreColor = ['bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-sky-500', 'bg-emerald-500'][score];
  const emailTrimmed = form.email.trim();
  const showEmailError = touched.email && emailTrimmed.length > 0 && !isValidEmail(emailTrimmed);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setFeedback('');
    setLoading(true);

    const payload = {
      name: sanitizeName(form.name).trim(),
      email: sanitizeEmail(form.email).trim(),
      password: form.password
    };

    if (!isValidEmail(payload.email)) {
      setError('Enter a valid email address');
      setLoading(false);
      return;
    }

    if (mode === 'register') {
      if (payload.name.length < 2) {
        setError('Name must be at least 2 characters');
        setLoading(false);
        return;
      }
      if (payload.password.length < 8) {
        setError('Password must be at least 8 characters');
        setLoading(false);
        return;
      }
    }

    try {
      if (mode === 'register') {
        await register(payload);
        addToast({ title: 'Account created', message: `Welcome, ${payload.name || 'there'}!`, type: 'success' });
        setFeedback('Registration successful. Redirecting to dashboard...');
      } else {
        await login({ email: payload.email, password: payload.password });
        addToast({ title: 'Welcome back', message: 'Login successful.', type: 'success' });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section ref={revealRef} className="mx-auto max-w-lg panel overflow-hidden p-0">
      <div className="border-b border-white/50 bg-white/45 p-6 dark:border-slate-700 dark:bg-slate-900/55">
        <div className="mb-4 inline-flex rounded-full bg-black/5 p-1 text-xs dark:bg-white/10">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setFeedback('');
            }}
            className={`btn-pop rounded-full px-3 py-1.5 font-semibold ${mode === 'login' ? 'bg-white text-slate-900 shadow dark:bg-slate-200' : 'muted'}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
              setFeedback('');
            }}
            className={`btn-pop rounded-full px-3 py-1.5 font-semibold ${
              mode === 'register' ? 'bg-white text-slate-900 shadow dark:bg-slate-200' : 'muted'
            }`}
          >
            Create account
          </button>
        </div>
        <h1 className="font-display text-3xl">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="muted mt-2 text-sm">Use your account to unlock advanced file-sharing options.</p>
      </div>

      <form onSubmit={submit} className="space-y-4 p-6">
        {mode === 'register' ? (
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider muted">Full name</span>
            <input
              type="text"
              required
              value={form.name}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              onChange={(e) => setForm((f) => ({ ...f, name: sanitizeName(e.target.value) }))}
              placeholder="John Blake"
              className="input-modern"
            />
          </label>
        ) : null}

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider muted">Email</span>
          <input
            type="email"
            required
            value={form.email}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            onChange={(e) => setForm((f) => ({ ...f, email: sanitizeEmail(e.target.value) }))}
            placeholder="you@example.com"
            data-invalid={showEmailError ? 'true' : 'false'}
            className="input-modern"
          />
          <p className={`mt-1 text-xs transition ${showEmailError ? 'text-rose-500' : 'muted'}`}>
            {showEmailError ? 'Please enter a valid email format.' : 'We use this for secure account login.'}
          </p>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider muted">Password</span>
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter password'}
            className="input-modern"
          />
        </label>

        {mode === 'register' ? (
          <div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/60">
              <div className={`h-full transition-all ${scoreColor}`} style={{ width: scoreWidth }} />
            </div>
            <p className="muted mt-1 text-xs">Password strength: {scoreLabel}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="btn-pop accent-bg w-full rounded-xl px-4 py-3 font-semibold transition disabled:opacity-60"
        >
          {loading ? <LogoLoader label="Please wait..." className="justify-center" /> : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        {error ? <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-500">{error}</p> : null}
        {feedback ? <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">{feedback}</p> : null}
      </form>
    </section>
  );
}
