import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function ViewPage() {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContent();
  }, [id]);

  const fetchContent = async () => {
    try {
      // ✅ Changed: fetch from /info endpoint (always returns JSON)
      const response = await fetch(`/api/content/${id}/info`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to load');
      }

      const data = await response.json();
      setContent(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content.content);
    alert('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <Link to="/" className="text-blue-600 hover:underline">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-6">Shared Content</h1>

        {content.type === 'text' ? (
          <div>
            <div className="bg-gray-100 p-6 rounded mb-4">
              <pre className="whitespace-pre-wrap">{content.content}</pre>
            </div>
            <button
              onClick={copyToClipboard}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Copy to Clipboard
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-gray-100 p-6 rounded mb-4">
              <p className="text-lg">📁 {content.fileName}</p>
              <p className="text-gray-600">
                Size: {(content.fileSize / 1024).toFixed(2)} KB
              </p>
            </div>
            {/* ✅ This hits the original endpoint which sends the file stream */}
            <a
              href={`/api/content/${id}`}
              download
              className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Download File
            </a>
          </div>
        )}

        <div className="mt-8 text-gray-600">
          <p>Expires: {new Date(content.expiresAt).toLocaleString()}</p>
        </div>

        <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Create New Upload
        </Link>
      </div>
    </div>
  );
}

export default ViewPage;