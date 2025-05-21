# Deep Love - Dating App

## Overview

Deep Love is a playful matchmaking application that allows users to build a profile, define partner criteria, and see AI-generated best matches. It's a single-page application built with React and TypeScript, using a full-stack architecture with a mobile-first design approach.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

Deep Love employs a full-stack architecture with the following components:

### Frontend
- **Client Application**: A React 18 + TypeScript application built with Vite for fast development and optimized production builds
- **UI Framework**: Tailwind CSS for utility-based styling with a custom theme system
- **Component Library**: Shadcn UI components (based on Radix UI primitives) for accessible, reusable interface elements
- **Routing**: Wouter (a lightweight React Router alternative) for application navigation
- **State Management**: React Query for server state and React Context for global application state
- **Internationalization**: react-i18next for multi-language support

### Backend
- **Server**: Express.js server serving both the API and static frontend assets
- **Database**: Drizzle ORM with PostgreSQL (currently configured but not fully implemented)
- **Authentication**: Basic user authentication system (partially implemented)

### Data Flow
- Client-side routing and state management
- REST API endpoints for CRUD operations (currently minimal implementation)
- Local storage for persisting user data across sessions during development

## Key Components

### Frontend Components
1. **User Profile Creation** (`OnboardingScreen.tsx`)
   - Collect user details and preferences
   - Photo upload functionality
   
2. **Matching Criteria** (`CriteriaScreen.tsx`)
   - Age range selection
   - Hobby/interest selection
   - Relationship goal definition
   
3. **Match Discovery** (`MatchesScreen.tsx`, `SwipeDeck.tsx`)
   - Card-based swipe interface for accepting/rejecting matches
   - Match percentage calculation based on criteria
   
4. **Monetization** (`PaywallScreen.tsx`)
   - Free tier with limited daily swipes
   - Subscription options for unlimited usage

### Backend Components
1. **User Management**
   - User registration/authentication
   - Profile storage and retrieval
   
2. **Match Engine** (`matchEngine.ts`)
   - Algorithm for calculating compatibility between users
   - Currently using mock data but designed to be replaced with real user data

3. **Data Storage Layer** (`storage.ts`)
   - Interface for database operations
   - Currently implemented as in-memory storage for development

## Data Flow

1. **User Registration/Profile Creation**:
   - User enters profile details in the onboarding flow
   - Data is stored temporarily in local storage (will be persisted to database in production)

2. **Match Criteria Definition**:
   - User defines their preferences for potential matches
   - Criteria are stored alongside user profile

3. **Match Discovery**:
   - The match engine uses the user's criteria to find compatible profiles
   - Each potential match is assigned a compatibility percentage
   - Users can swipe on presented matches (with daily limits for free users)

4. **Paywall/Monetization**:
   - After reaching the daily swipe limit, users are presented with subscription options
   - Premium features unlock unlimited swipes

## External Dependencies

### Frontend Libraries
- React 18 ecosystem (React DOM, React Query)
- Radix UI component primitives
- Tailwind CSS for styling
- Wouter for routing
- react-i18next for internationalization

### Backend Libraries
- Express.js for the server
- Drizzle ORM for database operations
- NeonDB for serverless Postgres connectivity

### Development Tools
- Vite for development and build
- TypeScript for type safety
- ESBuild for server-side bundling

## Deployment Strategy

The application is configured for deployment on Replit with the following workflow:

1. **Development**: `npm run dev` starts both the frontend dev server and backend API
2. **Build**: `npm run build` compiles the frontend assets and bundles the server code
3. **Production**: `npm run start` runs the production server which serves both API and static assets

Database configuration is handled through environment variables, specifically `DATABASE_URL` which should point to a PostgreSQL instance. The application is set up for Replit's PostgreSQL module.

## Current Status and Next Steps

The application has a functional UI flow but needs further development in several areas:

1. **Backend Implementation**: Complete API routes and database integration
2. **Authentication**: Finish user authentication system
3. **Real Match Engine**: Replace mock data with actual matching algorithm
4. **Storage Layer**: Implement database persistence for user profiles and preferences
5. **Payment Processing**: Integrate actual payment gateway for subscriptions

The structure is in place to add these features incrementally while maintaining the existing user experience.