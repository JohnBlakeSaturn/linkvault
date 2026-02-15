import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="mx-auto max-w-2xl panel p-8 text-center md:p-10">
      <p className="accent-text text-xs font-semibold uppercase tracking-[0.2em]">404</p>
      <h1 className="mt-2 font-display text-4xl">Page not found</h1>
      <p className="muted mt-3 text-sm">The page you requested does not exist or may have moved.</p>
      <Link to="/" className="btn-pop accent-bg mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold">
        Back to Home
      </Link>
    </section>
  );
}
