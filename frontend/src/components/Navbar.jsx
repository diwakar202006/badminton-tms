import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLink =
  'px-3 py-2 text-sm font-display uppercase tracking-wider text-courtline/80 hover:text-shuttle transition-colors';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardPath =
    user?.role === 'central_scorer' ? '/central' : user?.role === 'court_scorer' ? `/court/${user.assignedCourt}` : null;

  return (
    <nav className="bg-stadium-950/80 backdrop-blur border-b border-stadium-700 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="text-xl font-display font-semibold text-shuttle">
          🏸 Shuttle<span className="text-courtline">Court</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link to="/live" className={navLink}>Live</Link>
          <Link to="/fixtures" className={navLink}>Fixtures</Link>
          <Link to="/results" className={navLink}>Results</Link>
          {dashboardPath && (
            <Link to={dashboardPath} className={navLink}>Dashboard</Link>
          )}
          {user ? (
            <button onClick={handleLogout} className="btn-secondary ml-2">
              Log out
            </button>
          ) : (
            <Link to="/login" className="btn-primary ml-2">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
