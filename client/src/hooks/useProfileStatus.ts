import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api'; // Migrated from Supabase to custom backend

/**
 * A hook that checks if the current authenticated user has a profile
 * in the database. This is used to determine if they need to go through
 * the onboarding process.
 * 
 * Note: Migrated from Supabase to custom SQLite backend
 */
export function useProfileStatus() {
  const { user, isLoading: authLoading } = useAuth();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function checkProfileStatus() {
      if (!user) {
        setHasProfile(false);
        setLoading(false);
        return;
      }

      try {
        // Query our backend to see if this user has a profile
        const profile = await api.getProfile(user.id);
        
        // If we get a profile back, they have one
        setHasProfile(!!profile);
      } catch (err: any) {
        // If the error is 404, that means they don't have a profile
        if (err.message?.includes('404')) {
          setHasProfile(false);
        } else {
          console.error('Error checking profile status:', err);
          setError(err instanceof Error ? err : new Error(String(err)));
          setHasProfile(false);
        }
      } finally {
        setLoading(false);
      }
    }

    // Only check if auth is not loading and we have a user
    if (!authLoading) {
      checkProfileStatus();
    }
  }, [user, authLoading]);

  return { hasProfile, loading, error };
}