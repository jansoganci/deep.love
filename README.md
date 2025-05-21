# Deep Love

A playful matchmaking app that allows users to build a profile, pick partner criteria, and see AI-generated best matches.

## Setup & Installation

To get started with the project, follow these steps:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `localhost:3000` by default.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (mobile-first utility classes)
- **State & routing**: Wouter (React Router DOM replacement)
- **Internationalization**: react-i18next
- **Analytics**: PostHog for event tracking
- **Backend**: Express.js (lightweight for serving static assets)

## Project Structure

```
client/src/
├── assets/         # Static assets (images, etc.)
├── components/     # Reusable UI components
│   └── ui/         # shadcn UI component library
├── constants/      # Application constants and feature flags
├── hooks/          # Custom React hooks
├── i18n/           # Internationalization resources
├── lib/            # Utility functions and libraries
├── pages/          # Top-level page components
├── screens/        # Main application screens
├── services/       # Service layer (API, analytics, storage)
└── types/          # TypeScript type definitions
```

## Environment Variables

The application uses the following environment variables:

- `VITE_PH_PROJECT_KEY` - PostHog analytics project key
- `VITE_POSTHOG_HOST` - PostHog host URL (optional, defaults to app.posthog.com)

## Features

- **User Profile Creation**: Create and customize your dating profile
- **Matching Criteria**: Define your preferences for potential matches
- **Swipe Interface**: Swipe right to like, left to pass
- **Freemium Model**: Free tier with limited daily swipes, premium for unlimited
- **Internationalization**: Support for multiple languages (English, Turkish)
- **Analytics**: Track user engagement and interaction patterns
- **Dark Mode**: Support for light and dark themes

## Mobile Platform Support

This application was designed with a mobile-first approach and can be ported to native platforms with minimal changes:

### iOS (via React Native + Expo)
- Use React Native components instead of DOM elements
- Replace touch handlers with React Native Gesture Handler
- Adapt CSS styles to React Native style objects
- Replace routing with React Navigation

### Environment Setup for Mobile
- Require additional environment configuration for mobile analytics

## Development Guidelines

- Follow mobile-first design principles
- Use feature flags for experimental features
- Follow the established folder structure
- Add analytics tracking for new user interactions
- Ensure all components support dark mode

