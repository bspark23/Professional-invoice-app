
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
  const [showLandingPage, setShowLandingPage] = useState<boolean | null>(null); // null means uninitialized
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Always run on mount and location change (in case user manually changes route)
    const hasVisited = localStorage.getItem('invoicecraft-has-visited');
    console.info('[AppContent] Checking localStorage for landing page:', hasVisited);
    if (hasVisited !== 'true') {
      setShowLandingPage(true);
    } else {
      setShowLandingPage(false);
    }
    setIsInitialized(true);
  }, [location]);

  const handleGetStarted = () => {
    localStorage.setItem('invoicecraft-has-visited', 'true');
    setShowLandingPage(false);
    navigate('/');
  };

  // Loading indicator while checking
  if (!isInitialized || showLandingPage === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  // Force show the custom landing page for new users regardless of url
  if (showLandingPage) {
    console.info('[AppContent] Rendering Landing Page!');
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

  // Show app proper
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
