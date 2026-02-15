import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useReveal } from '../hooks/useReveal';

export default function DashboardPage() {
  const revealRef = useReveal();
  const { user, loading } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    api
      .myLinks()
      .then((data) => setItems(data.items))
      .catch((err) => setError(err.message || 'Failed to load links'));
  }, [user]);

  async function removeItem(id) {
    try {
      await api.deleteLink(id);
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  }

  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <section ref={revealRef} className="panel p-7 md:p-9">
      <h1 className="font-display text-3xl">My Vault Links</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Manage and manually delete links you created while authenticated.</p>

      {error ? <p className="mt-3 text-sm text-rose-500">{error}</p> : null}

      <div className="mt-7 space-y-3">
        {items.length === 0 ? <p className="text-sm text-slate-600 dark:text-slate-300">No links created yet.</p> : null}
        {items.map((item) => {
          const link = `${window.location.origin}/l/${item.token}`;
          return (
            <article key={item._id} className="rounded-2xl border border-slate-300/80 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <a href={link} className="text-sm font-semibold text-brand-700 underline dark:text-brand-200">
                  {link}
                </a>
                <button
                  type="button"
                  onClick={() => removeItem(item._id)}
                  className="rounded-lg border border-rose-400/60 px-3 py-1.5 text-xs font-semibold text-rose-600"
                >
                  Delete
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-300">
                <span>Type: {item.type}</span>
                <span>Views: {item.viewCount}</span>
                <span>Expires: {new Date(item.expiresAt).toLocaleString()}</span>
                {item.oneTimeView ? <span>One-time</span> : null}
                {item.maxViews ? <span>Max views: {item.maxViews}</span> : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
