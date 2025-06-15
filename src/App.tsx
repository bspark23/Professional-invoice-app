
import { useState } from "react";
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
import ExpenseTracker from "./pages/ExpenseTracker";
import CalendarView from "./pages/CalendarView";
import { LanguageProvider } from "@/context/LanguageContext";
import LanguageDropdown from "@/components/LanguageDropdown";

const queryClient = new QueryClient();

const AppContent = () => {
  const [showLandingPage, setShowLandingPage] = useState(true);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    setShowLandingPage(false);
    localStorage.setItem("invoicecraft-has-visited", "true");
    navigate('/');
  };

  if (showLandingPage) {
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

  return (
    <>
      {/* Language dropdown placed here for global visibility */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageDropdown />
      </div>
      <Routes>
        <Route path="/" element={<LanguageSelector />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/dashboard" element={<Index />} />
        <Route path="/expenses" element={<ExpenseTracker />} />
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
};

export default App;
