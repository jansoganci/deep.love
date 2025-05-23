import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="hidden md:block bg-white dark:bg-gray-900 py-6 mt-auto border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-primary font-accent font-bold text-xl">{t('appName')}</span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('footer.tagline')}</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              {t('footer.privacy')}
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              {t('footer.terms')}
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              {t('footer.contact')}
            </a>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          {t('footer.copyright')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
