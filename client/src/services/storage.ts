import { UserProfile, UserCriteria } from '../types';
import { STORAGE_KEYS } from '../constants/appConstants';

// Save user profile to local storage
export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile to storage:', error);
  }
}

// Load user profile from local storage
export function loadUserProfile(): UserProfile | null {
  try {
    const profileJson = localStorage.getItem(STORAGE_KEYS.PROFILE_KEY);
    
    if (!profileJson) {
      return null;
    }
    
    return JSON.parse(profileJson) as UserProfile;
  } catch (error) {
    console.error('Error parsing user profile:', error);
    return null;
  }
}

// Save user criteria to local storage
export function saveUserCriteria(criteria: UserCriteria): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CRITERIA_KEY, JSON.stringify(criteria));
  } catch (error) {
    console.error('Error saving user criteria to storage:', error);
  }
}

// Load user criteria from local storage
export function loadUserCriteria(): UserCriteria | null {
  try {
    const criteriaJson = localStorage.getItem(STORAGE_KEYS.CRITERIA_KEY);
    
    if (!criteriaJson) {
      return null;
    }
    
    return JSON.parse(criteriaJson) as UserCriteria;
  } catch (error) {
    console.error('Error parsing user criteria:', error);
    return null;
  }
}

// Get swipe count
export function getSwipeCount(): number {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const resetDate = localStorage.getItem(STORAGE_KEYS.SWIPE_RESET_KEY);
    
    // If it's a new day, reset swipe count
    if (resetDate !== today) {
      localStorage.setItem(STORAGE_KEYS.SWIPE_RESET_KEY, today);
      localStorage.setItem(STORAGE_KEYS.SWIPE_COUNT_KEY, '0');
      return 0;
    }
    
    const count = localStorage.getItem(STORAGE_KEYS.SWIPE_COUNT_KEY);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error('Error getting swipe count:', error);
    return 0;
  }
}

// Update swipe count
export function updateSwipeCount(): number {
  try {
    const count = getSwipeCount() + 1;
    localStorage.setItem(STORAGE_KEYS.SWIPE_COUNT_KEY, count.toString());
    return count;
  } catch (error) {
    console.error('Error updating swipe count:', error);
    return getSwipeCount(); // Return current count on error
  }
}

// Reset swipe count
export function resetSwipeCount(): void {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    localStorage.setItem(STORAGE_KEYS.SWIPE_RESET_KEY, today);
    localStorage.setItem(STORAGE_KEYS.SWIPE_COUNT_KEY, '0');
  } catch (error) {
    console.error('Error resetting swipe count:', error);
  }
}
