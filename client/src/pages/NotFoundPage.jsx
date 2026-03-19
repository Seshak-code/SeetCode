import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="empty-state">
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
      <Link to="/">Go back home</Link>
    </div>
  );
}

export default NotFoundPage;
