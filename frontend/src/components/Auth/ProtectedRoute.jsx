import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingOverlay } from '../UI/LoadingState';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingOverlay message="Memeriksa sesi..." />;
  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole) {
    const roleHierarchy = { admin: 3, manager: 2, user: 1 };
    const userLevel = roleHierarchy[profile?.role ?? 'user'] ?? 1;
    const requiredLevel = roleHierarchy[requiredRole] ?? 1;
    if (userLevel < requiredLevel) return <Navigate to="/" replace />;
  }

  return children;
}
