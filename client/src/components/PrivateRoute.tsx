import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { useProfileStatus } from '../hooks/useProfileStatus';

interface PrivateRouteProps {
  children: ReactNode;
  requireProfile?: boolean;
}

const PrivateRoute = ({ children, requireProfile = true }: PrivateRouteProps) => {
  const { session, loading: authLoading } = useAuth();
  const { hasProfile, loading: profileLoading } = useProfileStatus();
  const [location, setLocation] = useLocation();
  
  const loading = authLoading || profileLoading;

  useEffect(() => {
    // Only perform redirects when all data is loaded
    if (!loading) {
      // If no session, redirect to login
      if (!session) {
        setLocation('/login');
      } 
      // If requireProfile is true and user has no profile, redirect to onboarding
      else if (requireProfile && !hasProfile && location !== '/onboarding') {
        setLocation('/onboarding');
      }
    }
  }, [session, hasProfile, loading, location, setLocation, requireProfile]);

  // Show loader while checking authentication or profile status
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, render nothing (redirect will happen)
  if (!session) {
    return null;
  }
  
  // If requireProfile is true but no profile, render nothing (redirect will happen)
  if (requireProfile && !hasProfile && location !== '/onboarding') {
    return null;
  }

  // Otherwise render the children
  return <>{children}</>;
};

export default PrivateRoute;