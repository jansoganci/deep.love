import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Profile } from '../types';
import { track } from '../services/analytics';

interface SwipeDeckProps {
  profiles: Profile[];
  onSwipeLeft: (profileId: string) => void;
  onSwipeRight: (profileId: string) => void;
  onEmpty: () => void;
}

const SwipeDeck = ({ profiles, onSwipeLeft, onSwipeRight, onEmpty }: SwipeDeckProps) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Set up refs array for cards
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, profiles.length);
  }, [profiles]);

  // Check if we're out of profiles
  useEffect(() => {
    if (currentIndex >= profiles.length && profiles.length > 0) {
      onEmpty();
    }
  }, [currentIndex, profiles, onEmpty]);

  // Handle touch/mouse start
  const handleSwipeStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (currentIndex >= profiles.length) return;
    
    // Get start position
    if ('touches' in e) {
      startXRef.current = e.touches[0].clientX;
    } else {
      startXRef.current = e.clientX;
    }
    
    currentXRef.current = startXRef.current;
    setIsSwipeActive(true);
  };

  // Handle touch/mouse move
  const handleSwipeMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isSwipeActive || currentIndex >= profiles.length) return;
    
    // Get current position
    let currentX: number;
    if ('touches' in e) {
      currentX = e.touches[0].clientX;
    } else {
      currentX = e.clientX;
    }
    
    currentXRef.current = currentX;
    
    // Calculate movement distance
    const deltaX = currentX - startXRef.current;
    
    // Update card position
    const card = cardRefs.current[currentIndex];
    if (card) {
      card.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.1}deg)`;
      
      // Update swipe direction visual indicator
      if (deltaX > 50) {
        setSwipeDirection('right');
      } else if (deltaX < -50) {
        setSwipeDirection('left');
      } else {
        setSwipeDirection(null);
      }
    }
  };

  // Handle touch/mouse end
  const handleSwipeEnd = () => {
    if (!isSwipeActive || currentIndex >= profiles.length) return;
    
    const card = cardRefs.current[currentIndex];
    if (card) {
      // Calculate movement distance
      const deltaX = currentXRef.current - startXRef.current;
      
      // Threshold for a swipe
      const threshold = 100;
      
      if (deltaX > threshold) {
        // Swipe right - complete animation and trigger callback
        card.classList.add('swiped-right');
        setTimeout(() => {
          // Track the swipe right event
          track('swipe', { 
            direction: 'right', 
            profileId: profiles[currentIndex].id,
            matchPercentage: profiles[currentIndex].matchPercentage
          });
            
          // Track match event if percentage is high
          if (profiles[currentIndex].matchPercentage > 80) {
            track('match', { 
              profileId: profiles[currentIndex].id,
              matchPercentage: profiles[currentIndex].matchPercentage 
            });
          }
          
          onSwipeRight(profiles[currentIndex].id);
          setCurrentIndex(prevIndex => prevIndex + 1);
        }, 300);
      } else if (deltaX < -threshold) {
        // Swipe left - complete animation and trigger callback
        card.classList.add('swiped-left');
        setTimeout(() => {
          // Track the swipe left event
          track('swipe', { 
            direction: 'left', 
            profileId: profiles[currentIndex].id,
            matchPercentage: profiles[currentIndex].matchPercentage
          });
          
          onSwipeLeft(profiles[currentIndex].id);
          setCurrentIndex(prevIndex => prevIndex + 1);
        }, 300);
      } else {
        // Reset card position if no swipe
        card.style.transform = '';
      }
    }
    
    setIsSwipeActive(false);
    setSwipeDirection(null);
  };

  // Handle swipe with buttons
  const handleButtonSwipe = (direction: 'left' | 'right') => {
    if (currentIndex >= profiles.length) return;
    
    const card = cardRefs.current[currentIndex];
    if (card) {
      if (direction === 'left') {
        card.classList.add('swiped-left');
        setTimeout(() => {
          onSwipeLeft(profiles[currentIndex].id);
          setCurrentIndex(prevIndex => prevIndex + 1);
        }, 300);
      } else {
        card.classList.add('swiped-right');
        setTimeout(() => {
          onSwipeRight(profiles[currentIndex].id);
          setCurrentIndex(prevIndex => prevIndex + 1);
        }, 300);
      }
    }
  };

  return (
    <div className="relative h-[480px] w-full mb-6">
      <div 
        className="w-full h-full"
        onMouseDown={handleSwipeStart}
        onMouseMove={handleSwipeMove}
        onMouseUp={handleSwipeEnd}
        onMouseLeave={handleSwipeEnd}
        onTouchStart={handleSwipeStart}
        onTouchMove={handleSwipeMove}
        onTouchEnd={handleSwipeEnd}
      >
        {profiles.map((profile, index) => (
          <div
            key={profile.id}
            ref={el => cardRefs.current[index] = el}
            className={`swipe-card rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-800 ${
              index < currentIndex ? 'hidden' : ''
            }`}
            style={{ zIndex: profiles.length - index }}
          >
            <div 
              className="h-[350px] w-full bg-cover bg-center" 
              style={{ backgroundImage: `url('${profile.photo}')` }}
              aria-label={`Photo of ${profile.name}`}
            ></div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{profile.name}, {profile.age}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{profile.occupation}</p>
                </div>
                <span className="bg-secondary/20 text-secondary px-2 py-1 rounded text-xs font-medium">
                  {t('matches.match', { percentage: profile.matchPercentage })}
                </span>
              </div>
              <p className="mt-2 text-sm">{profile.bio}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {profile.interests.map((interest, idx) => (
                  <span key={idx} className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {currentIndex >= profiles.length && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-center text-gray-500 dark:text-gray-400">{t('matches.noMatches')}</p>
          </div>
        )}
      </div>
      
      {/* Swipe Buttons */}
      <div className="flex justify-center mt-4 space-x-4">
        <button 
          className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => handleButtonSwipe('left')}
          aria-label="Dislike"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button 
          className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => handleButtonSwipe('right')}
          aria-label="Like"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Swipe Direction Indicator */}
      {swipeDirection === 'left' && (
        <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 -translate-x-1/2 bg-error/80 text-white text-2xl font-bold rounded-full p-6 rotate-[-20deg]">
          NOPE
        </div>
      )}
      
      {swipeDirection === 'right' && (
        <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2 translate-x-1/2 bg-success/80 text-white text-2xl font-bold rounded-full p-6 rotate-[20deg]">
          LIKE
        </div>
      )}
    </div>
  );
};

export default SwipeDeck;
