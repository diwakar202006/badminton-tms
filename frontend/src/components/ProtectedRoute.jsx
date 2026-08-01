import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * roles: array of allowed roles, e.g. ['central_scorer']
 * requireOwnCourt: if true, and role is court_scorer, the URL's :courtNumber
 *                  param must match the user's assignedCourt.
 */
export default function ProtectedRoute({ children, roles, requireOwnCourt = false }) {
  const { user, loading } = useAuth();
  const { courtNumber } = useParams();

  if (loading) {
    return <div className="text-center py-20 text-courtline/60">Loading...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (requireOwnCourt && user.role === 'court_scorer' && Number(courtNumber) !== user.assignedCourt) {
    return <Navigate to={`/court/${user.assignedCourt}`} replace />;
  }

  return children;
}
