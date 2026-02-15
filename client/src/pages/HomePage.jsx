import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <section className="hero-card">
      <p className="eyebrow">Private by link</p>
      <h1>Secure sharing for text and files</h1>
      <p className="hero-copy">
        Upload one item, set an expiry, and share a hard-to-guess link that only recipients can open.
      </p>
      <div className="hero-actions">
        <Link to="/upload" className="btn btn-primary">Create Link</Link>
      </div>
    </section>
  );
}

export default HomePage;
