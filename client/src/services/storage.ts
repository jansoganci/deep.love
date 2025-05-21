import { UserProfile, UserCriteria } from '../types';

// Local storage keys
const PROFILE_KEY = 'deep_love_profile';
const CRITERIA_KEY = 'deep_love_criteria';
const SWIPE_COUNT_KEY = 'deep_love_swipe_count';
const SWIPE_RESET_KEY = 'deep_love_swipe_reset';

// Save user profile to local storage
export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

// Load user profile from local storage
export function loadUserProfile(): UserProfile | null {
  const profileJson = localStorage.getItem(PROFILE_KEY);
  
  if (!profileJson) {
    return null;
  }
  
  try {
    return JSON.parse(profileJson) as UserProfile;
  } catch (error) {
    console.error('Error parsing user profile:', error);
    return null;
  }
}

// Save user criteria to local storage
export function saveUserCriteria(criteria: UserCriteria): void {
  localStorage.setItem(CRITERIA_KEY, JSON.stringify(criteria));
}

// Load user criteria from local storage
export function loadUserCriteria(): UserCriteria | null {
  const criteriaJson = localStorage.getItem(CRITERIA_KEY);
  
  if (!criteriaJson) {
    return null;
  }
  
  try {
    return JSON.parse(criteriaJson) as UserCriteria;
  } catch (error) {
    console.error('Error parsing user criteria:', error);
    return null;
  }
}

// Get swipe count
export function getSwipeCount(): number {
  const now = new Date();
  const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const resetDate = localStorage.getItem(SWIPE_RESET_KEY);
  
  // If it's a new day, reset swipe count
  if (resetDate !== today) {
    localStorage.setItem(SWIPE_RESET_KEY, today);
    localStorage.setItem(SWIPE_COUNT_KEY, '0');
    return 0;
  }
  
  const count = localStorage.getItem(SWIPE_COUNT_KEY);
  return count ? parseInt(count, 10) : 0;
}

// Update swipe count
export function updateSwipeCount(): number {
  const count = getSwipeCount() + 1;
  localStorage.setItem(SWIPE_COUNT_KEY, count.toString());
  return count;
}

// Reset swipe count
export function resetSwipeCount(): void {
  const now = new Date();
  const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
  
  localStorage.setItem(SWIPE_RESET_KEY, today);
  localStorage.setItem(SWIPE_COUNT_KEY, '0');
}
