import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useEntitlement } from '../hooks/useEntitlement';

const PaywallScreen = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { setIsPro } = useEntitlement();
  
  // Navigate back to matches screen
  const handleContinueFree = () => {
    setLocation('/matches');
  };
  
  // Mock payment process and upgrade user to Pro
  const handleSubscribe = (plan: 'monthly' | 'yearly') => {
    console.log(`Subscribe to ${plan} plan`);
    // Set user to Pro status and redirect to matches
    setIsPro(true);
    setLocation('/matches');
  };
  
  return (
    <div className="max-w-md mx-auto text-center">
      {/* Header banner with heart icon */}
      <div className="h-48 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold mb-4">{t('paywall.title')}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">{t('paywall.description')}</p>
      
      {/* Subscription options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Monthly plan */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-left">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{t('paywall.monthlyPlan')}</h3>
            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">Save 0%</span>
          </div>
          <div className="mb-4">
            <span className="text-3xl font-bold">$9.99</span>
            <span className="text-gray-500 dark:text-gray-400">/month</span>
          </div>
          <ul className="text-sm space-y-2 mb-4">
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t('paywall.feature1')}</span>
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t('paywall.feature2')}</span>
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t('paywall.feature3')}</span>
            </li>
          </ul>
          <button 
            className="w-full py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition"
            onClick={() => handleSubscribe('monthly')}
          >
            {t('paywall.subscribe')}
          </button>
        </div>
        
        {/* Yearly plan */}
        <div className="border-2 border-primary rounded-xl p-6 text-left relative">
          <div className="absolute -top-3 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
            {t('paywall.bestValue')}
          </div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{t('paywall.yearlyPlan')}</h3>
            <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">Save 50%</span>
          </div>
          <div className="mb-4">
            <span className="text-3xl font-bold">$59.99</span>
            <span className="text-gray-500 dark:text-gray-400">/year</span>
          </div>
          <ul className="text-sm space-y-2 mb-4">
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t('paywall.feature1')}</span>
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t('paywall.feature2')}</span>
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t('paywall.feature3')}</span>
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t('paywall.feature4')}</span>
            </li>
          </ul>
          <button 
            className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            onClick={() => handleSubscribe('yearly')}
          >
            {t('paywall.subscribe')}
          </button>
        </div>
      </div>
      
      <button 
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        onClick={handleContinueFree}
      >
        {t('paywall.continueFree')}
      </button>
      
      {/* Testimonials */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-medium mb-6">{t('paywall.testimonialsTitle')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center mb-3">
              <div 
                className="w-10 h-10 rounded-full bg-cover bg-center mr-3" 
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=50&h=50")' }}
                aria-label="Jessica profile photo"
              ></div>
              <div>
                <p className="font-medium">Jessica, 31</p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm">I was skeptical at first, but Deep Love introduced me to my fiancé! The matching algorithm really works!</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center mb-3">
              <div 
                className="w-10 h-10 rounded-full bg-cover bg-center mr-3" 
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=50&h=50")' }}
                aria-label="Michael profile photo"
              ></div>
              <div>
                <p className="font-medium">Michael, 29</p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm">The pro subscription is worth every penny. I've had meaningful conversations and made real connections.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallScreen;
