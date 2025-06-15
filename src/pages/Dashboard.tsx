
import React, { useState } from "react";
import BrandingSection from "@/components/BrandingSection";
import InvoiceGenSection from "@/components/InvoiceGenSection";
import ProfilesSection from "@/components/ProfilesSection";
import InvoiceHistorySection from "@/components/InvoiceHistorySection";
import AnalyticsSection from "@/components/AnalyticsSection";
import ClientsSection from "@/components/ClientsSection";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import CurrencySelector from "@/components/CurrencySelector";
import LanguageDropdown from "@/components/LanguageDropdown";
import DarkModeToggle from "@/components/DarkModeToggle";
import { Printer, Download } from "lucide-react";

const Dashboard: React.FC = () => {
  // Add currency state and handler
  const [currency, setCurrency] = useState("USD");

  return (
    <div className="flex min-h-screen bg-blue-50 dark:bg-gray-950">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-blue-800 font-inter tracking-tight">🧾 InvoiceEase</h1>
            <span className="ml-3 px-2 py-0.5 bg-blue-100 rounded-full text-xs text-blue-700 font-semibold">
              Smart. Simple. Professional.
            </span>
          </div>
          <div className="flex gap-3 items-center">
            <DarkModeToggle />
            <CurrencySelector value={currency} onChange={setCurrency} />
            <LanguageDropdown />
            <Button variant="outline" onClick={() => window.print()} title="Print Invoice">
              <Printer className="mr-1 h-5 w-5" /> Print
            </Button>
            <Button variant="outline" title="Download PDF">
              <Download className="mr-1 h-5 w-5" /> PDF
            </Button>
          </div>
        </header>
        <main className="p-4 flex flex-col gap-6 max-w-7xl mx-auto w-full">
          <div className="grid xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 flex flex-col gap-6">
              <BrandingSection />
              <InvoiceGenSection />
              <ClientsSection />
            </div>
            <div className="flex flex-col gap-6">
              <ProfilesSection />
              <AnalyticsSection />
            </div>
          </div>
          <InvoiceHistorySection />
        </main>
        <footer className="w-full p-4 text-xs text-gray-500 text-center">InvoiceEase &copy; {new Date().getFullYear()} | Built for freelancers & small businesses</footer>
      </div>
    </div>
  );
};
export default Dashboard;
