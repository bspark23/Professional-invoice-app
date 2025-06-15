import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import LanguageSelector from "./pages/LanguageSelector";
import Welcome from "./pages/Welcome";
import NotFound from "./pages/NotFound";
import LandingPage from "@/components/LandingPage";
import ExpenseTracker from "./pages/ExpenseTracker";
import CalendarView from "./pages/CalendarView";
import { LanguageProvider } from "@/context/LanguageContext";
import LanguageDropdown from "@/components/LanguageDropdown";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import { AuthProvider, useAuthLocal } from "@/hooks/useAuthLocal";
import Settings from "./pages/Settings";
import VoluntaryContributionPage from "./pages/VoluntaryContributionPage";
import Notes from "./pages/Notes";
import PrintPreviewPage from "@/pages/PrintPreview";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";

const queryClient = new QueryClient();

const AppContent = () => {
  const [showLandingPage, setShowLandingPage] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleGetStarted = () => {
    setShowLandingPage(false);
    localStorage.setItem("invoicecraft-has-visited", "true");
    navigate('/');
  };

  if (showLandingPage && location.pathname === "/") {
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

  const { user } = useAuthLocal();

  return (
    <>
      {/* Language dropdown placed here for global visibility */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageDropdown />
      </div>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/settings" element={<Settings />} />
        {/* Protected dashboard/expenses/calendar/clients/invoices/payments */}
        <Route path="/dashboard" element={user ? <Dashboard /> : <SignIn />} />
        <Route path="/dashboard/print-preview" element={user ? <PrintPreviewPage /> : <SignIn />} />
        <Route path="/clients" element={user ? <Clients /> : <SignIn />} />
        <Route path="/invoices" element={user ? <Invoices /> : <SignIn />} />
        <Route path="/payments" element={user ? <Payments /> : <SignIn />} />
        <Route path="/expenses" element={user ? <ExpenseTracker /> : <SignIn />} />
        <Route path="/calendar" element={user ? <CalendarView /> : <SignIn />} />
        <Route path="/voluntary-contribution" element={<VoluntaryContributionPage />} />
        <Route path="/notes" element={<Notes />} />
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
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
};

export default App;
