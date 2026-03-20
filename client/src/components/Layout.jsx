import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <Link to="/" className="brand">SeetCode</Link>
          <p className="tagline">Practice coding problems with a clean, interview-style workflow.</p>
        </div>
        <nav className="nav-links" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/">Problems</Link>
          {user ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ color: '#8b949e', fontWeight: 'bold' }}>{user.username}</span>
              <button 
                onClick={logout}
                style={{ background: 'transparent', border: '1px solid #30363d', color: '#c9d1d9', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/login"
              style={{ background: '#2ea44f', color: 'white', padding: '0.4rem 1.2rem', borderRadius: '4px', fontWeight: 'bold' }}
            >
              Sign In
            </Link>
          )}
        </nav>
      </header>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
