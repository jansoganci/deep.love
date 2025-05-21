import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-12 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center transition duration-300 p-1"
      onClick={toggleTheme}
    >
      <div className="toggle-circle w-4 h-4 bg-white rounded-full shadow-md"></div>
    </button>
  );
};

export default ThemeToggle;
