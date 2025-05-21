import { supabase } from '../services/supabase';
import { v4 as uuidv4 } from 'uuid';

// Helper to generate a realistic bio based on occupation and interests
function generateBio(occupation: string, userHobbies: string[]): string {
  const intros = [
    `Working as a ${occupation} has taught me to appreciate the little things in life.`,
    `I love my job as a ${occupation}, but there's so much more to me.`,
    `${occupation} by day, adventure seeker by night.`,
    `When I'm not busy being a ${occupation}, you'll find me...`,
    `My friends say I'm the best ${occupation} they know, but I'm really just looking for someone to share my life with.`
  ];
  
  const hobbyStatements = [
    `I'm passionate about ${userHobbies.slice(0, 2).join(' and ')}.`,
    `In my free time, I enjoy ${userHobbies.slice(0, 2).join(', ')}.`,
    `Nothing makes me happier than ${userHobbies[0]}.`,
    `I could talk for hours about ${userHobbies.slice(0, 3).join(', ')} - ask me anything!`,
    `My perfect weekend involves ${userHobbies[0]} and lots of ${userHobbies[1] || userHobbies[0]}.`
  ];
  
  const closers = [
    `Looking for someone who shares my enthusiasm for life.`,
    `Hoping to meet someone authentic and kind.`,
    `Let's see if we click!`,
    `Would love to find someone who challenges me to be better.`,
    `Swipe right if you think we'd get along!`
  ];
  
  const introIndex = Math.floor(Math.random() * intros.length);
  const hobbyIndex = Math.floor(Math.random() * hobbyStatements.length);
  const closerIndex = Math.floor(Math.random() * closers.length);
  
  return `${intros[introIndex]} ${hobbyStatements[hobbyIndex]} ${closers[closerIndex]}`;
}

// Helper to get a photo URL based on gender
function generatePhotoUrl(gender: string, index: number): string {
  // Using realistic but non-real people from thispersondoesnotexist-type sites
  // For a real app, you would use a proper image hosting service
  if (gender === 'female') {
    return `https://randomuser.me/api/portraits/women/${(index % 70) + 1}.jpg`;
  } else {
    return `https://randomuser.me/api/portraits/men/${(index % 70) + 1}.jpg`;
  }
}

// Generate a single profile with realistic data
function generateProfile(gender: string, index: number): any {
  // Common first names
  const femaleNames = ["Emma", "Olivia", "Ava", "Isabella", "Sophia", "Mia", "Charlotte", "Amelia", "Harper", "Evelyn", "Abigail", "Emily", "Elizabeth", "Sofia", "Ella", "Madison", "Scarlett", "Victoria", "Aria", "Grace"];
  const maleNames = ["Liam", "Noah", "William", "James", "Oliver", "Benjamin", "Elijah", "Lucas", "Mason", "Logan", "Alexander", "Ethan", "Jacob", "Michael", "Daniel", "Henry", "Jackson", "Sebastian", "Aiden", "Matthew"];
  
  // Common last names
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
  
  // Common occupations
  const occupations = ["Teacher", "Software Developer", "Nurse", "Marketing Specialist", "Graphic Designer", "Doctor", "Chef", "Architect", "Photographer", "Writer", "Lawyer", "Accountant", "Engineer", "Artist", "Personal Trainer", "Entrepreneur", "Project Manager", "HR Specialist", "Student", "Sales Representative"];
  
  // Possible hobbies/interests
  const allHobbies = ["hiking", "yoga", "reading", "cooking", "travel", "photography", "painting", "music", "dancing", "running", "cycling", "swimming", "gardening", "meditation", "theater", "movies", "baking", "podcasts", "writing", "rowing", "skiing", "camping", "beach", "coffee", "wine tasting", "board games", "languages", "volunteering", "fashion", "technology"];
  
  // Relationship goals
  const relationshipGoals = ["casual", "serious", "marriage", "friendship", "undecided"];
  
  // Religions
  const religions = ["none", "christianity", "islam", "judaism", "hinduism", "buddhism", "spiritual", "other"];
  
  // Ethnicities
  const ethnicities = ["asian", "black", "hispanic", "middle_eastern", "mixed", "native_american", "pacific_islander", "white", "other"];
  
  // Generate a random profile
  const firstName = gender === 'female' 
    ? femaleNames[Math.floor(Math.random() * femaleNames.length)] 
    : maleNames[Math.floor(Math.random() * maleNames.length)];
    
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const displayName = `${firstName} ${lastName}`;
  const age = Math.floor(Math.random() * 15) + 25; // Ages 25-40
  const occupation = occupations[Math.floor(Math.random() * occupations.length)];
  
  // Select 3-5 random hobbies
  const numHobbies = Math.floor(Math.random() * 3) + 3;
  const shuffledHobbies = [...allHobbies].sort(() => 0.5 - Math.random());
  const interests = shuffledHobbies.slice(0, numHobbies);
  
  const relationshipGoal = relationshipGoals[Math.floor(Math.random() * relationshipGoals.length)];
  const religion = religions[Math.floor(Math.random() * religions.length)];
  const ethnicity = ethnicities[Math.floor(Math.random() * ethnicities.length)];
  
  // Height (in cm)
  const height = gender === 'female'
    ? Math.floor(Math.random() * 25) + 155 // 155-180 cm for women
    : Math.floor(Math.random() * 30) + 170; // 170-200 cm for men
  
  const bio = generateBio(occupation, interests);
  const avatarUrl = generatePhotoUrl(gender, index);
  
  // Generate a UUID for the profile ID
  const id = uuidv4();
  
  return {
    id,
    display_name: displayName,
    age,
    occupation,
    bio,
    avatar_url: avatarUrl,
    interests,
    relationship_goal: relationshipGoal,
    gender,
    religion,
    ethnicity,
    height,
    created_at: new Date().toISOString()
  };
}

// Generate and insert 20 fake profiles into Supabase
export async function generateAndInsertFakeProfiles(): Promise<string[]> {
  try {
    const profiles = [];
    const profileIds: string[] = [];
    
    // Generate 10 female profiles
    for (let i = 0; i < 10; i++) {
      const profile = generateProfile('female', i);
      profiles.push(profile);
      profileIds.push(profile.id);
    }
    
    // Generate 10 male profiles
    for (let i = 0; i < 10; i++) {
      const profile = generateProfile('male', i);
      profiles.push(profile);
      profileIds.push(profile.id);
    }
    
    // Insert all profiles into Supabase
    const { error } = await supabase
      .from('profiles')
      .upsert(profiles);
    
    if (error) {
      console.error("Error inserting profiles:", error);
      throw new Error(`Failed to insert profiles: ${error.message}`);
    }
    
    console.log(`Successfully inserted ${profiles.length} fake profiles`);
    return profileIds;
  } catch (error) {
    console.error("Error in generateAndInsertFakeProfiles:", error);
    throw error;
  }
}

// Function to get all fake profile IDs from Supabase for testing
export async function getFakeProfileIds(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(50);
      
    if (error) {
      console.error("Error fetching profile IDs:", error);
      return [];
    }
    
    return data.map(item => item.id);
  } catch (error) {
    console.error("Error in getFakeProfileIds:", error);
    return [];
  }
}