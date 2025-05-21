import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import SwipeDeck from '../components/SwipeDeck';
import FreemiumBanner from '../components/FreemiumBanner';
import BannerAdPlaceholder from '../components/BannerAdPlaceholder';
import { getMatches } from '../services/matchEngine';
import { loadUserCriteria, loadUserProfile } from '../services/storage';
import { useSwipeLimit } from '../hooks/useSwipeLimit';
import { useEntitlement } from '../hooks/useEntitlement';
import { supabase, recordSwipe } from '../services/supabase';
import { useToast } from '../hooks/use-toast';
import { Profile } from '../types';

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
  
  // Load matches and check swipe limit on mount
  useEffect(() => {
    async function initializeScreen() {
      try {
        // Reset swipes if it's a new day
        resetMidnight();
        
        const userCriteria = loadUserCriteria();
        const userProfile = loadUserProfile();
        
        if (!userCriteria) {
          // Redirect to criteria screen if no criteria is set
          setLocation('/criteria');
          return;
        }
        
        // Try to get the authenticated user from Supabase
        const { data: { user } } = await supabase.auth.getUser();
        
        // If we have a user, set it in state
        if (user) {
          setCurrentUser({ id: user.id });
        } else {
          // For testing purposes, we'll create a mock user ID if not authenticated
          setCurrentUser({ id: 'test-user-id-123' });
        }
        
        // Get matches based on criteria
        const potentialMatches = getMatches(userCriteria);
        setMatches(potentialMatches);
        
        // Redirect to paywall if already out of swipes
        if (swipesLeft <= 0 && !isPro) {
          setLocation('/paywall');
          return;
        }
        
        setLoading(false);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to initialize matches",
          variant: "destructive"
        });
        setLoading(false);
      }
    }
    
    initializeScreen();
  }, [setLocation, resetMidnight, swipesLeft, isPro, toast]);
  
  // Handle swiping left (dislike)
  const handleSwipeLeft = (profileId: string) => {
    // Pro users have unlimited swipes, only count for free users
    if (!isPro) {
      // Register the swipe action
      registerSwipe();
      
      // Navigate to paywall if no swipes remaining
      if (swipesLeft <= 1) { // Check if this swipe will deplete remaining swipes
        setLocation('/paywall');
      }
    }
    
    // Remove the profile from the deck
    setMatches(prev => prev.filter(p => p.id !== profileId));
  };
  
  // Handle swiping right (like)
  const handleSwipeRight = (profileId: string) => {
    // Pro users have unlimited swipes, only count for free users
    if (!isPro) {
      // Register the swipe action
      registerSwipe();
      
      // Navigate to paywall if no swipes remaining
      if (swipesLeft <= 1) { // Check if this swipe will deplete remaining swipes
        setLocation('/paywall');
      }
    }
    
    // Remove the profile from the deck
    setMatches(prev => prev.filter(p => p.id !== profileId));
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
    </div>
  );
};

export default MatchesScreen;
