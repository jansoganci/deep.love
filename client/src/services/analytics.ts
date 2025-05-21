// PostHog Analytics Integration
import posthog from 'posthog-js';

// Initialize PostHog with environment variable or placeholder
// In production, this should be set as an environment variable
const POSTHOG_KEY = import.meta.env.VITE_PH_PROJECT_KEY || 'PH_PROJECT_KEY';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

// Initialize PostHog
export const initAnalytics = () => {
  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      loaded: (posthog) => {
        if (import.meta.env.DEV) {
          // Disable capturing in development
          posthog.opt_out_capturing();
        }
      }
    });
    console.log('PostHog analytics initialized');
  } catch (error) {
    console.error('Failed to initialize PostHog:', error);
  }
};

// Track an event
export const track = (eventName: string, properties?: Record<string, any>) => {
  try {
    posthog.capture(eventName, properties);
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Tracked: ${eventName}`, properties);
    }
  } catch (error) {
    console.error(`Failed to track event ${eventName}:`, error);
  }
};

// Call this to reset user identification when user logs out
export const resetAnalytics = () => {
  try {
    posthog.reset();
    console.log('Analytics reset');
  } catch (error) {
    console.error('Failed to reset analytics:', error);
  }
};

// Identify a user
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  try {
    posthog.identify(userId, traits);
    console.log(`User identified: ${userId}`);
  } catch (error) {
    console.error('Failed to identify user:', error);
  }
};