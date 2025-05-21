import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { session, loading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // If not loading and no session, redirect to login
    if (!loading && !session) {
      setLocation('/login');
    }
  }, [session, loading, setLocation]);

  // Show nothing while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authenticated, render the protected route
  return session ? <>{children}</> : null;
};

export default PrivateRoute;