import { useNavigate } from 'react-router-dom';
import '../styles/notFound.css';

export function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="not-found">
      <div className="not-found__container">
        <h1 className="not-found__title">404</h1>
        <h2 className="not-found__subtitle">Page Not Found</h2>
        <p className="not-found__message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          className="not-found__button"
          onClick={handleGoHome}
          aria-label="Return to home page"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}
