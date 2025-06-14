
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
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
    // Always check localStorage on mount and route changes
    const hasVisited = localStorage.getItem('invoicecraft-has-visited') === 'true';
    console.log('Checking localStorage - hasVisited:', hasVisited, 'path:', location.pathname);
    
    if (!hasVisited) {
      // Force landing page to show if user hasn't visited
      setShowLandingPage(true);
    } else {
      setShowLandingPage(false);
    }
    setIsInitialized(true);
  }, [location.pathname]);

  const handleGetStarted = () => {
    console.log('Get Started clicked - setting localStorage and hiding landing page');
    localStorage.setItem('invoicecraft-has-visited', 'true');
    setShowLandingPage(false);
    // Navigate to language selector after landing page
    navigate('/');
  };

  // Don't render anything until we've checked localStorage
  if (!isInitialized) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900"></div>;
  }

  // FORCE landing page to show if user hasn't visited, regardless of current route
  if (showLandingPage) {
    console.log('Rendering landing page');
    return <AppLandingPage onGetStarted={handleGetStarted} />;
  }

  console.log('Rendering app routes');
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
