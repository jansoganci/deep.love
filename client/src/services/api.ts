import { UserProfile } from '../types';

/**
 * API service to handle all communication with the backend
 * 
 * This service acts as the central API layer for the application.
 * All HTTP requests should go through this service to maintain consistency
 * and make future backend changes easier.
 * 
 * Migration Note: Previously used Supabase, now uses custom Express + SQLite backend
 */
const BASE_URL = '/api';

// Auth API

/**
 * Sign up a new user
 */
export async function signUp(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to sign up');
  }
  
  return response.json();
}

/**
 * Log in a user
 */
export async function logIn(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to log in');
  }
  
  return response.json();
}

/**
 * Log out the current user
 */
export async function logOut() {
  const response = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to log out');
  }
  
  return response.json();
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  try {
    const response = await fetch(`${BASE_URL}/auth/user`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Profiles API

/**
 * Get a user's profile
 */
export async function getProfile(userId: string) {
  const response = await fetch(`${BASE_URL}/profiles/${userId}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get profile');
  }
  
  const data = await response.json();
  return data.profile;
}

/**
 * Update a user's profile
 */
export async function updateProfile(userId: string, profileData: Partial<UserProfile>) {
  const response = await fetch(`${BASE_URL}/profiles/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      display_name: profileData.name,
      avatar_url: profileData.photo,
      bio: profileData.bio,
      age: profileData.age,
      occupation: (profileData as any).occupation,
      interests: (profileData as any).interests,
      relationship_goal: (profileData as any).relationshipGoal,
      gender: (profileData as any).gender,
      religion: (profileData as any).religion,
      ethnicity: (profileData as any).ethnicity,
      height: (profileData as any).height
    }),
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update profile');
  }
  
  return response.json();
}

/**
 * Upload an avatar image (mock implementation for now)
 */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  // In a real implementation, you would upload the file to your server
  // For now, we'll just create a data URL to simulate the upload
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Matches API

/**
 * Get potential matches for the current user
 */
export async function getMatches(limit = 50) {
  const response = await fetch(`${BASE_URL}/matches?limit=${limit}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get matches');
  }
  
  const data = await response.json();
  return data.profiles;
}

/**
 * Record a swipe action (left or right)
 */
export async function recordSwipe(toId: string, direction: 'left' | 'right') {
  const response = await fetch(`${BASE_URL}/swipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to_id: toId,
      direction,
    }),
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to record swipe');
  }
  
  return response.json();
}

// Criteria API

/**
 * Get user's criteria/preferences
 */
export async function getCriteria() {
  const response = await fetch(`${BASE_URL}/criteria`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('404: Criteria not found');
    }
    const error = await response.json();
    throw new Error(error.message || 'Failed to get criteria');
  }
  
  const data = await response.json();
  return data.criteria;
}

/**
 * Save user's criteria/preferences
 */
export async function saveCriteria(criteriaData: any) {
  const response = await fetch(`${BASE_URL}/criteria`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(criteriaData),
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to save criteria');
  }
  
  return response.json();
} 