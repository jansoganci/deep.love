import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { UserCriteria } from '../types';
import { saveUserCriteria } from '../services/storage';

// List of available hobbies
const HOBBIES = [
  'Cooking', 'Travel', 'Photography', 'Music', 'Sports',
  'Reading', 'Movies', 'Hiking', 'Gaming', 'Art'
];

// Relationship goals
const GOALS = [
  'casual', 'longTerm', 'marriage', 'friendship'
];

const CriteriaScreen = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 40]);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  
  // Update age range (min)
  const handleMinAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minAge = parseInt(e.target.value, 10);
    setAgeRange([minAge, Math.max(minAge, ageRange[1])]);
  };
  
  // Update age range (max)
  const handleMaxAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxAge = parseInt(e.target.value, 10);
    setAgeRange([Math.min(ageRange[0], maxAge), maxAge]);
  };
  
  // Toggle hobby selection
  const toggleHobby = (hobby: string) => {
    if (selectedHobbies.includes(hobby)) {
      setSelectedHobbies(selectedHobbies.filter(h => h !== hobby));
    } else {
      setSelectedHobbies([...selectedHobbies, hobby]);
    }
  };
  
  // Handle relationship goal selection
  const selectGoal = (goal: string) => {
    setSelectedGoal(goal);
  };
  
  // Submit criteria
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (selectedHobbies.length === 0) {
      alert('Please select at least one hobby');
      return;
    }
    
    if (!selectedGoal) {
      alert('Please select a relationship goal');
      return;
    }
    
    // Create user criteria
    const userCriteria: UserCriteria = {
      ageRange,
      hobbies: selectedHobbies,
      relationshipGoal: selectedGoal,
    };
    
    // Save to local storage
    saveUserCriteria(userCriteria);
    
    // Navigate to matches screen
    setLocation('/matches');
  };
  
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2">{t('criteria.title')}</h1>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-8">{t('criteria.subtitle')}</p>
      
      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Age Range Slider */}
        <div>
          <label className="block text-sm font-medium mb-3">{t('criteria.ageRangeLabel')}</label>
          <div className="mb-2">
            <span className="text-sm font-medium">{ageRange[0]} - {ageRange[1]}</span>
          </div>
          <div className="relative pt-1">
            <input 
              type="range" 
              min="18" 
              max="100" 
              value={ageRange[0]} 
              onChange={handleMinAgeChange}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" 
            />
            <input 
              type="range" 
              min="18" 
              max="100" 
              value={ageRange[1]} 
              onChange={handleMaxAgeChange}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer mt-4" 
            />
          </div>
        </div>
        
        {/* Hobbies/Interests Multi-select */}
        <div>
          <label className="block text-sm font-medium mb-3">{t('criteria.hobbiesLabel')}</label>
          <div className="flex flex-wrap gap-2">
            {HOBBIES.map(hobby => (
              <button 
                key={hobby}
                type="button" 
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedHobbies.includes(hobby) 
                    ? 'bg-primary text-white border border-primary hover:bg-primary-dark' 
                    : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                onClick={() => toggleHobby(hobby)}
              >
                {hobby}
              </button>
            ))}
          </div>
        </div>
        
        {/* Relationship Goals */}
        <div>
          <label className="block text-sm font-medium mb-3">{t('criteria.goalsLabel')}</label>
          <div className="grid grid-cols-2 gap-3">
            {GOALS.map(goal => (
              <button 
                key={goal}
                type="button" 
                className={`text-sm border ${
                  selectedGoal === goal
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary`}
                onClick={() => selectGoal(goal)}
              >
                {t(`criteria.goals.${goal}`)}
              </button>
            ))}
          </div>
        </div>
        
        <button 
          type="submit"
          className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition font-medium"
        >
          {t('criteria.findMatches')}
        </button>
      </form>
    </div>
  );
};

export default CriteriaScreen;
