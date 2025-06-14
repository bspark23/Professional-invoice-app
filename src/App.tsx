
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LanguageSelector from "./pages/LanguageSelector";
import Welcome from "./pages/Welcome";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AppLandingPage from "@/components/AppLandingPage";

const queryClient = new QueryClient();

const App = () => {
  // NEW: state for controlling the landing page globally
  const [showLandingPage, setShowLandingPage] = useState(true);

  useEffect(() => {
    // Check localStorage first visit flag
    const hasVisited = localStorage.getItem('invoicecraft-has-visited') === 'true';
    setShowLandingPage(!hasVisited);
  }, []);

  const handleGetStarted = () => {
    localStorage.setItem('invoicecraft-has-visited', 'true');
    setShowLandingPage(false);
  };

  // If landing page should show, render *only* that first
  if (showLandingPage) {
    return (
      <AppLandingPage onGetStarted={handleGetStarted} />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LanguageSelector />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/dashboard" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
