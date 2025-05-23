import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { log } from './vite';

// Define types for mock data
interface MockUser {
  id: string;
  email: string;
  password: string;
}

interface MockProfile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  bio: string;
  photo: string;
  interests: string[];
  relationshipGoal: string;
  gender: string;
  religion: string;
  ethnicity: string;
  height: number;
}

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dataDir, 'deep-love.sqlite');

// Create/connect to SQLite database
// Using type assertion for the constructor
const db = Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
function initializeDatabase() {
  log('Initializing database...');

  // Users table (replaces Supabase Auth)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Profiles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      display_name TEXT,
      avatar_url TEXT,
      bio TEXT,
      age INTEGER,
      occupation TEXT,
      interests TEXT, -- Store as JSON string
      relationship_goal TEXT,
      gender TEXT,
      religion TEXT,
      ethnicity TEXT,
      height INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id) REFERENCES users(id)
    );
  `);

  // Swipes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS swipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_id TEXT NOT NULL,
      to_id TEXT NOT NULL,
      direction TEXT CHECK (direction IN ('left', 'right')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_id) REFERENCES users(id),
      FOREIGN KEY (to_id) REFERENCES profiles(id)
    );
  `);

  // Criteria table (user preferences)
  db.exec(`
    CREATE TABLE IF NOT EXISTS criteria (
      user_id TEXT PRIMARY KEY,
      age_min INTEGER,
      age_max INTEGER,
      gender TEXT,
      distance_km INTEGER,
      education TEXT,
      occupation TEXT,
      religion TEXT,
      ethnicity TEXT,
      hobbies TEXT, -- Store as JSON string
      relationship_goal TEXT,
      height_cm INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Create a view for matches (mutual right swipes)
  db.exec(`
    CREATE VIEW IF NOT EXISTS matches AS
    SELECT 
      a.from_id as user_a,
      a.to_id as user_b,
      a.created_at,
      p1.display_name as user_a_name,
      p2.display_name as user_b_name,
      p1.avatar_url as user_a_avatar,
      p2.avatar_url as user_b_avatar
    FROM swipes a
    JOIN swipes b
      ON a.from_id = b.to_id
      AND a.to_id = b.from_id
      AND a.direction = 'right'
      AND b.direction = 'right'
    LEFT JOIN profiles p1 ON a.from_id = p1.id
    LEFT JOIN profiles p2 ON a.to_id = p2.id;
  `);

  log('Database initialized successfully');
}

// Initialize the database immediately to ensure tables exist
initializeDatabase();

// User operations
const userOperations = {
  // Create a new user
  createUser: db.prepare(`
    INSERT INTO users (id, email, password_hash)
    VALUES (?, ?, ?)
  `),

  // Get user by email
  getUserByEmail: db.prepare(`
    SELECT * FROM users WHERE email = ?
  `),

  // Get user by ID
  getUserById: db.prepare(`
    SELECT * FROM users WHERE id = ?
  `)
};

// Profile operations
const profileOperations = {
  // Create or update a profile
  upsertProfile: db.prepare(`
    INSERT INTO profiles (
      id, display_name, avatar_url, bio, age, occupation, 
      interests, relationship_goal, gender, religion, ethnicity, height
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      display_name = excluded.display_name,
      avatar_url = excluded.avatar_url,
      bio = excluded.bio,
      age = excluded.age,
      occupation = excluded.occupation,
      interests = excluded.interests,
      relationship_goal = excluded.relationship_goal,
      gender = excluded.gender,
      religion = excluded.religion,
      ethnicity = excluded.ethnicity,
      height = excluded.height,
      updated_at = CURRENT_TIMESTAMP
  `),

  // Get profile by ID
  getProfileById: db.prepare(`
    SELECT * FROM profiles WHERE id = ?
  `),

  // Get all profiles except the specified user
  getProfiles: db.prepare(`
    SELECT * FROM profiles WHERE id != ? LIMIT ?
  `),

  // Get profile count
  getProfileCount: db.prepare(`
    SELECT COUNT(*) as count FROM profiles
  `)
};

// Swipe operations
const swipeOperations = {
  // Record a swipe
  recordSwipe: db.prepare(`
    INSERT INTO swipes (from_id, to_id, direction)
    VALUES (?, ?, ?)
  `),

  // Check if a mutual match exists
  checkMatch: db.prepare(`
    SELECT * FROM swipes
    WHERE from_id = ? AND to_id = ? AND direction = 'right'
  `),

  // Get matches for a user
  getMatches: db.prepare(`
    SELECT * FROM matches WHERE user_a = ? OR user_b = ?
  `)
};

// Criteria operations
const criteriaOperations = {
  // Create or update criteria
  upsertCriteria: db.prepare(`
    INSERT INTO criteria (
      user_id, age_min, age_max, gender, distance_km, education, 
      occupation, religion, ethnicity, hobbies, relationship_goal, height_cm
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      age_min = excluded.age_min,
      age_max = excluded.age_max,
      gender = excluded.gender,
      distance_km = excluded.distance_km,
      education = excluded.education,
      occupation = excluded.occupation,
      religion = excluded.religion,
      ethnicity = excluded.ethnicity,
      hobbies = excluded.hobbies,
      relationship_goal = excluded.relationship_goal,
      height_cm = excluded.height_cm,
      updated_at = CURRENT_TIMESTAMP
  `),

  // Get criteria by user ID
  getCriteriaByUserId: db.prepare(`
    SELECT * FROM criteria WHERE user_id = ?
  `)
};

// Function to seed initial data
async function seedInitialData() {
  const count = profileOperations.getProfileCount.get();
  
  if (count && count.count > 0) {
    log('Database already has profiles, skipping seed');
    return;
  }
  
  log('Seeding initial data...');
  
  try {
    // Create mock users
    const mockUsers: MockUser[] = [
      {
        id: 'ca7fe472-19a0-4f1b-9bd5-d1be39e778c3',
        email: 'sophia@example.com',
        password: 'password123'
      },
      {
        id: 'b5d75edc-cae2-4957-a459-228f7c988969',
        email: 'ethan@example.com',
        password: 'password123'
      },
      {
        id: '8d29f302-8d4b-4a13-9a6c-447c3d13f97c',
        email: 'olivia@example.com',
        password: 'password123'
      },
      {
        id: 'e27f9d2c-d6a1-46f7-9d0e-4699b8df2535',
        email: 'lucas@example.com',
        password: 'password123'
      },
      {
        id: 'f1b7cc18-d810-43b1-b634-9e5c61e9212b',
        email: 'emma@example.com',
        password: 'password123'
      }
    ];
    
    // Sample profiles from mockProfiles.json
    const mockProfiles: MockProfile[] = [
      {
        id: 'ca7fe472-19a0-4f1b-9bd5-d1be39e778c3',
        name: 'Sophia',
        age: 28,
        occupation: 'Photographer & Traveler',
        bio: 'Loves exploring new places, taking photos of everything beautiful, and finding hidden coffee shops.',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=500',
        interests: ['Travel', 'Photography', 'Coffee'],
        relationshipGoal: 'longTerm',
        gender: 'female',
        religion: 'none',
        ethnicity: 'white',
        height: 168
      },
      {
        id: 'b5d75edc-cae2-4957-a459-228f7c988969',
        name: 'Ethan',
        age: 32,
        occupation: 'Software Engineer',
        bio: 'Passionate about technology, hiking on weekends, and trying new craft beers. Looking for someone to share adventures with.',
        photo: 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=500',
        interests: ['Hiking', 'Technology', 'Craft Beer'],
        relationshipGoal: 'longTerm',
        gender: 'male',
        religion: 'none',
        ethnicity: 'white',
        height: 183
      },
      {
        id: '8d29f302-8d4b-4a13-9a6c-447c3d13f97c',
        name: 'Olivia',
        age: 26,
        occupation: 'Yoga Instructor',
        bio: 'Mindfulness enthusiast who loves nature, healthy cooking, and deep conversations. Seeking genuine connection.',
        photo: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=500',
        interests: ['Yoga', 'Cooking', 'Mindfulness'],
        relationshipGoal: 'longTerm',
        gender: 'female',
        religion: 'spiritual',
        ethnicity: 'mixed',
        height: 165
      },
      {
        id: 'e27f9d2c-d6a1-46f7-9d0e-4699b8df2535',
        name: 'Lucas',
        age: 30,
        occupation: 'Musician & Teacher',
        bio: 'Guitar player, music lover, and part-time teacher. Enjoys outdoor concerts and weekend road trips.',
        photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=500',
        interests: ['Music', 'Travel', 'Movies'],
        relationshipGoal: 'casual',
        gender: 'male',
        religion: 'christianity',
        ethnicity: 'hispanic',
        height: 178
      },
      {
        id: 'f1b7cc18-d810-43b1-b634-9e5c61e9212b',
        name: 'Emma',
        age: 27,
        occupation: 'Graphic Designer',
        bio: 'Creative soul with a passion for design, art museums, and trying new restaurants. Looking for someone who appreciates creativity.',
        photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=500',
        interests: ['Art', 'Design', 'Food'],
        relationshipGoal: 'longTerm',
        gender: 'female',
        religion: 'none',
        ethnicity: 'asian',
        height: 163
      }
    ];
    
    // Insert users and profiles
    const insertUsers = db.transaction((users: MockUser[]) => {
      for (const user of users) {
        // Simple password hashing - in a real app, use bcrypt
        const passwordHash = Buffer.from(user.password).toString('base64');
        
        userOperations.createUser.run(
          user.id,
          user.email,
          passwordHash
        );
      }
    });
    
    const insertProfiles = db.transaction((profiles: MockProfile[]) => {
      for (const profile of profiles) {
        profileOperations.upsertProfile.run(
          profile.id,
          profile.name,
          profile.photo,
          profile.bio,
          profile.age,
          profile.occupation,
          JSON.stringify(profile.interests),
          profile.relationshipGoal,
          profile.gender,
          profile.religion,
          profile.ethnicity,
          profile.height
        );
      }
    });
    
    // Execute transactions
    insertUsers(mockUsers);
    insertProfiles(mockProfiles);
    
    log('Initial data seeded successfully');
  } catch (error) {
    log('Error seeding initial data:', String(error));
  }
}

// Create a test user
function createTestUser(email: string, password: string) {
  try {
    const id = uuidv4();
    // Simple password hashing - in a real app, use bcrypt
    const passwordHash = Buffer.from(password).toString('base64');
    
    userOperations.createUser.run(id, email, passwordHash);
    return { id, email };
  } catch (error) {
    log('Error creating test user:', String(error));
    return null;
  }
}

// Export database and operations
export { 
  db, 
  initializeDatabase, 
  seedInitialData, 
  createTestUser,
  userOperations, 
  profileOperations, 
  swipeOperations,
  criteriaOperations 
}; 