import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import SwipeDeck from '../components/SwipeDeck';
import { getMatches } from '../services/matchEngine';
import { loadUserCriteria, getSwipeCount, updateSwipeCount } from '../services/storage';
import { Profile } from '../types';

const MAX_DAILY_SWIPES = 20;

const MatchesScreen = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [matches, setMatches] = useState<Profile[]>([]);
  const [swipesRemaining, setSwipesRemaining] = useState(MAX_DAILY_SWIPES);
  const [loading, setLoading] = useState(true);
  
  // Load matches and swipe count on mount
  useEffect(() => {
    const userCriteria = loadUserCriteria();
    
    if (!userCriteria) {
      // Redirect to criteria screen if no criteria is set
      setLocation('/criteria');
      return;
    }
    
    // Get matches based on criteria
    const potentialMatches = getMatches(userCriteria);
    setMatches(potentialMatches);
    
    // Get remaining swipes from storage
    const usedSwipes = getSwipeCount();
    setSwipesRemaining(MAX_DAILY_SWIPES - usedSwipes);
    
    setLoading(false);
  }, [setLocation]);
  
  // Handle swiping left (dislike)
  const handleSwipeLeft = (profileId: string) => {
    const newSwipesRemaining = swipesRemaining - 1;
    setSwipesRemaining(newSwipesRemaining);
    updateSwipeCount();
    
    // Navigate to paywall if no swipes remaining
    if (newSwipesRemaining <= 0) {
      setLocation('/paywall');
    }
  };
  
  // Handle swiping right (like)
  const handleSwipeRight = (profileId: string) => {
    const newSwipesRemaining = swipesRemaining - 1;
    setSwipesRemaining(newSwipesRemaining);
    updateSwipeCount();
    
    // Navigate to paywall if no swipes remaining
    if (newSwipesRemaining <= 0) {
      setLocation('/paywall');
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center">{t('matches.title')}</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
          {t('matches.remaining', { remaining: swipesRemaining })}
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
    </div>
  );
};

export default MatchesScreen;
