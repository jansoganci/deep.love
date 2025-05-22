import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string;
  age: number;
  bio: string;
}

const ProfileScreen = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Track if component is mounted to prevent state updates after unmount
    let isMounted = true;
    
    async function fetchUserProfile() {
      if (!user) {
        if (isMounted) {
          setLoading(false);
          toast({
            title: "Authentication Required",
            description: "Please log in to view your profile",
            variant: "destructive"
          });
          setLocation('/login');
        }
        return;
      }

      try {
        // Fetch the user's profile from Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, age, bio')
          .eq('id', user.id)
          .single();
          
        if (isMounted) {
          if (error) {
            if (error.code === 'PGRST116') { // Not found
              // Redirect to onboarding if profile doesn't exist
              toast({
                title: "Profile Not Found",
                description: "Let's create your profile first",
              });
              setLocation('/onboarding');
              return;
            } else {
              console.error("Error fetching profile:", error);
              toast({
                title: "Error",
                description: "Failed to load your profile. Please try again.",
                variant: "destructive"
              });
            }
          } else if (data) {
            setProfile(data);
          }
          
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error in fetchUserProfile:", error);
          setLoading(false);
          toast({
            title: "Error",
            description: "Something went wrong. Please try again.",
            variant: "destructive"
          });
        }
      }
    }
    
    fetchUserProfile();
    
    // Cleanup function to avoid state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [user, setLocation, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">{t('profile.title', 'Your Profile')}</h1>
      
      <div className="flex flex-col items-center mb-8">
        <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-4">
          {profile.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.display_name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-4xl">👤</span>
            </div>
          )}
        </div>
        
        <h2 className="text-2xl font-semibold mb-1">{profile.display_name}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{profile.age} years old</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium mb-3">{t('profile.about', 'About Me')}</h3>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {profile.bio || "No bio provided yet."}
        </p>
      </div>
      
      <div className="flex justify-center">
        <button 
          onClick={() => setLocation('/onboarding')}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition"
        >
          {t('profile.edit', 'Edit Profile')}
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;