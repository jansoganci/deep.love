import { UserCriteria, Profile } from '../types';
import { getMatches as apiGetMatches } from './api'; // Migrated from Supabase to custom backend
import { MATCH_SCORING, API_DEFAULTS, FALLBACKS } from '../constants/appConstants';

/**
 * Calculate match percentage based on criteria
 * @param profile The candidate profile
 * @param criteria User's matching criteria
 * @returns Match percentage score
 */
function calculateMatchPercentage(profile: Profile, criteria: UserCriteria): number {
  let score = 0;
  
  try {
    // Age match
    const agePoints = MATCH_SCORING.AGE_WEIGHT;
    const [minAge, maxAge] = criteria.ageRange;
    const profileAge = profile.age || 25; // Default age if undefined
    if (profileAge >= minAge && profileAge <= maxAge) {
      // Full points if age is in range
      score += agePoints;
    } else {
      // Partial points based on how close to range
      const ageDiff = profileAge < minAge ? minAge - profileAge : profileAge - maxAge;
      const ageScore = Math.max(0, agePoints - (ageDiff * 5));
      score += ageScore;
    }
    
    // Hobbies/interests match
    const hobbyPoints = MATCH_SCORING.HOBBIES_WEIGHT;
    const profileInterests = profile.interests || FALLBACKS.DEFAULT_INTERESTS;
    const matchingInterests = profileInterests.filter(interest => 
      criteria.hobbies.includes(interest)
    );
    const interestScore = matchingInterests.length > 0 
      ? (matchingInterests.length / Math.max(criteria.hobbies.length, 1)) * hobbyPoints 
      : 0;
    score += interestScore;
    
    // Relationship goal match
    const goalPoints = MATCH_SCORING.RELATIONSHIP_GOAL_WEIGHT;
    if (profile.relationshipGoal === criteria.relationshipGoal) {
      score += goalPoints;
    }
    
    // Gender preference match
    const genderPoints = MATCH_SCORING.GENDER_PREFERENCE_WEIGHT;
    if (criteria.genderPreference === 'any' || 
        criteria.genderPreference === profile.gender) {
      score += genderPoints;
    }
    
    // Religion match
    const religionPoints = MATCH_SCORING.RELIGION_WEIGHT;
    if (criteria.religion === 'none' || 
        criteria.religion === profile.religion) {
      score += religionPoints;
    }
    
    // Ethnicity match
    const ethnicityPoints = MATCH_SCORING.ETHNICITY_WEIGHT;
    if (criteria.ethnicity === 'none' || 
        criteria.ethnicity === profile.ethnicity) {
      score += ethnicityPoints;
    }
    
    // Add a bit of randomness to make it more realistic
    const randomFactor = Math.floor(
      Math.random() * (MATCH_SCORING.RANDOM_FACTOR_MAX - MATCH_SCORING.RANDOM_FACTOR_MIN + 1)
    ) + MATCH_SCORING.RANDOM_FACTOR_MIN;
    
    score = Math.min(
      MATCH_SCORING.MAX_MATCH_SCORE, 
      Math.max(MATCH_SCORING.MIN_MATCH_SCORE, score + randomFactor)
    );
    
    return Math.round(score);
  } catch (error) {
    console.error("Error calculating match percentage:", error);
    // Return a default value in case of error
    return MATCH_SCORING.MIN_MATCH_SCORE;
  }
}

/**
 * Convert a backend profile to our app's Profile format
 * @param profile Raw profile data from backend
 * @returns Formatted Profile object
 */
function convertBackendProfile(profile: any): Profile {
  if (!profile) {
    throw new Error("Invalid profile data");
  }
  
  return {
    id: profile.id,
    name: profile.display_name,
    age: profile.age,
    occupation: profile.occupation || API_DEFAULTS.DEFAULT_OCCUPATION,
    bio: profile.bio || "",
    photo: profile.avatar_url,
    interests: profile.interests || FALLBACKS.DEFAULT_EMPTY_ARRAY,
    relationshipGoal: profile.relationship_goal || API_DEFAULTS.DEFAULT_RELATIONSHIP_GOAL,
    gender: profile.gender,
    religion: profile.religion || API_DEFAULTS.DEFAULT_RELIGION,
    ethnicity: profile.ethnicity || API_DEFAULTS.DEFAULT_ETHNICITY,
    height: profile.height,
    matchPercentage: 0 // Will be set later
  };
}

/**
 * Get matches based on user criteria
 * @param criteria The user's matching criteria
 * @returns Array of matching profiles
 */
export async function getMatches(criteria: UserCriteria): Promise<Profile[]> {
  try {
    // Validate criteria
    if (!criteria) {
      console.error("No matching criteria provided");
      return FALLBACKS.DEFAULT_EMPTY_ARRAY;
    }
    
    // Fetch profiles from API
    const profiles = await apiGetMatches(API_DEFAULTS.DEFAULT_PROFILE_LIMIT);
    
    if (!profiles || profiles.length === 0) {
      console.log("No profiles found in database");
      return FALLBACKS.DEFAULT_EMPTY_ARRAY;
    }
    
    // console.log(`Found ${profiles.length} profiles in database`);
    
    // Calculate match percentage for each profile
    const matchesWithScores = profiles.map((profile: Profile) => ({
      ...profile,
      matchPercentage: calculateMatchPercentage(profile, criteria)
    }));
    
    // Sort by match percentage (descending)
    return matchesWithScores.sort((a: Profile, b: Profile) => b.matchPercentage! - a.matchPercentage!);
  } catch (error: any) {
    console.error("Error in getMatches:", error);
    // Return a more helpful error message to the caller
    throw new Error(`Failed to get matches: ${error.message}`);
  }
}
