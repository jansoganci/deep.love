import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

const SignupScreen = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { signup } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: t('auth.error'),
        description: t('auth.errorEmptyFields'),
        variant: 'destructive',
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: t('auth.error'),
        description: t('auth.errorPasswordMismatch'),
        variant: 'destructive',
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: t('auth.error'),
        description: t('auth.errorPasswordLength'),
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await signup(email, password);
      // After successful signup, redirect to onboarding
      setLocation('/onboarding');
    } catch (error: any) {
      toast({
        title: t('auth.error'),
        description: error.message || t('auth.errorSignup'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2">{t('auth.signupTitle')}</h1>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-8">{t('auth.signupSubtitle')}</p>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            {t('auth.emailLabel')}
          </label>
          <input 
            id="email" 
            type="email" 
            autoComplete="email"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-800" 
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            {t('auth.passwordLabel')}
          </label>
          <input 
            id="password" 
            type="password" 
            autoComplete="new-password"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-800" 
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500 mt-1">{t('auth.passwordHint')}</p>
        </div>
        
        {/* Confirm Password Input */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
            {t('auth.confirmPasswordLabel')}
          </label>
          <input 
            id="confirmPassword" 
            type="password" 
            autoComplete="new-password"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-800" 
            placeholder={t('auth.confirmPasswordPlaceholder')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        {/* Submit Button */}
        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('common.loading')}
            </span>
          ) : t('auth.signupButton')}
        </button>
        
        {/* Login Link */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('auth.haveAccount')}{' '}
            <button 
              type="button"
              className="text-primary hover:text-primary-dark font-medium"
              onClick={() => setLocation('/login')}
            >
              {t('auth.login')}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignupScreen;