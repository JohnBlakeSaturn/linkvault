import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-6">LinkVault</h1>
        <p className="text-xl text-gray-600 mb-8">
          Share text and files securely with expiring links
        </p>
        <Link 
          to="/upload"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"
        >
          Start Sharing
        </Link>
      </div>
    </div>
  );
}

export default HomePage;