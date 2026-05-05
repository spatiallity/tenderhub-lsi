import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingOverlay } from '../UI/LoadingState';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading, isGuest } = useAuth();

  if (loading) return <LoadingOverlay message="Memeriksa sesi..." />;
  
  // Allow through if logged in OR guest
  if (!user && !isGuest) return <Navigate to="/login" replace />;

  // Role-gated routes: guests are never allowed
  if (requiredRole) {
    if (isGuest) return <Navigate to="/" replace />;
    const roleHierarchy = { admin: 3, manager: 2, user: 1 };
    const userLevel = roleHierarchy[profile?.role ?? 'user'] ?? 1;
    const requiredLevel = roleHierarchy[requiredRole] ?? 1;
    if (userLevel < requiredLevel) return <Navigate to="/" replace />;
  }

  return children;
}
