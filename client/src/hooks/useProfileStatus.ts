import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * A hook that checks if the current authenticated user has a profile
 * in the database. This is used to determine if they need to go through
 * the onboarding process.
 */
export function useProfileStatus() {
  const { user, loading: authLoading } = useAuth();
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
        // Query the profiles table to see if this user has a profile
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (error) {
          // If the error is that no rows were found, that means they don't have a profile
          if (error.code === 'PGRST116') {
            setHasProfile(false);
          } else {
            throw error;
          }
        } else {
          // If data exists, they have a profile
          setHasProfile(!!data);
        }
      } catch (err) {
        console.error('Error checking profile status:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setHasProfile(false);
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