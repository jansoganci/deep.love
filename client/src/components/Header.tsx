import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    setLocation('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span 
              className="text-primary font-accent font-bold text-2xl cursor-pointer"
              onClick={() => setLocation('/')}
            >
              {t('appName')}
            </span>
          </div>
          
          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            <LanguageSelector />
            <ThemeToggle />
            
            {/* Auth Controls */}
            {user ? (
              <button 
                onClick={handleLogout}
                className="text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                {t('auth.logout')}
              </button>
            ) : (
              <button 
                onClick={() => setLocation('/login')}
                className="text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                {t('auth.login')}
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
