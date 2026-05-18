import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthNav() {
  const { user, loading, logout } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <Link to="/login" className="rounded-badge border border-line px-3 py-1.5 text-sm font-medium hover:border-available">
        Login
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link to="/dashboard" className="font-mono text-sm text-muted hover:text-ink">
        dashboard
      </Link>
      <button onClick={logout} className="rounded-badge border border-line px-3 py-1.5 font-mono text-xs hover:border-danger">
        logout
      </button>
    </div>
  );
}
