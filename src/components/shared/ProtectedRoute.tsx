import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole: 'admin' | 'creator';
};

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== requiredRole) {
    return <Navigate to={`/${user?.role}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;