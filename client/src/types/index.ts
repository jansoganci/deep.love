// User profile
export interface UserProfile {
  name: string;
  age: number;
  bio: string;
  photo: string;
}

// User criteria for matching
export interface UserCriteria {
  ageRange: [number, number]; // [min, max]
  hobbies: string[];
  relationshipGoal: string;
}

// Profile data structure (for matches)
export interface Profile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  bio: string;
  photo: string;
  interests: string[];
  relationshipGoal: string;
  matchPercentage: number; // Added by matchEngine
}

// Swipe action
export interface SwipeAction {
  profileId: string;
  direction: 'left' | 'right';
  timestamp: string;
}
