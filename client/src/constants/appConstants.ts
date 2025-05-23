// Match engine scoring weights
export const MATCH_SCORING = {
  AGE_WEIGHT: 20,
  HOBBIES_WEIGHT: 30,
  RELATIONSHIP_GOAL_WEIGHT: 15,
  GENDER_PREFERENCE_WEIGHT: 15,
  RELIGION_WEIGHT: 10,
  ETHNICITY_WEIGHT: 10,
  // Random factor range for match percentage (-5 to +5)
  RANDOM_FACTOR_MIN: -5,
  RANDOM_FACTOR_MAX: 5,
  // Min and max match percentage scores
  MIN_MATCH_SCORE: 50,
  MAX_MATCH_SCORE: 99
};

// Swipe limits
export const SWIPE_LIMITS = {
  FREE_USER_DAILY_LIMIT: 20,
  // Refresh interval for matches in milliseconds
  MATCH_REFRESH_INTERVAL: 30000 
};

// Local storage keys
export const STORAGE_KEYS = {
  PROFILE_KEY: 'deep_love_profile',
  CRITERIA_KEY: 'deep_love_criteria',
  SWIPE_COUNT_KEY: 'deep_love_swipe_count',
  SWIPE_RESET_KEY: 'deep_love_swipe_reset',
  SWIPE_DATE_PREFIX: 'deepLove_swipes_'
};

// API and database defaults
export const API_DEFAULTS = {
  DEFAULT_PROFILE_LIMIT: 50,
  DEFAULT_RELATIONSHIP_GOAL: 'casual',
  DEFAULT_RELIGION: 'none',
  DEFAULT_ETHNICITY: 'none',
  DEFAULT_OCCUPATION: 'Unknown'
};

// Fallback values
export const FALLBACKS = {
  DEFAULT_EMPTY_ARRAY: [],
  DEFAULT_INTERESTS: []
}; 