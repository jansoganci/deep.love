import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';

interface FreemiumBannerProps {
  swipesLeft: number;
}

const FreemiumBanner = ({ swipesLeft }: FreemiumBannerProps) => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const handleUpgradeClick = () => {
    setLocation('/paywall');
  };

  return (
    <div className="bg-gradient-to-r from-secondary/20 to-primary/20 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div className="mb-3 sm:mb-0">
          <h3 className="font-semibold text-primary">
            {swipesLeft === 0
              ? t('paywall.title')
              : `${swipesLeft} ${t('matches.remaining', { remaining: swipesLeft })}`}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('paywall.description')}
          </p>
        </div>
        <button
          onClick={handleUpgradeClick}
          className="bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {t('paywall.cta')}
        </button>
      </div>
    </div>
  );
};

export default FreemiumBanner;