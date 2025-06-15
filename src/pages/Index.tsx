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
  const { savedInvoices, createNewInvoice } = useInvoiceData(profileId, userId);
  const { clients } = useClients(profileId, userId);

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

      <InvoiceList invoices={savedInvoices} />
      {/* Add a button to view notes */}
      <div className="mb-4 flex flex-row justify-end">
        <button
          className="bg-primary text-white rounded px-3 py-2 hover:bg-primary/90 transition-colors"
          onClick={() => navigate("/notes")}
        >
          My Notes
        </button>
      </div>
    </div>
  );
};

export default Index;
