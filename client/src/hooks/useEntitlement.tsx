import { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the context
interface EntitlementContextType {
  isPro: boolean;
  setIsPro: (value: boolean) => void;
}

// Create the context with a default value
const EntitlementContext = createContext<EntitlementContextType | undefined>(undefined);

// Provider component that wraps the app
export const EntitlementProvider = ({ children }: { children: ReactNode }) => {
  // State to track whether the user is a Pro subscriber
  const [isPro, setIsPro] = useState<boolean>(false);

  // Value provided to consumers of this context
  const value = {
    isPro,
    setIsPro,
  };

  return (
    <EntitlementContext.Provider value={value}>
      {children}
    </EntitlementContext.Provider>
  );
};

// Hook to use the entitlement context
export const useEntitlement = (): EntitlementContextType => {
  const context = useContext(EntitlementContext);
  
  if (context === undefined) {
    throw new Error('useEntitlement must be used within an EntitlementProvider');
  }
  
  return context;
};

export default useEntitlement;