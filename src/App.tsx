
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Welcome from "./pages/Welcome";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import ExpenseTracker from "./pages/ExpenseTracker";
import Clients from "./pages/Clients";
import Settings from "./pages/Settings";
import Notes from "./pages/Notes";
import CalendarView from "./pages/CalendarView";
import PrintPreview from "./pages/PrintPreview";
import NotFound from "./pages/NotFound";
import VoluntaryContributionPage from "./pages/VoluntaryContributionPage";
import { LanguageProvider } from "./context/LanguageContext";
import { Toaster } from "@/components/ui/toaster";
import Estimates from "./pages/Estimates";
import TimeTracking from "./pages/TimeTracking";
import Projects from "./pages/Projects";
import LandingPage from "./components/LandingPage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Toaster />
        <LanguageProvider>
          <Routes>
            <Route path="/" element={<LandingPage businessName="InvoiceCraft Pro" invoiceNumber="INV-001" clientName="Acme Corporation" total="$2,500.00" status="paid" currency="USD" onGetStarted={() => window.location.href = '/dashboard'} />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/estimates" element={<Estimates />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/time-tracking" element={<TimeTracking />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/expenses" element={<ExpenseTracker />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/print-preview" element={<PrintPreview />} />
            <Route path="/contribution" element={<VoluntaryContributionPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LanguageProvider>
      </div>
    </BrowserRouter>
  );
}

export default App;
