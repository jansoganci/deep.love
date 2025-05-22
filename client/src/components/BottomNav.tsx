import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';

const BottomNav = () => {
  const { t } = useTranslation();
  const [location] = useLocation();

  // Navigation items with their path, icon and label
  const navItems = [
    { path: '/matches', id: 'home', icon: '🏠', label: 'Home' },
    { path: '/matches?tab=chat', id: 'chat', icon: '💬', label: 'Matches' },
    { path: '/criteria', id: 'criteria', icon: '⚙️', label: 'Filters' },
    { path: '/onboarding', id: 'profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 h-16 z-30">
      <div className="max-w-md mx-auto h-full flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location === item.path || (location.includes(item.path) && item.path !== '/');
          return (
            <Link 
              key={item.id} 
              href={item.path}
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive 
                  ? 'text-primary' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-10 h-0.5 bg-primary mx-auto"></div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;