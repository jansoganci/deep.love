import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { useEntitlement } from '../hooks/useEntitlement';
import { useSwipeLimit } from '../hooks/useSwipeLimit';
import * as api from '../services/api'; // Migrated from Supabase to custom backend
import SwipeDeck from '../components/SwipeDeck';
import { Profile } from '../types';

const HomeScreen = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isPro } = useEntitlement();
  const { swipesLeft, registerSwipe } = useSwipeLimit();
  
  const [matches, setMatches] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    async function initializeScreen() {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view matches",
          variant: "destructive"
        });
        setLocation('/login');
        return;
      }

      try {
        // Get potential matches from our backend
        const potentialMatches = await api.getMatches(50);
        
        if (potentialMatches.length === 0) {
          toast({
            title: "No Matches Found",
            description: "Try broadening your criteria or check back later for more profiles",
            duration: 5000,
          });
        }
        
        if (isMountedRef.current) {
          setMatches(potentialMatches);
          setLoading(false);
        }
      } catch (error: any) {
        if (isMountedRef.current) {
          toast({
            title: "Error",
            description: error.message || "Failed to load matches",
            variant: "destructive"
          });
          setLoading(false);
        }
      }
    }
    
    // Only load once when component mounts
    initializeScreen();
    
    // Cleanup function to avoid state updates after unmount
    return () => {
      isMountedRef.current = false;
    };
  }, [user, setLocation, toast]);

  // Handle swiping left (dislike)
  const handleSwipeLeft = async (profileId: string) => {
    try {
      // Record swipe with our backend
      await api.recordSwipe(profileId, 'left');
      
      // Only count swipes for free users
      if (!isPro) {
        registerSwipe();
        
        // Check swipes left after registering
        if (swipesLeft <= 1) {
          setLocation('/paywall');
          return;
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
    try {
      // Record swipe with our backend
      const result = await api.recordSwipe(profileId, 'right');
      
      // Check if it's a match and show notification
      if (result.isMatch) {
        const matchedProfile = matches.find(m => m.id === profileId);
        if (matchedProfile) {
          toast({
            title: "It's a Match!",
            description: `You and ${matchedProfile.name} liked each other`,
            duration: 5000,
          });
        }
      }
      
      // Only count swipes for free users
      if (!isPro) {
        registerSwipe();
        
        // Check swipes left after registering
        if (swipesLeft <= 1) {
          setTimeout(() => {
            setLocation('/paywall');
          }, 1000);
          return;
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

  // Handle when all profiles have been swiped
  const handleEmptyDeck = () => {
    console.log('No more profiles to swipe!');
  };

  // Check if user should be redirected to paywall when swipes run out
  if (swipesLeft <= 0 && !isPro && !loading) {
    setLocation('/paywall');
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-3 text-lg">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('home.title', 'Discover')}</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {isPro 
            ? t('paywall.feature1') // "Unlimited swipes" for Pro users
            : t('matches.remaining', { remaining: swipesLeft })
          }
        </div>
      </div>

      {/* Reset Criteria Button */}
      <div className="text-center mb-6">
        <button
          onClick={() => setLocation('/criteria')}
          className="text-primary hover:text-primary-dark text-sm underline"
        >
          {t('matches.resetCriteria')}
        </button>
      </div>

      {/* SwipeDeck Component */}
      {matches.length > 0 ? (
        <SwipeDeck 
          profiles={matches}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onEmpty={handleEmptyDeck}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            {t('matches.noMatches')}
          </p>
          <button
            onClick={() => setLocation('/criteria')}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition"
          >
            {t('matches.resetCriteria')}
          </button>
        </div>
      )}
    </div>
  );
};

export default HomeScreen; 