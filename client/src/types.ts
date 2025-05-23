// User profile type
export interface UserProfile {
  id: string;
  name: string;
  photo?: string;
  bio?: string;
  age?: number;
  occupation?: string;
  interests?: string[];
  relationshipGoal?: 'casual' | 'longTerm';
  gender?: 'male' | 'female' | 'non-binary' | 'other';
  religion?: 'christianity' | 'islam' | 'judaism' | 'hinduism' | 'buddhism' | 'spiritual' | 'none' | 'other';
  ethnicity?: 'white' | 'black' | 'hispanic' | 'asian' | 'mixed' | 'other' | 'none';
  height?: number;
}

// Profile type (received from API)
export interface Profile {
  id: string;
  name: string;
  photo?: string;
  bio?: string;
  age?: number;
  occupation?: string;
  interests?: string[];
  relationshipGoal?: 'casual' | 'longTerm';
  gender?: 'male' | 'female' | 'non-binary' | 'other';
  religion?: 'christianity' | 'islam' | 'judaism' | 'hinduism' | 'buddhism' | 'spiritual' | 'none' | 'other';
  ethnicity?: 'white' | 'black' | 'hispanic' | 'asian' | 'mixed' | 'other' | 'none';
  height?: number;
  matchPercentage?: number;
}

// User criteria for matching
export interface UserCriteria {
  ageRange: [number, number];
  genderPreference: 'male' | 'female' | 'non-binary' | 'any';
  relationshipGoal: 'casual' | 'longTerm' | 'marriage' | 'friendship';
  hobbies: string[];
  religion: string;
  ethnicity: string;
  distanceRadius: number;
  education?: string;
  occupation?: string;
  height?: number;
}

// Match
export interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  createdAt: string;
  profile?: Profile;
}

// Swipe
export interface Swipe {
  id: string;
  userId: string;
  targetUserId: string;
  direction: 'left' | 'right';
  createdAt: string;
}

// Chat
export interface Chat {
  id: string;
  matchId: string;
  userId: string;
  message: string;
  createdAt: string;
} 