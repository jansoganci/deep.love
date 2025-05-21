import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";
import OnboardingScreen from "./screens/OnboardingScreen";
import CriteriaScreen from "./screens/CriteriaScreen";
import MatchesScreen from "./screens/MatchesScreen";
import PaywallScreen from "./screens/PaywallScreen";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ThemeProvider } from "./hooks/useTheme";
import { loadUserProfile, loadUserCriteria } from "./services/storage";

function Router() {
  const [location, setLocation] = useLocation();
  const userProfile = loadUserProfile();
  const userCriteria = loadUserCriteria();

  // Set initial route based on user progress
  useEffect(() => {
    if (location === "/") {
      if (!userProfile) {
        setLocation("/onboarding");
      } else if (!userCriteria) {
        setLocation("/criteria");
      } else {
        setLocation("/matches");
      }
    }
  }, [location, setLocation, userProfile, userCriteria]);

  return (
    <Switch>
      <Route path="/onboarding" component={OnboardingScreen} />
      <Route path="/criteria" component={CriteriaScreen} />
      <Route path="/matches" component={MatchesScreen} />
      <Route path="/paywall" component={PaywallScreen} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <div className="max-w-5xl mx-auto px-4 py-6">
                <Router />
              </div>
            </main>
            <Footer />
            <Toaster />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
