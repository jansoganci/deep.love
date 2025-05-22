import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import SwipeDeck from '../components/SwipeDeck';
import FreemiumBanner from '../components/FreemiumBanner';
import BannerAdPlaceholder from '../components/BannerAdPlaceholder';
import { getMatches } from '../services/matchEngine';
import { loadUserCriteria, loadUserProfile, saveUserCriteria } from '../services/storage';
import { useSwipeLimit } from '../hooks/useSwipeLimit';
import { useEntitlement } from '../hooks/useEntitlement';
import { supabase, recordSwipe } from '../services/supabase';
import { useToast } from '../hooks/use-toast';
import { Profile, UserCriteria } from '../types';

const MatchesScreen = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [matches, setMatches] = useState<Profile[]>([]);
  const { swipesLeft, registerSwipe, resetMidnight } = useSwipeLimit();
  const { isPro } = useEntitlement();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<{id: string} | null>(null);
  
  // Load matches and check swipe limit on mount - only once
  useEffect(() => {
    // Track if component is mounted to prevent state updates after unmount
    let isMounted = true;
    
    async function initializeScreen() {
      try {
        // Reset swipes if it's a new day
        resetMidnight();
        
        // Get the current authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        // Must have authenticated user to continue
        if (!user) {
          toast({
            title: "Authentication Required",
            description: "You need to be logged in to view matches",
            variant: "destructive"
          });
          setLocation('/login');
          return;
        }
        
        setCurrentUser({ id: user.id });
        console.log("Current user ID:", user.id);
        
        // Try to load criteria from Supabase first
        let userCriteria: UserCriteria | null = null;
        
        const { data: criteriaData, error: criteriaError } = await supabase
          .from('criteria')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (criteriaError) {
          if (criteriaError.code !== 'PGRST116') { // PGRST116 means no results found
            console.error("Error fetching criteria:", criteriaError);
            toast({
              title: "Error",
              description: "Failed to load your preferences. Checking local storage as fallback.",
            });
          }
          
          // Fallback to local storage
          userCriteria = loadUserCriteria();
        } else if (criteriaData) {
          // Convert from Supabase format to our app format
          const convertedCriteria: UserCriteria = {
            ageRange: [criteriaData.age_min, criteriaData.age_max] as [number, number],
            hobbies: criteriaData.hobbies || [],
            relationshipGoal: criteriaData.relationship_goal,
            genderPreference: criteriaData.gender || "any",
            distanceRadius: criteriaData.distance_km || 50,
            education: criteriaData.education || "",
            occupation: criteriaData.occupation || "",
            religion: criteriaData.religion || "none",
            ethnicity: criteriaData.ethnicity || "none",
            height: criteriaData.height_cm
          };
          
          userCriteria = convertedCriteria;
          
          // Save to local storage for compatibility
          saveUserCriteria(userCriteria);
        } else {
          // Fallback to local storage
          userCriteria = loadUserCriteria();
        }
        
        // Check if we have criteria from either source
        if (!userCriteria) {
          // Redirect to criteria screen if no criteria is found
          toast({
            title: "Matching Criteria Needed",
            description: "Please set your matching preferences first",
          });
          setLocation('/criteria');
          return;
        }
        
        // Check if user has a profile
        const userProfile = loadUserProfile();
        
        // Get matches based on criteria from Supabase
        const potentialMatches = await getMatches(userCriteria);
        
        if (potentialMatches.length === 0) {
          toast({
            title: "No Matches Found",
            description: "Try broadening your criteria or check back later for more profiles",
          });
        }
        
        setMatches(potentialMatches);
        
        // Redirect to paywall if already out of swipes
        if (swipesLeft <= 0 && !isPro) {
          setLocation('/paywall');
          return;
        }
        
        if (isMounted) {
          setLoading(false);
        }
      } catch (error: any) {
        if (isMounted) {
          toast({
            title: "Error",
            description: error.message || "Failed to initialize matches",
            variant: "destructive"
          });
          setLoading(false);
        }
      }
    }
    
    initializeScreen();
    
    // Cleanup function to avoid state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [setLocation, resetMidnight, swipesLeft, isPro, toast]);
  
  // Function to show the match modal
  const showMatchPopup = (profile: Profile) => {
    setMatchedProfile(profile);
    setShowMatchModal(true);
  };

  // Handle swiping left (dislike)
  const handleSwipeLeft = async (profileId: string) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "User not initialized",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Record the swipe in Supabase
      await recordSwipe(currentUser.id, profileId, 'left');
      
      // Pro users have unlimited swipes, only count for free users
      if (!isPro) {
        // Register the swipe action for the limit counter
        registerSwipe();
        
        // Navigate to paywall if no swipes remaining
        if (swipesLeft <= 1) { // Check if this swipe will deplete remaining swipes
          setLocation('/paywall');
        }
      }
      
      // Remove the profile from the deck
      setMatches(prev => prev.filter(p => p.id !== profileId));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record swipe",
        variant: "destructive"
      });
    }
  };
  
  // Handle swiping right (like)
  const handleSwipeRight = async (profileId: string) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "User not initialized",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Find the profile that was swiped on
      const candidate = matches.find(m => m.id === profileId);
      if (!candidate) {
        throw new Error("Profile not found");
      }
      
      // Record the swipe in Supabase
      await recordSwipe(currentUser.id, profileId, 'right');
      
      // Check if this is a mutual match
      const { data: reciprocal, error } = await supabase
        .from('swipes')
        .select('*')
        .eq('from_id', profileId)
        .eq('to_id', currentUser.id)
        .eq('direction', 'right')
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 means no results found
        throw error;
      }
      
      // If there's a reciprocal swipe (mutual match), show the match modal
      if (reciprocal) {
        showMatchPopup(candidate);
      }
      
      // Pro users have unlimited swipes, only count for free users
      if (!isPro) {
        // Register the swipe action for the limit counter
        registerSwipe();
        
        // Navigate to paywall if no swipes remaining
        if (swipesLeft <= 1) { // Check if this swipe will deplete remaining swipes
          setLocation('/paywall');
        }
      }
      
      // Remove the profile from the deck
      setMatches(prev => prev.filter(p => p.id !== profileId));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record swipe",
        variant: "destructive"
      });
    }
  };
  
  // Reset criteria and navigate back
  const handleResetCriteria = () => {
    setLocation('/criteria');
  };
  
  // Handle when all profiles have been swiped
  const handleEmptyDeck = () => {
    // You could fetch more matches or show a message
    console.log('No more matches!');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto">
      {/* Show freemium banner if user is not Pro and has 5 or fewer swipes left */}
      {!isPro && swipesLeft <= 5 && (
        <FreemiumBanner swipesLeft={swipesLeft} />
      )}
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center">{t('matches.title')}</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
          {isPro 
            ? t('paywall.feature1') // "Unlimited swipes" for Pro users
            : t('matches.remaining', { remaining: swipesLeft })
          }
        </p>
      </div>
      
      <SwipeDeck 
        profiles={matches}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        onEmpty={handleEmptyDeck}
      />
      
      <div className="text-center">
        <button 
          className="text-secondary hover:text-secondary-dark font-medium"
          onClick={handleResetCriteria}
        >
          {t('matches.resetCriteria')}
        </button>
      </div>
      
      {/* Only show ads to non-Pro users */}
      {!isPro && <BannerAdPlaceholder />}
      
      {/* Match Modal */}
      {showMatchModal && matchedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full text-center shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-primary">It's a Match!</h2>
            <p className="mb-6">You and {matchedProfile.name} liked each other</p>
            
            <div className="flex items-center justify-center space-x-4 mb-6">
              {/* User Avatar */}
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                <img 
                  src="https://placehold.co/100x100/png?text=You" 
                  alt="Your profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Hearts Icon */}
              <div className="text-3xl text-red-500">
                ❤️
              </div>
              
              {/* Match Avatar */}
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                <img 
                  src={matchedProfile.photo} 
                  alt={matchedProfile.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="flex flex-col space-y-4">
              <button 
                className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                onClick={() => {
                  // In a real app, this would open a chat with the matched user
                  toast({
                    title: "Feature Coming Soon",
                    description: "Chat functionality will be available in the next update"
                  });
                }}
              >
                Send a Message
              </button>
              
              <button 
                className="w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                onClick={() => setShowMatchModal(false)}
              >
                Keep Swiping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchesScreen;