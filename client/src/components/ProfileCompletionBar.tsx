import { useEffect, useState } from 'react';
import { Progress } from './ui/progress';

interface ProfileCompletionBarProps {
  profile: {
    display_name?: string;
    avatar_url?: string;
    age?: number;
    bio?: string;
  };
}

const ProfileCompletionBar = ({ profile }: ProfileCompletionBarProps) => {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  
  // Calculate profile completion percentage with animation
  useEffect(() => {
    // Each field contributes 25% to the total
    const fields = ['display_name', 'avatar_url', 'age', 'bio'];
    const weightPerField = 25;
    
    // Calculate the actual completion percentage
    const actualPercentage = fields.reduce((score, field) => {
      return score + (profile[field as keyof typeof profile] ? weightPerField : 0);
    }, 0);
    
    // Animate from current percentage to actual percentage
    let startValue = completionPercentage;
    let endValue = actualPercentage;
    let duration = 1000; // ms
    let startTime: number | null = null;
    
    const animateProgress = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsedTime = timestamp - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);
      
      // Calculate the current value
      const currentValue = Math.round(startValue + (endValue - startValue) * easedProgress);
      setCompletionPercentage(currentValue);
      
      // Continue animation if not finished
      if (progress < 1) {
        requestAnimationFrame(animateProgress);
      }
    };
    
    // Start the animation
    requestAnimationFrame(animateProgress);
    
    // Cleanup function
    return () => {
      startTime = null;
    };
  }, [profile]);
  
  // Define colors based on completion percentage
  const getProgressColor = () => {
    if (completionPercentage < 30) return 'bg-red-500';
    if (completionPercentage < 60) return 'bg-yellow-500';
    if (completionPercentage < 90) return 'bg-blue-500';
    return 'bg-green-500';
  };
  
  return (
    <div className="w-full space-y-2 mb-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Profile Completion</h3>
        <span className="text-sm font-medium">{completionPercentage}%</span>
      </div>
      
      <div className="relative h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`absolute top-0 left-0 h-full ${getProgressColor()} transition-all duration-700 ease-out rounded-full`}
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>
      
      {completionPercentage < 100 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Complete your profile to increase your chances of finding matches!
        </p>
      )}
      
      {completionPercentage === 100 && (
        <p className="text-xs text-green-600 dark:text-green-400">
          Your profile is complete! 🎉
        </p>
      )}
    </div>
  );
};

export default ProfileCompletionBar;