import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="hero-card">
      <p className="eyebrow">Private by link</p>
      <h1>Secure sharing for text and files</h1>
      <p className="hero-copy">
        Upload one item, set an expiry, and share a hard-to-guess link that only recipients can open.
      </p>
      <div className="hero-actions">
        {isAuthenticated ? (
          <Link to="/upload" className="btn btn-primary">Create Link</Link>
        ) : (
          <>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
            <Link to="/login" className="btn btn-secondary">I have an account</Link>
          </>
        )}
      </div>
    </section>
  );
}

export default HomePage;
