import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import OnboardingScreen from "./screens/OnboardingScreen";
import CriteriaScreen from "./screens/CriteriaScreen";
import MatchesScreen from "./screens/MatchesScreen";
import PaywallScreen from "./screens/PaywallScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BottomNav from "./components/BottomNav";
import PrivateRoute from "./components/PrivateRoute";
import { ThemeProvider } from "./hooks/useTheme";
import { EntitlementProvider } from "./hooks/useEntitlement";
import { AuthProvider } from "./contexts/AuthContext";
import { loadUserProfile, loadUserCriteria } from "./services/storage";
import { initAnalytics } from "./services/analytics";

const AppRoutes = () => {
  const [location, setLocation] = useLocation();
  
  // This initial redirect is just to handle the root path
  useEffect(() => {
    if (location === "/") {
      setLocation("/login");
    }
  }, [location, setLocation]);
  
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={LoginScreen} />
      <Route path="/signup" component={SignupScreen} />
      
      {/* Protected routes */}
      <Route path="/onboarding">
        <PrivateRoute>
          <OnboardingScreen />
        </PrivateRoute>
      </Route>
      <Route path="/criteria">
        <PrivateRoute>
          <CriteriaScreen />
        </PrivateRoute>
      </Route>
      <Route path="/matches">
        <PrivateRoute>
          <MatchesScreen />
        </PrivateRoute>
      </Route>
      <Route path="/paywall">
        <PrivateRoute>
          <PaywallScreen />
        </PrivateRoute>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize analytics when the app loads
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <EntitlementProvider>
            <TooltipProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <div className="max-w-5xl mx-auto px-4 py-6 pb-20">
                    <AppRoutes />
                  </div>
                </main>
                <BottomNav />
                <Footer />
                <Toaster />
              </div>
            </TooltipProvider>
          </EntitlementProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
