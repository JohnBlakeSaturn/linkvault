import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

function ViewPage() {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/content/${id}/info`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load content');
        }

        setContent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  const fileSizeLabel = useMemo(() => {
    if (!content?.fileSize) return '';
    if (content.fileSize < 1024) return `${content.fileSize} bytes`;
    return `${(content.fileSize / 1024).toFixed(1)} KB`;
  }, [content]);

  const copyToClipboard = async () => {
    if (!content?.content) return;
    await navigator.clipboard.writeText(content.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return <section className="panel-card"><p>Loading content...</p></section>;
  }

  if (error) {
    const isInvalidOrExpired = error.toLowerCase().includes('invalid or expired link');

    return (
      <section className="panel-card">
        <p className="status error">
          {isInvalidOrExpired ? 'This link is invalid or has already expired.' : error}
        </p>
        <Link to="/" className="btn btn-secondary">Back to home</Link>
      </section>
    );
  }

  return (
    <section className="panel-card">
      <h1>Shared content</h1>
      <p className="panel-subtitle">Expires: {new Date(content.expiresAt).toLocaleString()}</p>

      {content.type === 'text' ? (
        <>
          <pre className="text-preview">{content.content}</pre>
          <button onClick={copyToClipboard} className="btn btn-primary" type="button">
            {copied ? 'Copied' : 'Copy text'}
          </button>
        </>
      ) : (
        <div className="file-panel">
          <p className="file-name">{content.fileName}</p>
          <p className="file-size">{fileSizeLabel}</p>
          <a href={`/api/content/${id}`} className="btn btn-primary" download>
            Download file
          </a>
        </div>
      )}

      <Link to="/upload" className="btn btn-secondary">Create another link</Link>
    </section>
  );
}

export default ViewPage;
