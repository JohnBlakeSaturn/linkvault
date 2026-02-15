import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSectionScroll } from '../hooks/useSectionScroll';
import LogoLoader from '../components/LogoLoader';
import { useToast } from '../context/ToastContext';

gsap.registerPlugin(ScrollTrigger);

function toDatetimeLocalValue(date) {
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

const featureCards = [
  { title: 'Private link-only access', text: 'Nothing is listed publicly. Exact tokens only.' },
  { title: 'Expiry-first by default', text: 'Anonymous users get secure default text sharing in 10 minutes.' },
  { title: 'Advanced controls for members', text: 'Sign in for file sharing, passwords, one-time links, and max-view limits.' }
];

const testimonials = [
  { name: 'Ananya R.', role: 'QA Lead', quote: 'Temporary secure links reduced accidental exposure in our test reports.', tone: 'from-sky-400 to-blue-500' },
  { name: 'Marcus T.', role: 'Freelance Designer', quote: 'The flow is smooth and the links feel safer than attachment chains.', tone: 'from-indigo-400 to-violet-500' },
  { name: 'Ritu S.', role: 'Student Developer', quote: 'Default quick-share is fast, and login unlocks the power options.', tone: 'from-cyan-400 to-sky-500' }
];

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function HomePage() {
  const rootRef = useRef(null);
  const modalRef = useRef(null);
  const setupRef = useRef(null);
  const { user } = useAuth();
  const { addToast } = useToast();
  const { scrollToSection } = useSectionScroll();
  const [mode, setMode] = useState('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [oneTimeView, setOneTimeView] = useState(false);
  const [maxViews, setMaxViews] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [defaultExpiry] = useState(() => toDatetimeLocalValue(new Date(Date.now() + 10 * 60 * 1000)));
  const [expiry, setExpiry] = useState(defaultExpiry);

  const minExpiry = useMemo(() => toDatetimeLocalValue(new Date(Date.now() + 60 * 1000)), []);
  const isGuest = !user;
  const isCustomExpiry = expiry !== defaultExpiry;
  const hasCustomOptions = Boolean(password.trim() || oneTimeView || maxViews.trim() || isCustomExpiry);
  const activeChecklistCount = [
    mode === 'text' ? Boolean(text.trim()) : Boolean(file),
    Boolean(password.trim()),
    oneTimeView,
    Boolean(maxViews.trim()),
    !isGuest && isCustomExpiry
  ].filter(Boolean).length;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-hero-intro]', { y: 28, opacity: 0, duration: 0.9, ease: 'power2.out' });
      gsap.to('[data-hero-title]', {
        backgroundPositionX: '220%',
        ease: 'none',
        duration: 8,
        repeat: -1
      });
      gsap.utils.toArray('[data-scroll-card]').forEach((card) => {
        gsap.from(card, {
          y: 24,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: card, start: 'top 82%' }
        });
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!showAuthModal || !modalRef.current) return;
    gsap.fromTo(
      modalRef.current,
      { opacity: 0, y: 16, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: 'power2.out' }
    );
  }, [showAuthModal]);

  useEffect(() => {
    document.body.style.overflow = showAuthModal ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAuthModal]);

  useEffect(() => {
    if (!setupRef.current) return;
    gsap.fromTo(
      setupRef.current,
      { strokeDashoffset: 220 },
      { strokeDashoffset: 220 - activeChecklistCount * 40, duration: 0.45, ease: 'power2.out' }
    );
  }, [activeChecklistCount]);

  function requestAuth() {
    setShowAuthModal(true);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isGuest && (mode === 'file' || hasCustomOptions)) {
        setShowAuthModal(true);
        return;
      }

      const form = new FormData();
      if (mode === 'text') form.append('text', text);
      if (mode === 'file' && file) form.append('file', file);
      if (password) form.append('password', password);
      if (!isGuest && expiry) form.append('expiresAt', new Date(expiry).toISOString());
      if (oneTimeView) form.append('oneTimeView', 'true');
      if (maxViews && !oneTimeView) form.append('maxViews', maxViews);

      const data = await api.createLink(form);
      setResult(data);
      addToast({ title: 'Secure link ready', message: 'Share it safely.', type: 'success' });
    } catch (err) {
      setError(err.message || 'Upload failed');
      if (err.status === 401) setShowAuthModal(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={rootRef} className="space-y-14 pb-10 md:space-y-20">
      <section className="panel relative overflow-hidden p-8 md:p-12">
        <div className="absolute -right-16 top-6 h-56 w-56 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute -left-10 bottom-2 h-44 w-44 rounded-full bg-sky-300/20 blur-3xl" />
        <svg className="pookie-heart pookie-heart-a" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21s-7.5-4.7-9.5-9.1C1 8.8 2.9 5.5 6.1 5.2c2-.2 3.1.8 3.9 2 1-1.6 2.8-2.6 4.8-2 3.2 1 4.6 4.8 2.8 7.9C15.9 16.6 12 21 12 21z" />
        </svg>
        <svg className="pookie-heart pookie-heart-b" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21s-7.5-4.7-9.5-9.1C1 8.8 2.9 5.5 6.1 5.2c2-.2 3.1.8 3.9 2 1-1.6 2.8-2.6 4.8-2 3.2 1 4.6 4.8 2.8 7.9C15.9 16.6 12 21 12 21z" />
        </svg>
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div data-hero-intro>
            <p className="accent-soft-bg accent-border accent-text mb-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              Secure sharing workspace
            </p>
            <h1 data-hero-title className="hero-title font-display text-4xl leading-tight md:text-6xl">
              One link. Tight access. Built to expire.
            </h1>
            <p className="muted mt-5 max-w-2xl text-sm leading-7 md:text-base">
              Anonymous mode is intentionally minimal and safe: quick text-only sharing with default expiry. Sign in to unlock advanced controls.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm">
              <button
                type="button"
                onClick={() => scrollToSection('create')}
                className="btn-pop accent-bg rounded-full px-5 py-2.5 font-semibold transition"
              >
                Start sharing
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('features')}
                className="btn-pop accent-border accent-text rounded-full border px-5 py-2.5 font-medium"
              >
                Explore features
              </button>
            </div>
          </div>
          <article data-hero-intro className="interactive-card rounded-3xl border border-white/60 bg-white/60 p-6 shadow-panel backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
            <p className="accent-text text-xs uppercase tracking-widest">Current build includes</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>Secure text/file sharing with expiring links</li>
              <li>Password, one-time, and max-view controls</li>
              <li>Passport local auth with user dashboard</li>
              <li>Scheduled cleanup + hardened API middleware</li>
            </ul>
          </article>
        </div>
      </section>

      <section id="features" className="space-y-4">
        <p className="accent-text text-xs font-semibold uppercase tracking-[0.2em]">What we made so far</p>
        <div className="grid gap-4 md:grid-cols-3">
          {featureCards.map((card) => (
            <article key={card.title} data-scroll-card className="panel interactive-card p-6">
              <h2 className="font-display text-2xl">{card.title}</h2>
              <p className="muted mt-3 text-sm leading-6">{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="create" data-scroll-card className="panel grid gap-8 p-6 md:p-8 lg:grid-cols-[0.9fr_1.1fr]">
        <article>
          <h2 className="font-display text-3xl">Create a secure link</h2>
          <p className="muted mt-3 text-sm leading-6">
            Guest mode: text + default expiry only. File sharing and custom options require authentication.
          </p>
          <div className="mt-5 rounded-2xl border border-white/60 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-900/65">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 80 80" className="accent-text h-12 w-12">
                <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="8" />
                <circle
                  ref={setupRef}
                  cx="40"
                  cy="40"
                  r="30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="220"
                  strokeDashoffset="220"
                  transform="rotate(-90 40 40)"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold">Live share blueprint</p>
                <p className="muted text-xs">Updates as you configure options on the right.</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li className={`check-item ${mode === 'text' ? (text.trim() ? 'active' : '') : file ? 'active' : ''}`}>
                {mode === 'text' ? (text.trim() ? `Text ready (${text.trim().length} chars)` : 'Add text payload') : file ? `File ready (${file.name})` : 'Attach a file'}
              </li>
              <li className={`check-item ${password.trim() ? 'active' : ''}`}>{password.trim() ? 'Password protection enabled' : 'Password protection off'}</li>
              <li className={`check-item ${oneTimeView ? 'active' : ''}`}>{oneTimeView ? 'One-time view enabled' : 'One-time view off'}</li>
              <li className={`check-item ${maxViews.trim() ? 'active' : ''}`}>{maxViews.trim() ? `Max views set: ${maxViews}` : 'No view cap set'}</li>
              <li className={`check-item ${!isGuest && isCustomExpiry ? 'active' : ''}`}>{!isGuest && isCustomExpiry ? 'Custom expiry configured' : 'Default expiry (10 min)'}</li>
            </ul>
          </div>
          {isGuest ? (
            <button
              type="button"
              onClick={requestAuth}
              className="btn-pop accent-border accent-soft-bg accent-text mt-4 rounded-full border px-4 py-2 text-sm font-semibold"
            >
              Unlock all features
            </button>
          ) : null}
        </article>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="flex gap-2 rounded-full bg-black/5 p-1 dark:bg-white/10">
            <button
              type="button"
              onClick={() => setMode('text')}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${
                mode === 'text' ? 'bg-white text-ink shadow dark:bg-brand-100' : ''
              }`}
            >
              Text
            </button>
            <button
              type="button"
              onClick={() => {
                if (isGuest) return requestAuth();
                setMode('file');
              }}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${mode === 'file' ? 'bg-white text-ink shadow dark:bg-brand-100' : ''} ${isGuest ? 'opacity-80' : ''}`}
            >
              File
            </button>
          </div>

          {mode === 'text' ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={7}
              maxLength={100000}
              required
              className="input-modern min-h-44 p-4"
              placeholder="Paste your text"
            />
          ) : (
            <label className="block rounded-2xl border border-dashed border-slate-300 bg-white/65 p-4 dark:border-slate-700 dark:bg-slate-900/75">
              <input type="file" required onChange={(e) => setFile(e.target.files?.[0] || null)} className="sr-only" />
              <span className="btn-pop accent-bg inline-flex cursor-pointer items-center rounded-xl px-3.5 py-2 text-sm font-semibold">
                Choose file
              </span>
              <span className="ml-3 text-sm muted">{file ? file.name : 'No file selected'}</span>
            </label>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block muted">Expiry (default 10 min for guest users)</span>
              <input
                type="datetime-local"
                value={expiry}
                min={minExpiry}
                readOnly={isGuest}
                onFocus={() => {
                  if (isGuest) requestAuth();
                }}
                onChange={(e) => {
                  if (isGuest) return requestAuth();
                  setExpiry(e.target.value);
                }}
                className="input-modern input-modern-date"
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block muted">Link password (optional)</span>
              <input
                type="password"
                value={password}
                readOnly={isGuest}
                onFocus={() => {
                  if (isGuest) requestAuth();
                }}
                onChange={(e) => {
                  if (isGuest) return requestAuth();
                  setPassword(e.target.value);
                }}
                className="input-modern"
                placeholder="Protect access"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2 rounded-xl border border-slate-300/80 bg-white/70 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80">
              <input
                type="checkbox"
                checked={oneTimeView}
                onClick={() => {
                  if (isGuest) requestAuth();
                }}
                onChange={(e) => {
                  if (isGuest) return requestAuth();
                  setOneTimeView(e.target.checked);
                }}
              />
              One-time view
            </label>

            <label className="text-sm">
              <span className="mb-1 block muted">Max views (optional)</span>
              <input
                type="number"
                min="1"
                max="10000"
                readOnly={isGuest}
                disabled={oneTimeView}
                value={maxViews}
                onFocus={() => {
                  if (isGuest) requestAuth();
                }}
                onChange={(e) => {
                  if (isGuest) return requestAuth();
                  setMaxViews(e.target.value);
                }}
                className="input-modern disabled:opacity-50"
                placeholder="e.g. 5"
              />
            </label>
          </div>

            <button
              type="submit"
              disabled={loading || (mode === 'text' ? !text.trim() : !file)}
            className="btn-pop accent-bg w-full rounded-xl px-4 py-3 font-semibold transition disabled:opacity-60"
          >
            {loading ? <LogoLoader label="Creating secure link..." className="justify-center" /> : 'Generate share link'}
          </button>

          {error ? <p className="text-sm text-rose-500">{error}</p> : null}

          {result ? (
            <div className="accent-border accent-soft-bg rounded-2xl border p-4 text-sm">
              <p className="font-semibold">Share link created</p>
              <a href={result.frontendUrl} className="accent-text mt-2 block break-all underline">
                {result.frontendUrl}
              </a>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(result.frontendUrl);
                  addToast({ title: 'Copied', message: 'Link copied to clipboard.', type: 'info' });
                }}
                className="btn-pop accent-border mt-3 rounded-lg border px-3 py-1.5 font-medium"
              >
                Copy link
              </button>
            </div>
          ) : null}
        </form>
      </section>

      <section id="testimonials" className="space-y-4">
        <p className="accent-text text-xs font-semibold uppercase tracking-[0.2em]">Dummy testimonials</p>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} data-scroll-card className="panel interactive-card p-6">
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${item.tone} text-sm font-semibold text-white`}>
                {initials(item.name)}
              </div>
              <p className="text-sm leading-7">"{item.quote}"</p>
              <p className="mt-5 font-semibold">{item.name}</p>
              <p className="muted text-xs">{item.role}</p>
            </article>
          ))}
        </div>
      </section>

      {showAuthModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-md">
          <div ref={modalRef} className="panel w-full max-w-md p-0">
            <div className="border-b border-white/45 bg-white/45 p-6 dark:border-slate-700 dark:bg-slate-900/55">
              <h3 className="font-display text-2xl">Sign in to continue</h3>
              <p className="muted mt-2 text-sm">
                This control is available for registered users. Quick text sharing still works without signing in.
              </p>
            </div>
            <div className="p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <Link to="/auth" className="btn-pop accent-bg rounded-xl px-4 py-2.5 text-center text-sm font-semibold">
                  Go to Sign in
                </Link>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="btn-pop rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  Continue as guest
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
