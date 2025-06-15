
import React, { useState, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import InvoiceForm from "@/components/InvoiceForm";
import InvoiceTotals from "@/components/InvoiceTotals";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import PinLock from "@/components/PinLock";

const Index: React.FC = () => {
  // PIN Gating
  const [unlocked, setUnlocked] = useState(false);

  // Always call hooks at the top level, NOT inside/after return/if!
  // For InvoiceTotals pane, use the same hook as InvoiceForm
  // This ensures the layout always reflects live calculation
  const {
    subtotal,
    tax,
    form,
    total
  } = useInvoiceForm();

  useEffect(() => {
    // If PIN not set, unlock by default to show setup flow
    if (!localStorage.getItem("invoicer-pro-pin")) setUnlocked(false);
    // Else, wait for unlock (handled in PinLock)
  }, []);

  if (!unlocked) {
    return <PinLock onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 px-2 py-8">
      <div className="w-full max-w-3xl mx-auto">
        <DashboardHeader />
        <InvoiceForm />
        <InvoiceTotals subtotal={subtotal} tax={tax} discount={form.discount} total={total} />
      </div>
      <div className="text-center text-xs text-gray-500 mt-8">
        Invoicer Pro &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default Index;

