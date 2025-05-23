// PostHog Analytics Integration
import posthog from 'posthog-js';

// Initialize PostHog with environment variable or placeholder
// In production, this should be set as an environment variable
const POSTHOG_KEY = import.meta.env.VITE_PH_PROJECT_KEY || 'phc_placeholder';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

// Initialize PostHog
export const initAnalytics = () => {
  try {
    // Skip PostHog initialization in development mode
    if (import.meta.env.DEV) {
      console.log('PostHog analytics disabled in development mode');
      return;
    }
    
    // Verify PostHog key is provided and valid
    if (!POSTHOG_KEY || POSTHOG_KEY === 'phc_placeholder') {
      console.warn('PostHog key not configured. Analytics will be disabled.');
      return;
    }
    
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      loaded: (posthog) => {
        console.log('PostHog analytics initialized successfully');
      },
      capture_pageview: false // We'll handle this manually
    });
    
    // Capture initial pageview
    posthog.capture('$pageview');
    
  } catch (error) {
    console.error('Failed to initialize PostHog:', error);
  }
};

// Track an event
export const track = (eventName: string, properties?: Record<string, any>) => {
  try {
    // Skip tracking in development mode
    if (import.meta.env.DEV) {
      console.log(`[DEV Analytics] Tracked: ${eventName}`, properties);
      return;
    }
    
    // Check if PostHog is initialized
    if (!posthog.__loaded) {
      console.warn(`Analytics not initialized. Event not tracked: ${eventName}`);
      return;
    }
    
    posthog.capture(eventName, properties);
  } catch (error) {
    console.error(`Failed to track event ${eventName}:`, error);
  }
};

// Call this to reset user identification when user logs out
export const resetAnalytics = () => {
  try {
    // Skip in development mode
    if (import.meta.env.DEV) {
      console.log('[DEV Analytics] Reset analytics');
      return;
    }
    
    // Check if PostHog is initialized
    if (!posthog.__loaded) {
      return;
    }
    
    posthog.reset();
  } catch (error) {
    console.error('Failed to reset analytics:', error);
  }
};

// Identify a user
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  try {
    // Skip in development mode
    if (import.meta.env.DEV) {
      console.log(`[DEV Analytics] User identified: ${userId}`);
      return;
    }
    
    // Check if PostHog is initialized
    if (!posthog.__loaded) {
      console.warn(`Analytics not initialized. User not identified: ${userId}`);
      return;
    }
    
    posthog.identify(userId, traits);
  } catch (error) {
    console.error('Failed to identify user:', error);
  }
};