import { UserCriteria, Profile } from '../types';
import mockProfiles from '../../data/mockProfiles.json';

// Calculate match percentage based on criteria
function calculateMatchPercentage(profile: Profile, criteria: UserCriteria): number {
  let score = 0;
  const totalPoints = 100;
  
  // Age match (30% of score)
  const agePoints = 30;
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
  
  // Hobbies/interests match (50% of score)
  const hobbyPoints = 50;
  const matchingInterests = profile.interests.filter(interest => 
    criteria.hobbies.includes(interest)
  );
  const interestScore = matchingInterests.length > 0 
    ? (matchingInterests.length / Math.max(criteria.hobbies.length, 1)) * hobbyPoints 
    : 0;
  score += interestScore;
  
  // Relationship goal match (20% of score)
  const goalPoints = 20;
  if (profile.relationshipGoal === criteria.relationshipGoal) {
    score += goalPoints;
  }
  
  // Add a bit of randomness to make it more realistic
  const randomFactor = Math.floor(Math.random() * 10) - 5; // -5 to +5
  score = Math.min(99, Math.max(50, score + randomFactor)); // Ensure score is between 50-99
  
  return Math.round(score);
}

// Get matches based on user criteria
export function getMatches(criteria: UserCriteria): Profile[] {
  // In a real app, this would call an API
  // For this MVP, we'll use mock data
  
  // Cast the imported JSON to the correct type
  const profiles = mockProfiles as Profile[];
  
  // Calculate match percentage for each profile
  const matchesWithScores = profiles.map(profile => ({
    ...profile,
    matchPercentage: calculateMatchPercentage(profile, criteria)
  }));
  
  // Sort by match percentage (descending)
  return matchesWithScores.sort((a, b) => b.matchPercentage - a.matchPercentage);
}
