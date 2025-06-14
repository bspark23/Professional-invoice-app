
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import LanguageSelector from "./pages/LanguageSelector";
import Welcome from "./pages/Welcome";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AppLandingPage from "@/components/AppLandingPage";

const queryClient = new QueryClient();

const AppContent = () => {
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check localStorage first visit flag
    const hasVisited = localStorage.getItem('invoicecraft-has-visited') === 'true';
    console.log('Has visited:', hasVisited);
    console.log('Current path:', location.pathname);
    
    setShowLandingPage(!hasVisited);
    setIsInitialized(true);
  }, [location.pathname]);

  const handleGetStarted = () => {
    localStorage.setItem('invoicecraft-has-visited', 'true');
    setShowLandingPage(false);
    // Navigate to language selector after landing page
    navigate('/');
  };

  // Don't render anything until we've checked localStorage
  if (!isInitialized) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900"></div>;
  }

  // If landing page should show, render *only* that first
  if (showLandingPage) {
    return <AppLandingPage onGetStarted={handleGetStarted} />;
  }

  return (
    <Routes>
      <Route path="/" element={<LanguageSelector />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/dashboard" element={<Index />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
