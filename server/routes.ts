import { Server } from "http";
import { Express, Request, Response } from "express";
import { log } from "./vite";
import { 
  userOperations, 
  profileOperations, 
  swipeOperations,
  criteriaOperations,
  createTestUser 
} from "./database";
import { v4 as uuidv4 } from 'uuid';

// Define user session type
declare module 'express-session' {
  interface SessionData {
    userId: string;
    userEmail: string;
    isAuthenticated: boolean;
  }
}

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: any) => {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // Authentication endpoints
  // Register new user
  app.post('/api/auth/signup', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      // Check if user already exists
      const existingUser = userOperations.getUserByEmail.get(email);
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }
      
      // Create user
      const userId = uuidv4();
      const passwordHash = Buffer.from(password).toString('base64');
      
      userOperations.createUser.run(userId, email, passwordHash);
      
      // Set session
      req.session.userId = userId;
      req.session.userEmail = email;
      req.session.isAuthenticated = true;
      
      res.status(201).json({ 
        user: { 
          id: userId, 
          email 
        } 
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Error creating user' });
    }
  });
  
  // Login user
  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      // Find user
      const user = userOperations.getUserByEmail.get(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Check password
      const passwordHash = Buffer.from(password).toString('base64');
      if (user.password_hash !== passwordHash) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Set session
      req.session.userId = user.id;
      req.session.userEmail = user.email;
      req.session.isAuthenticated = true;
      
      res.json({ 
        user: { 
          id: user.id, 
          email: user.email 
        } 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error logging in' });
    }
  });
  
  // Logout user
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Error logging out' });
      }
      
      res.json({ message: 'Logged out successfully' });
    });
  });
  
  // Get current user
  app.get('/api/auth/user', isAuthenticated, (req: Request, res: Response) => {
    const { userId, userEmail } = req.session;
    
    res.json({
      user: {
        id: userId,
        email: userEmail
      }
    });
  });
  
  // Profile endpoints
  // Get user profile
  app.get('/api/profiles/:id', isAuthenticated, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const profile = profileOperations.getProfileById.get(id);
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      
      // Parse interests JSON
      if (profile.interests) {
        try {
          profile.interests = JSON.parse(profile.interests);
        } catch (e) {
          profile.interests = [];
        }
      }
      
      res.json({ profile });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Error getting profile' });
    }
  });
  
  // Update user profile
  app.put('/api/profiles/:id', isAuthenticated, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { 
        display_name, 
        avatar_url, 
        bio, 
        age, 
        occupation, 
        interests, 
        relationship_goal,
        gender,
        religion,
        ethnicity,
        height
      } = req.body;
      
      // Check if profile exists
      const existingProfile = profileOperations.getProfileById.get(id);
      if (!existingProfile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      
      // Check if user is updating their own profile
      if (id !== req.session.userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      // Update profile
      profileOperations.upsertProfile.run(
        id,
        display_name,
        avatar_url,
        bio,
        age,
        occupation,
        Array.isArray(interests) ? JSON.stringify(interests) : interests,
        relationship_goal,
        gender,
        religion,
        ethnicity,
        height
      );
      
      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Error updating profile' });
    }
  });
  
  // Get potential matches
  app.get('/api/matches', isAuthenticated, (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      const profiles = profileOperations.getProfiles.all(userId, limit);
      
      // Parse interests JSON for all profiles
      const formattedProfiles = profiles.map((profile: any) => {
        if (profile.interests) {
          try {
            profile.interests = JSON.parse(profile.interests);
          } catch (e) {
            profile.interests = [];
          }
        }
        return {
          id: profile.id,
          name: profile.display_name,
          age: profile.age,
          occupation: profile.occupation || 'Unknown',
          bio: profile.bio || '',
          photo: profile.avatar_url,
          interests: profile.interests || [],
          relationshipGoal: profile.relationship_goal || 'casual',
          gender: profile.gender,
          religion: profile.religion || 'none',
          ethnicity: profile.ethnicity || 'none',
          height: profile.height,
          matchPercentage: Math.floor(Math.random() * 50) + 50 // Random match percentage for now
        };
      });
      
      res.json({ profiles: formattedProfiles });
    } catch (error) {
      console.error('Get matches error:', error);
      res.status(500).json({ message: 'Error getting matches' });
    }
  });
  
  // Record a swipe
  app.post('/api/swipes', isAuthenticated, (req: Request, res: Response) => {
    try {
      const { to_id, direction } = req.body;
      const from_id = req.session.userId;
      
      if (!to_id || !direction || !['left', 'right'].includes(direction)) {
        return res.status(400).json({ message: 'Invalid swipe data' });
      }
      
      // Record swipe
      swipeOperations.recordSwipe.run(from_id, to_id, direction);
      
      // If swiped right, check for match
      let isMatch = false;
      if (direction === 'right') {
        const match = swipeOperations.checkMatch.get(to_id, from_id);
        isMatch = !!match;
      }
      
      res.json({ 
        success: true, 
        isMatch 
      });
    } catch (error) {
      console.error('Record swipe error:', error);
      res.status(500).json({ message: 'Error recording swipe' });
    }
  });

  // Criteria endpoints
  // Get user criteria
  app.get('/api/criteria', isAuthenticated, (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      
      const criteria = criteriaOperations.getCriteriaByUserId.get(userId);
      if (!criteria) {
        return res.status(404).json({ message: 'Criteria not found' });
      }
      
      // Parse hobbies JSON if exists
      if (criteria.hobbies) {
        try {
          criteria.hobbies = JSON.parse(criteria.hobbies);
        } catch (e) {
          criteria.hobbies = [];
        }
      }
      
      res.json({ criteria });
    } catch (error) {
      console.error('Get criteria error:', error);
      res.status(500).json({ message: 'Error getting criteria' });
    }
  });

  // Create or update user criteria
  app.post('/api/criteria', isAuthenticated, (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      const {
        age_min,
        age_max,
        gender,
        distance_km,
        education,
        occupation,
        religion,
        ethnicity,
        hobbies,
        relationship_goal,
        height_cm
      } = req.body;
      
      // Validate required fields
      if (age_min === undefined || age_max === undefined) {
        return res.status(400).json({ message: 'Age range is required' });
      }
      
      // Save criteria
      criteriaOperations.upsertCriteria.run(
        userId,
        age_min,
        age_max,
        gender,
        distance_km,
        education,
        occupation,
        religion,
        ethnicity,
        Array.isArray(hobbies) ? JSON.stringify(hobbies) : hobbies,
        relationship_goal,
        height_cm
      );
      
      res.json({ message: 'Criteria saved successfully' });
    } catch (error) {
      console.error('Save criteria error:', error);
      res.status(500).json({ message: 'Error saving criteria' });
    }
  });

  return app as any;
}
