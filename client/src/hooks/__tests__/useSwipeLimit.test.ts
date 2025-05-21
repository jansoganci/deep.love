import { renderHook, act } from '@testing-library/react-hooks';
import { useSwipeLimit, DAILY_LIMIT } from '../useSwipeLimit';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('useSwipeLimit', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
    
    // Mock the date to ensure consistent test results
    const mockDate = new Date('2023-05-01');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as Date);
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  it('should correctly track and limit daily swipes', () => {
    // Initialize the hook
    const { result } = renderHook(() => useSwipeLimit());
    
    // Initially should have full daily limit available
    expect(result.current.swipesLeft).toBe(DAILY_LIMIT);
    
    // Register swipes and check remaining count
    for (let i = 1; i <= DAILY_LIMIT; i++) {
      act(() => {
        result.current.registerSwipe();
      });
      
      const expected = Math.max(0, DAILY_LIMIT - i);
      expect(result.current.swipesLeft).toBe(expected);
    }
    
    // After reaching the limit, should have 0 swipes left
    expect(result.current.swipesLeft).toBe(0);
    
    // Additional swipes shouldn't change the count
    act(() => {
      result.current.registerSwipe();
    });
    expect(result.current.swipesLeft).toBe(0);
    
    // Test the midnight reset
    // Change the mock date to the next day
    const nextDay = new Date('2023-05-02');
    jest.spyOn(global, 'Date').mockImplementation(() => nextDay as unknown as Date);
    
    // Call resetMidnight to simulate day change
    act(() => {
      result.current.resetMidnight();
    });
    
    // Should have full daily limit again
    expect(result.current.swipesLeft).toBe(DAILY_LIMIT);
  });
});