import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLoading from './AuthLoading';

/** Login / register only — signed-in users go to the app home. */
export default function GuestOnly() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
