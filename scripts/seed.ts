import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedProfiles() {
  try {
    console.log('Starting database seeding process...');
    
    // Read mock profiles from JSON file
    const mockProfilesPath = path.join(__dirname, '../data/mockProfiles.json');
    const mockProfilesData = fs.readFileSync(mockProfilesPath, 'utf8');
    const mockProfiles = JSON.parse(mockProfilesData);
    
    // Transform profiles to match Supabase schema
    const profiles = mockProfiles.map(profile => ({
      id: profile.id, // UUID from mockProfiles.json
      display_name: profile.name,
      age: profile.age,
      occupation: profile.occupation,
      bio: profile.bio,
      avatar_url: profile.photo,
      interests: profile.interests,
      relationship_goal: profile.relationshipGoal,
      gender: Math.random() > 0.5 ? 'male' : 'female', // Randomly assign gender
      religion: ['none', 'christianity', 'islam', 'buddhism', 'hinduism', 'judaism', 'spiritual'][Math.floor(Math.random() * 7)],
      ethnicity: ['asian', 'black', 'hispanic', 'white', 'mixed', 'other'][Math.floor(Math.random() * 6)],
      height: Math.floor(Math.random() * 50) + 150, // Random height between 150-200cm
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    console.log(`Prepared ${profiles.length} profiles for insertion`);
    
    // Insert profiles into the database
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profiles, { onConflict: 'id' });
    
    if (error) {
      console.error('Error inserting profiles:', error);
      return;
    }
    
    console.log(`Successfully seeded ${profiles.length} profiles to the database`);
    console.log('Profile IDs for reference:');
    profiles.forEach(profile => {
      console.log(`- ${profile.id} (${profile.display_name})`);
    });
    
  } catch (error) {
    console.error('Error in seed script:', error);
  }
}

// Run the seed function
seedProfiles()
  .then(() => {
    console.log('Seed process completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Unhandled error in seed process:', error);
    process.exit(1);
  });