import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface ProfileCompletionBarProps {
  profile: {
    display_name?: string;
    avatar_url?: string;
    age?: number;
    bio?: string;
    occupation?: string;
    interests?: string[];
    relationship_goal?: string;
    gender?: string;
    religion?: string;
    ethnicity?: string;
    height?: number;
  };
}

const ProfileCompletionBar = ({ profile }: ProfileCompletionBarProps) => {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  
  // Calculate profile completion percentage
  useEffect(() => {
    const requiredFields = ['display_name', 'avatar_url', 'age', 'bio'];
    const optionalFields = ['occupation', 'interests', 'relationship_goal', 'gender', 'religion', 'ethnicity', 'height'];
    
    // Required fields count double (10% each)
    const requiredWeight = 10;
    // Optional fields count as 5% each
    const optionalWeight = 5;
    
    // Calculate score for required fields
    const requiredScore = requiredFields.reduce((score, field) => {
      return score + (profile[field as keyof typeof profile] ? requiredWeight : 0);
    }, 0);
    
    // Calculate score for optional fields
    const optionalScore = optionalFields.reduce((score, field) => {
      // For arrays, check if they have at least one item
      if (field === 'interests') {
        return score + (profile[field as keyof typeof profile] && 
                       (profile[field as keyof typeof profile] as string[]).length > 0 ? 
                       optionalWeight : 0);
      }
      return score + (profile[field as keyof typeof profile] ? optionalWeight : 0);
    }, 0);
    
    // Calculate total percentage (max 100%)
    const totalPercentage = Math.min(100, requiredScore + optionalScore);
    
    // Animate the completion bar
    setCompletionPercentage(totalPercentage);
  }, [profile]);
  
  // Define gradient colors based on completion
  const getProgressColor = () => {
    if (completionPercentage < 30) return 'from-red-500 to-red-400';
    if (completionPercentage < 60) return 'from-yellow-500 to-yellow-400';
    if (completionPercentage < 90) return 'from-blue-500 to-blue-400';
    return 'from-green-500 to-green-400';
  };
  
  return (
    <div className="w-full space-y-2 mb-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Profile Completion</h3>
        <span className="text-sm font-medium">{completionPercentage}%</span>
      </div>
      
      <div className="relative">
        <Progress value={completionPercentage} className={`h-3 bg-gray-100 dark:bg-gray-800`} />
        <motion.div 
          className={`absolute inset-0 h-3 bg-gradient-to-r ${getProgressColor()} rounded-full`}
          initial={{ width: '0%' }}
          animate={{ width: `${completionPercentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
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