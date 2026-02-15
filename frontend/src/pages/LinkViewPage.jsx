import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE } from '../utils/constants';
import { api } from '../api/client';
import { useReveal } from '../hooks/useReveal';
import LogoLoader from '../components/LogoLoader';

export default function LinkViewPage() {
  const revealRef = useReveal();
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [opened, setOpened] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function resolve(providedPassword) {
    setLoading(true);
    setError('');

    try {
      const response = await api.resolveLink(token, providedPassword || undefined);
      setData(response);
      setNeedsPassword(false);
      setOpened(true);
    } catch (err) {
      setData(null);
      if (err.code === 'PASSWORD_REQUIRED') {
        setNeedsPassword(true);
        setError('This link is password protected.');
      } else {
        setError(err.message || 'Could not resolve link');
      }
    } finally {
      setLoading(false);
    }
  }

  async function downloadFile() {
    if (!data || data.type !== 'file') return;
    setDownloading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/links/${token}/download`, {
        credentials: 'include',
        headers: password ? { 'x-link-password': password } : {}
      });

      if (!response.ok) {
        let message = 'Download failed';
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const payload = await response.json();
          message = payload?.message || message;
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = data.fileName || 'download';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section ref={revealRef} className="mx-auto max-w-3xl panel p-7 md:p-9">
      <h1 className="font-display text-3xl">Secure Link Access</h1>
      <p className="muted mt-2 text-sm">Access your text/file below!</p>

      {!opened && !needsPassword ? (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => resolve()}
            disabled={loading}
            className="btn-pop accent-bg rounded-xl px-4 py-2 font-semibold transition disabled:opacity-60"
          >
            {loading ? <LogoLoader label="Opening..." className="justify-center" /> : 'Open link'}
          </button>
        </div>
      ) : null}

      {needsPassword ? (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter link password"
            className="input-modern flex-1"
          />
          <button
            type="button"
            onClick={() => resolve(password)}
            disabled={loading || !password.trim()}
            className="btn-pop accent-bg rounded-xl px-4 py-2 font-semibold transition disabled:opacity-60"
          >
            {loading ? <LogoLoader label="Unlocking..." className="justify-center" /> : 'Unlock link'}
          </button>
        </div>
      ) : null}

      {!needsPassword && loading ? <p className="mt-4 text-sm muted">Opening secure link...</p> : null}
      {error ? <p className="mt-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-500">{error}</p> : null}

      {data?.type === 'text' ? (
        <article className="mt-6 rounded-2xl border border-slate-300/80 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
          <p className="text-xs uppercase tracking-wider text-slate-500">Text content</p>
          <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-7">{data.text}</pre>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(data.text)}
            className="btn-pop accent-border mt-4 rounded-lg border px-3 py-1.5 text-sm font-medium"
          >
            Copy text
          </button>
        </article>
      ) : null}

      {data?.type === 'file' ? (
        <article className="mt-6 rounded-2xl border border-slate-300/80 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
          <p className="text-sm">
            File: <span className="font-semibold">{data.fileName}</span>
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300">Size: {(data.size / 1024).toFixed(1)} KB</p>
          <button
            type="button"
            onClick={downloadFile}
            disabled={downloading}
            className="btn-pop accent-bg mt-4 inline-block rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {downloading ? 'Downloading...' : 'Download file'}
          </button>
        </article>
      ) : null}
    </section>
  );
}
