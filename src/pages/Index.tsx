
import React from "react";
import { useNavigate } from "react-router-dom";
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { useClients } from "@/hooks/useClients";
import { useAuthLocal } from "@/hooks/useAuthLocal";
import InvoiceStats from "@/components/InvoiceStats";
import ClientList from "@/components/ClientList";
import InvoiceList from "@/components/InvoiceList";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuthLocal();
  const profileId = user?.email || user?.profileName || "anon"; // unique ID per user
  const userId = user?.email || user?.profileName; // unique ID per user
  const {
    savedInvoices,
    createNewInvoice,
    toggleInvoiceStatus,
    loadInvoice,
    deleteInvoice,
  } = useInvoiceData(profileId, userId);
  const { clients } = useClients(profileId, userId);

  // Minimal formatCurrency for demonstration
  const formatCurrency = (amount: number, currencyCode: string = "USD") =>
    `${currencyCode} ${amount.toFixed(2)}`;

  // Provide stub functions for missing props in InvoiceList
  const [viewMode, setViewMode] = React.useState<'create' | 'list' | 'print'>('list');
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const toggleDarkMode = () => setIsDarkMode((d) => !d);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/settings")}>Settings</Button>
          <Button onClick={createNewInvoice}>Create New Invoice</Button>
        </div>
      </div>

      <InvoiceStats invoices={savedInvoices} />

      <ClientList clients={clients} />

      <InvoiceList
        savedInvoices={savedInvoices}
        formatCurrency={formatCurrency}
        toggleInvoiceStatus={toggleInvoiceStatus}
        loadInvoice={loadInvoice}
        deleteInvoice={deleteInvoice}
        setViewMode={setViewMode}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
    </div>
  );
};

export default Index;
