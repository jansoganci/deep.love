import { useState, useEffect } from 'react';

// Maximum number of swipes allowed per day for free users
export const DAILY_LIMIT = 20;

/**
 * Custom hook to manage the daily swipe limit for freemium users
 * @returns Object with swipesLeft, registerSwipe, and resetMidnight functions
 */
export function useSwipeLimit() {
  // Get current date in YYYY-MM-DD format
  const getCurrentDate = (): string => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  };

  // Local storage key for today's swipes
  const getStorageKey = (): string => {
    return `deepLove_swipes_${getCurrentDate()}`;
  };

  // Initialize state with current swipe count from localStorage
  const [swipesLeft, setSwipesLeft] = useState<number>(() => {
    const currentSwipes = localStorage.getItem(getStorageKey());
    
    if (currentSwipes !== null) {
      const swipesUsed = parseInt(currentSwipes, 10);
      return Math.max(0, DAILY_LIMIT - swipesUsed);
    }
    
    return DAILY_LIMIT;
  });

  // Reset swipe count at midnight
  const resetMidnight = (): void => {
    const currentDate = getCurrentDate();
    const storageKey = `deepLove_swipes_${currentDate}`;
    
    // Check if we have a record for today already
    const currentSwipes = localStorage.getItem(storageKey);
    
    if (currentSwipes === null) {
      // It's a new day, reset the count
      localStorage.setItem(storageKey, '0');
      setSwipesLeft(DAILY_LIMIT);
    }
  };

  // Register a swipe action
  const registerSwipe = (): void => {
    const storageKey = getStorageKey();
    const currentSwipes = localStorage.getItem(storageKey);
    
    let swipesUsed = 1;
    
    if (currentSwipes !== null) {
      swipesUsed = parseInt(currentSwipes, 10) + 1;
    }
    
    localStorage.setItem(storageKey, swipesUsed.toString());
    
    const remaining = Math.max(0, DAILY_LIMIT - swipesUsed);
    setSwipesLeft(remaining);
  };

  // Check for day change when component mounts
  useEffect(() => {
    resetMidnight();
    
    // Optional: Set up a timer to check for day change if the app is running at midnight
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const timeToMidnight = midnight.getTime() - new Date().getTime();
    
    const midnightTimer = setTimeout(() => {
      resetMidnight();
    }, timeToMidnight);
    
    return () => clearTimeout(midnightTimer);
  }, []);

  return { swipesLeft, registerSwipe, resetMidnight };
}

export default useSwipeLimit;