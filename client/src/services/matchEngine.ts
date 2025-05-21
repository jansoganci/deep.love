import { UserCriteria, Profile } from '../types';
import { supabase } from './supabase';

// Calculate match percentage based on criteria
function calculateMatchPercentage(profile: Profile, criteria: UserCriteria): number {
  let score = 0;
  const totalPoints = 100;
  
  // Age match (20% of score)
  const agePoints = 20;
  const [minAge, maxAge] = criteria.ageRange;
  if (profile.age >= minAge && profile.age <= maxAge) {
    // Full points if age is in range
    score += agePoints;
  } else {
    // Partial points based on how close to range
    const ageDiff = profile.age < minAge ? minAge - profile.age : profile.age - maxAge;
    const ageScore = Math.max(0, agePoints - (ageDiff * 5));
    score += ageScore;
  }
  
  // Hobbies/interests match (30% of score)
  const hobbyPoints = 30;
  const matchingInterests = profile.interests.filter(interest => 
    criteria.hobbies.includes(interest)
  );
  const interestScore = matchingInterests.length > 0 
    ? (matchingInterests.length / Math.max(criteria.hobbies.length, 1)) * hobbyPoints 
    : 0;
  score += interestScore;
  
  // Relationship goal match (15% of score)
  const goalPoints = 15;
  if (profile.relationshipGoal === criteria.relationshipGoal) {
    score += goalPoints;
  }
  
  // Gender preference match (15% of score)
  const genderPoints = 15;
  if (criteria.genderPreference === 'any' || 
      criteria.genderPreference === profile.gender) {
    score += genderPoints;
  }
  
  // Religion match (10% of score)
  const religionPoints = 10;
  if (criteria.religion === 'none' || 
      criteria.religion === profile.religion) {
    score += religionPoints;
  }
  
  // Ethnicity match (10% of score)
  const ethnicityPoints = 10;
  if (criteria.ethnicity === 'none' || 
      criteria.ethnicity === profile.ethnicity) {
    score += ethnicityPoints;
  }
  
  // Add a bit of randomness to make it more realistic
  const randomFactor = Math.floor(Math.random() * 10) - 5; // -5 to +5
  score = Math.min(99, Math.max(50, score + randomFactor)); // Ensure score is between 50-99
  
  return Math.round(score);
}

// Convert a Supabase profile to our app's Profile format
function convertSupabaseProfile(profile: any): Profile {
  return {
    id: profile.id,
    name: profile.display_name,
    age: profile.age,
    occupation: profile.occupation || 'Unknown',
    bio: profile.bio,
    photo: profile.avatar_url,
    interests: profile.interests || [],
    relationshipGoal: profile.relationship_goal || 'casual',
    gender: profile.gender,
    religion: profile.religion || 'none',
    ethnicity: profile.ethnicity || 'none',
    height: profile.height,
    matchPercentage: 0 // Will be set later
  };
}

// Get matches based on user criteria
export async function getMatches(criteria: UserCriteria): Promise<Profile[]> {
  try {
    // Get the current user's ID to exclude them from the matches
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("No authenticated user found");
      return [];
    }
    
    // Fetch profiles from Supabase
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user.id) // Exclude the current user
      .limit(50);
      
    if (error) {
      console.error("Error fetching profiles:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log("No profiles found in database");
      return [];
    }
    
    console.log(`Found ${data.length} profiles in database`);
    
    // Convert Supabase profiles to our app's Profile format
    const profiles = data.map(convertSupabaseProfile);
    
    // Calculate match percentage for each profile
    const matchesWithScores = profiles.map(profile => ({
      ...profile,
      matchPercentage: calculateMatchPercentage(profile, criteria)
    }));
    
    // Sort by match percentage (descending)
    return matchesWithScores.sort((a, b) => b.matchPercentage - a.matchPercentage);
  } catch (error) {
    console.error("Error in getMatches:", error);
    return [];
  }
}
