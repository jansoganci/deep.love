import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import * as api from '../services/api';

const OnboardingScreen = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  // Handle file input change
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim() || !age.trim() || !bio.trim()) {
      toast({
        title: "Error",
        description: "Please fill out all fields",
        variant: "destructive"
      });
      return;
    }
    
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      toast({
        title: "Error",
        description: "Please enter a valid age between 18 and 100",
        variant: "destructive"
      });
      return;
    }
    
    if (!photoPreview || !photoFile) {
      toast({
        title: "Error",
        description: "Please upload a profile photo",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You need to be logged in to create a profile",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // For now, we'll use the base64 data URL as the avatar URL
      // In the future, we can implement a proper file upload endpoint
      const avatarUrl = photoPreview;
      
      // Create/update user profile using our backend API
      const profileData = {
        name: name.trim(),
        photo: avatarUrl,
        age: ageNum,
        bio: bio.trim(),
        occupation: '', // Will be filled later
        interests: [], // Will be filled later
        relationshipGoal: 'casual', // Default value
        gender: '', // Will be filled later
        religion: 'none', // Default value
        ethnicity: 'none', // Default value
        height: null // Will be filled later
      };
      
      await api.updateProfile(user.id, profileData);
      
      toast({
        title: "Success",
        description: "Profile created successfully"
      });
      
      // Redirect to criteria page
      setLocation('/criteria');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2">{t('onboarding.title')}</h1>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-8">{t('onboarding.subtitle')}</p>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Profile Photo Upload */}
        <div className="flex flex-col items-center">
          <div 
            className="w-40 h-40 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden relative mb-4"
          >
            {photoPreview ? (
              <img 
                src={photoPreview} 
                alt="Profile preview" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <button 
            type="button"
            onClick={handleUploadClick}
            className="cursor-pointer bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition"
          >
            {t('onboarding.uploadPhoto')}
          </button>
          <input 
            ref={fileInputRef}
            id="profile-upload" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handlePhotoChange}
          />
        </div>
        
        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            {t('onboarding.nameLabel')}
          </label>
          <input 
            id="name" 
            type="text" 
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-800" 
            placeholder={t('onboarding.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        {/* Age Input */}
        <div>
          <label htmlFor="age" className="block text-sm font-medium mb-1">
            {t('onboarding.ageLabel')}
          </label>
          <input 
            id="age" 
            type="number" 
            min="18" 
            max="100" 
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-800" 
            placeholder={t('onboarding.agePlaceholder')}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>
        
        {/* Bio Input */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-1">
            {t('onboarding.bioLabel')}
          </label>
          <textarea 
            id="bio" 
            rows={4} 
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-800" 
            placeholder={t('onboarding.bioPlaceholder')}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
          ></textarea>
        </div>
        
        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('common.loading')}
            </span>
          ) : t('onboarding.continue')}
        </button>
      </form>
    </div>
  );
};

export default OnboardingScreen;
