import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

const PrivateRoute = ({ children, requireProfile = true }: PrivateRouteProps) => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Only perform redirects when auth check is complete
    if (!isLoading && !user) {
      setLocation('/login');
    }
  }, [user, isLoading, setLocation]);

  // Show loader while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, render nothing (redirect will happen)
  if (!user) {
    return null;
  }

  // Otherwise render the children
  return <>{children}</>;
};

export default PrivateRoute;