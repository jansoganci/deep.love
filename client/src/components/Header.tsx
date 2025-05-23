import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setLocation('/login');
  };

  // Navigation items for desktop menu
  const navItems = [
    { path: '/home', icon: '🏠', label: 'Home' },
    { path: '/matches', icon: '💬', label: 'Matches' },
    { path: '/criteria', icon: '⚙️', label: 'Filters' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

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
          
          {/* Desktop Navigation - Hidden on mobile */}
          {user && (
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <button 
                    key={item.path}
                    onClick={() => setLocation(item.path)}
                    className={`flex items-center space-x-2 text-sm font-medium px-3 py-1.5 rounded-lg transition ${
                      isActive 
                        ? 'bg-primary text-white' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
          
          {/* Right side controls */}
          <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
