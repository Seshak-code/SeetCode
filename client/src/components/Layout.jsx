import { Link, Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <Link to="/" className="brand">SeetCode</Link>
          <p className="tagline">Practice coding problems with a clean, interview-style workflow.</p>
        </div>
        <nav className="nav-links">
          <Link to="/">Problems</Link>
        </nav>
      </header>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
