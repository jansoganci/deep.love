import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/supabase';

// Female names
const femaleNames = [
  'Sophia', 'Emma', 'Olivia', 'Ava', 'Isabella', 
  'Mia', 'Amelia', 'Harper', 'Evelyn', 'Abigail'
];

// Male names
const maleNames = [
  'Liam', 'Noah', 'Oliver', 'Elijah', 'William',
  'James', 'Benjamin', 'Lucas', 'Henry', 'Alexander'
];

// Diverse last names
const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
  'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
];

// Occupations
const occupations = [
  'Software Engineer', 'Doctor', 'Teacher', 'Graphic Designer', 'Entrepreneur',
  'Marketing Manager', 'Nurse', 'Chef', 'Photographer', 'Writer',
  'Financial Analyst', 'Architect', 'Fitness Trainer', 'Lawyer', 'Artist'
];

// Hobbies
const hobbies = [
  'Hiking', 'Photography', 'Cooking', 'Travel', 'Yoga',
  'Reading', 'Painting', 'Gaming', 'Music', 'Swimming',
  'Cycling', 'Dancing', 'Writing', 'Meditation', 'Gardening'
];

// Relationship goals
const relationshipGoals = ['casual', 'longTerm', 'marriage', 'friendship'];

// Religions
const religions = ['none', 'christian', 'muslim', 'jewish', 'hindu', 'buddhist', 'spiritual', 'other'];

// Ethnicities
const ethnicities = ['asian', 'black', 'hispanic', 'white', 'mixed', 'other'];

// Bio templates
const bioTemplates = [
  "I'm passionate about HOBBY1 and HOBBY2. Looking for someone who shares my love for HOBBY3.",
  "OCCUPATION by day, HOBBY1 enthusiast by night. Let's chat about HOBBY2!",
  "Life is too short not to try HOBBY1. I also enjoy HOBBY2 when I'm not busy with work.",
  "OCCUPATION who loves to HOBBY1 on weekends. Also into HOBBY2 and HOBBY3.",
  "Just a regular person who enjoys HOBBY1, HOBBY2, and occasionally HOBBY3.",
  "Looking for someone to share HOBBY1 adventures with. I'm a OCCUPATION and love HOBBY2."
];

// Generate a realistic bio
function generateBio(occupation: string, userHobbies: string[]): string {
  let template = bioTemplates[Math.floor(Math.random() * bioTemplates.length)];
  
  template = template.replace('OCCUPATION', occupation);
  
  // Replace HOBBY placeholders with actual hobbies
  for (let i = 1; i <= 3; i++) {
    if (template.includes(`HOBBY${i}`) && userHobbies.length >= i) {
      template = template.replace(`HOBBY${i}`, userHobbies[i-1].toLowerCase());
    }
  }
  
  return template;
}

// Generate profile photos URLs from Unsplash
function generatePhotoUrl(gender: string, index: number): string {
  // Using specific Unsplash photos to ensure we get realistic portraits
  const femalePhotos = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1491349174775-aaafddd81942?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1593529467220-9d721ceb9a78?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1479936343636-73cdc5aae0c3?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1588453383063-37ea0b78f30f?w=400&h=400&fit=crop'
  ];
  
  const malePhotos = [
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1492446845049-9c50cc313f00?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1540569014785-6435fa3a37ad?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?w=400&h=400&fit=crop'
  ];
  
  const photos = gender === 'female' ? femalePhotos : malePhotos;
  return photos[index % photos.length];
}

// Generate a single fake profile
function generateProfile(gender: string, index: number): any {
  const uuid = uuidv4();
  const nameArray = gender === 'female' ? femaleNames : maleNames;
  const firstName = nameArray[index % nameArray.length];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const age = Math.floor(Math.random() * 20) + 22; // Ages between 22-41
  const occupation = occupations[Math.floor(Math.random() * occupations.length)];
  
  // Select 2-4 random hobbies
  const numHobbies = Math.floor(Math.random() * 3) + 2;
  const shuffledHobbies = [...hobbies].sort(() => 0.5 - Math.random());
  const userHobbies = shuffledHobbies.slice(0, numHobbies);
  
  const relationshipGoal = relationshipGoals[Math.floor(Math.random() * relationshipGoals.length)];
  const religion = religions[Math.floor(Math.random() * religions.length)];
  const ethnicity = ethnicities[Math.floor(Math.random() * ethnicities.length)];
  const height = Math.floor(Math.random() * 40) + 160; // Heights between 160-199 cm
  
  const bio = generateBio(occupation, userHobbies);
  const photoUrl = generatePhotoUrl(gender, index);
  
  return {
    id: uuid,
    display_name: `${firstName} ${lastName}`,
    age: age,
    occupation: occupation,
    bio: bio,
    avatar_url: photoUrl,
    interests: userHobbies,
    relationship_goal: relationshipGoal,
    gender: gender,
    religion: religion,
    ethnicity: ethnicity,
    height: height,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// Generate and insert profiles into Supabase
export async function generateAndInsertFakeProfiles(): Promise<string[]> {
  const profiles = [];
  
  // Generate 10 female profiles
  for (let i = 0; i < 10; i++) {
    profiles.push(generateProfile('female', i));
  }
  
  // Generate 10 male profiles
  for (let i = 0; i < 10; i++) {
    profiles.push(generateProfile('male', i));
  }

  console.log("Generated profiles:", profiles);
  
  // Insert profiles in batches of 5 to avoid rate limits
  for (let i = 0; i < profiles.length; i += 5) {
    const batch = profiles.slice(i, i + 5);
    const { error } = await supabase.from('profiles').insert(batch);
    
    if (error) {
      console.error(`Error inserting profiles batch ${i/5 + 1}:`, error);
      throw error;
    } else {
      console.log(`Successfully inserted profiles batch ${i/5 + 1}`);
    }
  }
  
  console.log("All 20 fake profiles inserted successfully!");
  
  // Return the UUIDs of the created profiles for testing
  return profiles.map(p => p.id);
}

// Get existing profile IDs for testing
export async function getFakeProfileIds(): Promise<string[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (error) {
    console.error("Error fetching profile IDs:", error);
    return [];
  }
  
  return data.map(profile => profile.id);
}