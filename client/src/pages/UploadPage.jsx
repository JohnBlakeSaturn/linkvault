import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const MAX_TEXT_LENGTH = 100000;

function UploadPage() {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const normalizedText = useMemo(() => text.trim(), [text]);
  const isDisabled = useMemo(() => loading || (!normalizedText && !file), [loading, normalizedText, file]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setLinkCopied(false);

    if (normalizedText && file) {
      setLoading(false);
      setError('Choose either text or file, not both.');
      return;
    }

    if (normalizedText.length > MAX_TEXT_LENGTH) {
      setLoading(false);
      setError(`Text exceeds max length of ${MAX_TEXT_LENGTH} characters.`);
      return;
    }

    if (expiresAt && new Date(expiresAt) <= new Date()) {
      setLoading(false);
      setError('Expiry must be a future date and time.');
      return;
    }

    const formData = new FormData();
    if (normalizedText) formData.append('text', normalizedText);
    if (file) formData.append('file', file);
    if (expiresAt) formData.append('expiresAt', new Date(expiresAt).toISOString());

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = result?.url || (result ? `${window.location.origin}/content/${result.id}` : null);

  const copyShareUrl = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1500);
  };

  return (
    <section className="panel-card">
      <h1>Create a secure link</h1>
      <p className="panel-subtitle">Upload text or one file. Links expire automatically.</p>

      {error ? <p className="status error">{error}</p> : null}
      {result ? (
        <div className="status success">
          <p>Link created. Share this URL:</p>
          <a href={shareUrl} className="share-link">{shareUrl}</a>
          <button type="button" className="btn btn-secondary" onClick={copyShareUrl}>
            {linkCopied ? 'Copied' : 'Copy link'}
          </button>
          <p>Expires: {new Date(result.expiresAt).toLocaleString()}</p>
          <Link className="btn btn-secondary" to={`/content/${result.id}`}>Open shared view</Link>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="upload-form">
        <label className="field">
          <span>Text content</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste notes, code, or a message"
            disabled={!!file}
          />
        </label>

        <p className="divider">or</p>

        <label className="field">
          <span>File upload</span>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={!!text}
          />
        </label>

        <label className="field">
          <span>Custom expiry (optional)</span>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
          />
        </label>

        <button type="submit" className="btn btn-primary" disabled={isDisabled}>
          {loading ? 'Uploading...' : 'Generate link'}
        </button>
      </form>
    </section>
  );
}

export default UploadPage;
