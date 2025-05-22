import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Profile } from '../types';
import { track } from '../services/analytics';
import './SwipeAnimation.css';
import confettiSvg from '../assets/confetti.svg';

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
  const [swipeClass, setSwipeClass] = useState<'swipe-left' | 'swipe-right' | ''>('');
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
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
    
    // Update card position with better visual feedback
    const card = cardRefs.current[currentIndex];
    if (card) {
      // Apply transform with smooth rotation and scaling based on swipe distance
      card.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.08}deg) scale(${1 - Math.abs(deltaX) * 0.0005})`;
      
      // Add tilt effect based on drag distance for more natural feel
      const tiltY = Math.min(Math.max(deltaX * 0.05, -10), 10);
      card.style.boxShadow = `0 ${5 + Math.abs(deltaX * 0.05)}px ${20 + Math.abs(deltaX * 0.1)}px rgba(0, 0, 0, ${0.1 + Math.abs(deltaX) * 0.0005})`;
      
      // Update swipe direction visual indicator with classes for better styling
      if (deltaX > 50) {
        setSwipeDirection('right');
        setSwipeClass('swipe-right');
      } else if (deltaX < -50) {
        setSwipeDirection('left');
        setSwipeClass('swipe-left');
      } else {
        setSwipeDirection(null);
        setSwipeClass('');
      }
      
      // Apply haptic feedback effect when crossing thresholds
      if ((deltaX > 0 && deltaX > 100) || (deltaX < 0 && deltaX < -100)) {
        card.classList.add('swipe-haptic');
        setTimeout(() => {
          card.classList.remove('swipe-haptic');
        }, 150);
      }
    }
  };

  // Show match animation popup
  const showMatchPopup = (profile: Profile) => {
    setMatchedProfile(profile);
    setShowMatchAnimation(true);
    
    // Automatically hide the match animation after a delay
    setTimeout(() => {
      setShowMatchAnimation(false);
      setMatchedProfile(null);
    }, 4000);
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
        
        // Add enhanced animation classes
        card.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        card.style.transform = `translateX(${window.innerWidth * 1.5}px) rotate(${30 + Math.random() * 10}deg)`;
        card.style.opacity = '0';
        
        setTimeout(() => {
          // Track the swipe right event
          track('swipe', { 
            direction: 'right', 
            profileId: profiles[currentIndex].id,
            matchPercentage: profiles[currentIndex].matchPercentage
          });
            
          // Show match animation if percentage is high
          if (profiles[currentIndex].matchPercentage > 80) {
            track('match', { 
              profileId: profiles[currentIndex].id,
              matchPercentage: profiles[currentIndex].matchPercentage 
            });
            
            // Trigger the match animation
            showMatchPopup(profiles[currentIndex]);
          }
          
          onSwipeRight(profiles[currentIndex].id);
          setCurrentIndex(prevIndex => prevIndex + 1);
          
          // Apply stack effect to reveal next card with animation
          if (currentIndex + 1 < profiles.length) {
            const nextCard = cardRefs.current[currentIndex + 1];
            if (nextCard) {
              nextCard.classList.add('card-stack-effect');
            }
          }
        }, 300);
      } else if (deltaX < -threshold) {
        // Swipe left - complete animation and trigger callback
        card.classList.add('swiped-left');
        
        // Add enhanced animation classes
        card.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        card.style.transform = `translateX(${-window.innerWidth * 1.5}px) rotate(${-30 - Math.random() * 10}deg)`;
        card.style.opacity = '0';
        
        setTimeout(() => {
          // Track the swipe left event
          track('swipe', { 
            direction: 'left', 
            profileId: profiles[currentIndex].id,
            matchPercentage: profiles[currentIndex].matchPercentage
          });
          
          onSwipeLeft(profiles[currentIndex].id);
          setCurrentIndex(prevIndex => prevIndex + 1);
          
          // Apply stack effect to reveal next card with animation
          if (currentIndex + 1 < profiles.length) {
            const nextCard = cardRefs.current[currentIndex + 1];
            if (nextCard) {
              nextCard.classList.add('card-stack-effect');
            }
          }
        }, 300);
      } else {
        // Reset card position if no swipe with a smooth spring effect
        card.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        card.style.transform = '';
        card.style.boxShadow = '';
        setTimeout(() => {
          card.style.transition = '';
        }, 500);
      }
    }
    
    setIsSwipeActive(false);
    setSwipeDirection(null);
    setSwipeClass('');
  };

  // Handle swipe with buttons
  const handleButtonSwipe = (direction: 'left' | 'right') => {
    if (currentIndex >= profiles.length) return;
    
    const card = cardRefs.current[currentIndex];
    if (card) {
      // Apply appropriate swipe class for visual feedback
      setSwipeClass(direction === 'left' ? 'swipe-left' : 'swipe-right');
      
      if (direction === 'left') {
        // Enhance button swipe left animation
        card.classList.add('swipe-haptic');
        card.classList.add('swiped-left');
        
        // Add enhanced animation 
        card.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        card.style.transform = `translateX(${-window.innerWidth * 1.5}px) rotate(${-30 - Math.random() * 10}deg)`;
        card.style.opacity = '0';
        
        setTimeout(() => {
          // Track button swipe left
          track('swipe', { 
            direction: 'left', 
            method: 'button',
            profileId: profiles[currentIndex].id,
            matchPercentage: profiles[currentIndex].matchPercentage
          });
          
          onSwipeLeft(profiles[currentIndex].id);
          setCurrentIndex(prevIndex => prevIndex + 1);
          setSwipeClass('');
          
          // Apply stack effect to next card
          if (currentIndex + 1 < profiles.length) {
            const nextCard = cardRefs.current[currentIndex + 1];
            if (nextCard) {
              nextCard.classList.add('card-stack-effect');
            }
          }
        }, 500);
      } else {
        // Enhance button swipe right animation
        card.classList.add('swipe-haptic');
        card.classList.add('swiped-right');
        
        // Add enhanced animation
        card.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        card.style.transform = `translateX(${window.innerWidth * 1.5}px) rotate(${30 + Math.random() * 10}deg)`;
        card.style.opacity = '0';
        
        setTimeout(() => {
          // Track button swipe right
          track('swipe', { 
            direction: 'right', 
            method: 'button',
            profileId: profiles[currentIndex].id,
            matchPercentage: profiles[currentIndex].matchPercentage
          });
          
          // Track match event and show animation if percentage is high
          if (profiles[currentIndex].matchPercentage > 80) {
            track('match', { 
              profileId: profiles[currentIndex].id,
              matchPercentage: profiles[currentIndex].matchPercentage,
              method: 'button'
            });
            
            // Show match animation
            showMatchPopup(profiles[currentIndex]);
          }
          
          onSwipeRight(profiles[currentIndex].id);
          setCurrentIndex(prevIndex => prevIndex + 1);
          setSwipeClass('');
          
          // Apply stack effect to next card
          if (currentIndex + 1 < profiles.length) {
            const nextCard = cardRefs.current[currentIndex + 1];
            if (nextCard) {
              nextCard.classList.add('card-stack-effect');
            }
          }
        }, 500);
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

      {/* Enhanced Swipe Indicators */}
      <div className={`absolute top-40 left-8 nope-badge ${swipeClass === 'swipe-left' ? 'opacity-100' : ''}`}>
        NOPE
      </div>
      
      <div className={`absolute top-40 right-8 like-badge ${swipeClass === 'swipe-right' ? 'opacity-100' : ''}`}>
        LIKE
      </div>
      
      {/* Match Animation Popup */}
      {showMatchAnimation && matchedProfile && (
        <div className="match-animation">
          <div className="match-animation-content">
            <img src={confettiSvg} alt="Confetti" className="confetti" />
            <h2 className="match-title">{t('matches.itsAMatch', 'It\'s a Match!')}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {t('matches.matchDescription', 'You and {{name}} liked each other!', { name: matchedProfile.name })}
            </p>
            <div className="mt-4 mb-6 flex justify-center items-center">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary mr-2">
                <img 
                  src={matchedProfile.photo} 
                  alt={matchedProfile.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-5xl mx-2">💕</div>
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary ml-2 bg-gray-300">
                <div className="w-full h-full flex items-center justify-center text-3xl">
                  👤
                </div>
              </div>
            </div>
            <div className="match-percentage">{matchedProfile.matchPercentage}%</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {t('matches.matchMessage', 'Based on your preferences, you\'re a great match!')}
            </p>
            <div className="flex space-x-3 justify-center">
              <button 
                onClick={() => setShowMatchAnimation(false)}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {t('matches.keepSwiping', 'Keep Swiping')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwipeDeck;
