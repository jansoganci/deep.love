import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import ProfileCompletionBar from '../components/ProfileCompletionBar';
import * as api from '../services/api'; // Migrated from Supabase to custom backend

interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string;
  age: number;
  bio: string;
  occupation?: string;
  interests?: string[];
  relationship_goal?: string;
  gender?: string;
  religion?: string;
  ethnicity?: string;
  height?: number;
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
        // Fetch the user's profile from our backend
        const profileData = await api.getProfile(user.id);
          
        if (isMounted) {
          setProfile(profileData);
          setLoading(false);
        }
      } catch (error: any) {
        if (isMounted) {
          if (error.message?.includes('404')) { // Not found
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
          
          setLoading(false);
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
      
      {/* Profile Completion Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <ProfileCompletionBar profile={profile} />
      </div>
      
      {/* About Me Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium mb-3">{t('profile.about', 'About Me')}</h3>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {profile.bio || "No bio provided yet."}
        </p>
      </div>
      
      {/* Profile Enhancement Suggestions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">{t('profile.enhance', 'Enhance Your Profile')}</h3>
          
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
              <span className="text-primary text-lg">📋</span>
            </div>
            <div>
              <p className="font-medium">{t('profile.addDetails', 'Add More Details')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.addDetailsDesc', 'Complete your profile to get more relevant matches')}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
              <span className="text-primary text-lg">🏷️</span>
            </div>
            <div>
              <p className="font-medium">{t('profile.addInterests', 'Add Your Interests')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.addInterestsDesc', 'What makes you unique? Add interests to find like-minded people')}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
              <span className="text-primary text-lg">📸</span>
            </div>
            <div>
              <p className="font-medium">{t('profile.addPhotos', 'Add More Photos')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.addPhotosDesc', 'Show your personality with multiple photos')}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Profile Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setLocation('/onboarding')}
          className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-dark transition"
        >
          {t('profile.editProfile', 'Edit Profile')}
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;