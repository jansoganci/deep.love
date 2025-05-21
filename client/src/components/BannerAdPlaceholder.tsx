import { FEATURE_FLAGS } from '../constants/featureFlags';

const BannerAdPlaceholder = () => {
  // Don't render anything if ads are disabled via feature flag
  if (!FEATURE_FLAGS.ADS_ENABLED) {
    return null;
  }

  return (
    <div className="w-full py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mt-6 mb-2">
      <div className="flex items-center justify-center h-14">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ad space
        </p>
      </div>
    </div>
  );
};

export default BannerAdPlaceholder;