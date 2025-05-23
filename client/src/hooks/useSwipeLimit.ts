import { useState, useEffect } from 'react';
import { SWIPE_LIMITS, STORAGE_KEYS } from '../constants/appConstants';

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
    return `${STORAGE_KEYS.SWIPE_DATE_PREFIX}${getCurrentDate()}`;
  };

  // Initialize state with current swipe count from localStorage
  const [swipesLeft, setSwipesLeft] = useState<number>(() => {
    try {
      const currentSwipes = localStorage.getItem(getStorageKey());
      
      if (currentSwipes !== null) {
        const swipesUsed = parseInt(currentSwipes, 10);
        return Math.max(0, SWIPE_LIMITS.FREE_USER_DAILY_LIMIT - swipesUsed);
      }
      
      return SWIPE_LIMITS.FREE_USER_DAILY_LIMIT;
    } catch (error) {
      console.error("Error initializing swipe count:", error);
      return SWIPE_LIMITS.FREE_USER_DAILY_LIMIT;
    }
  });

  // Reset swipe count at midnight
  const resetMidnight = (): void => {
    try {
      const currentDate = getCurrentDate();
      const storageKey = `${STORAGE_KEYS.SWIPE_DATE_PREFIX}${currentDate}`;
      
      // Check if we have a record for today already
      const currentSwipes = localStorage.getItem(storageKey);
      
      if (currentSwipes === null) {
        // It's a new day, reset the count
        localStorage.setItem(storageKey, '0');
        setSwipesLeft(SWIPE_LIMITS.FREE_USER_DAILY_LIMIT);
      }
    } catch (error) {
      console.error("Error resetting swipe count at midnight:", error);
    }
  };

  // Register a swipe action
  const registerSwipe = (): void => {
    try {
      const storageKey = getStorageKey();
      const currentSwipes = localStorage.getItem(storageKey);
      
      let swipesUsed = 1;
      
      if (currentSwipes !== null) {
        swipesUsed = parseInt(currentSwipes, 10) + 1;
      }
      
      localStorage.setItem(storageKey, swipesUsed.toString());
      
      const remaining = Math.max(0, SWIPE_LIMITS.FREE_USER_DAILY_LIMIT - swipesUsed);
      setSwipesLeft(remaining);
    } catch (error) {
      console.error("Error registering swipe:", error);
    }
  };

  // Check for day change when component mounts
  useEffect(() => {
    resetMidnight();
    
    // Set up a timer to check for day change if the app is running at midnight
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