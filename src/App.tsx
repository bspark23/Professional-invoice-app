
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
import LandingPage from "@/components/LandingPage";

const queryClient = new QueryClient();

const AppContent = () => {
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('App initializing - checking localStorage...');
    const hasVisited = localStorage.getItem('invoicecraft-has-visited');
    console.log('localStorage value:', hasVisited);
    console.log('Current location:', location.pathname);
    
    // Always show landing page if user hasn't visited, regardless of URL
    if (hasVisited !== 'true') {
      console.log('User has not visited - showing landing page');
      setShowLandingPage(true);
    } else {
      console.log('User has visited before - allowing app access');
      setShowLandingPage(false);
    }
    
    setIsInitialized(true);
  }, [location]);

  const handleGetStarted = () => {
    console.log('Get Started clicked - setting localStorage and navigating');
    localStorage.setItem('invoicecraft-has-visited', 'true');
    setShowLandingPage(false);
    navigate('/');
  };

  // Show loading while checking localStorage
  if (!isInitialized) {
    console.log('App initializing...');
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  // ALWAYS show landing page if user hasn't visited - override any route
  if (showLandingPage) {
    console.log('Showing custom landing page');
    return (
      <LandingPage
        businessName="InvoiceCraft Pro"
        invoiceNumber="INV-001"
        clientName="Acme Corporation"
        total="$2,500.00"
        status="paid"
        currency="USD"
        onGetStarted={handleGetStarted}
      />
    );
  }

  // Only show app routes if user has completed landing
  console.log('Showing app routes');
  return (
    <Routes>
      <Route path="/" element={<LanguageSelector />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/dashboard" element={<Index />} />
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
