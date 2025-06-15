
import React, { useState, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import InvoiceForm from "@/components/InvoiceForm";
import InvoiceTotals from "@/components/InvoiceTotals";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import PinLock from "@/components/PinLock";
import CurrencySelector from "@/components/CurrencySelector";
import DarkModeToggle from "@/components/DarkModeToggle";
import PrintPreviewModal from "@/components/PrintPreviewModal";
import { currencies } from "@/types/invoice";

const Index: React.FC = () => {
  // PIN Gating
  const [unlocked, setUnlocked] = useState(false);

  // Currency
  const defaultCurrency = localStorage.getItem("invoicer-pro-currency") || "USD";
  const [currency, setCurrency] = useState<string>(defaultCurrency);

  // Print preview modal
  const [previewOpen, setPreviewOpen] = useState(false);

  // Invoice logic
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

  // Currency formatter for display
  const formatCurrency = (amount: number) => {
    // fallback to USD symbol if unknown
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency
      }).format(amount);
    } catch {
      const selected = currencies.find(c => c.code === currency);
      return (selected?.symbol || "$") + amount.toFixed(2);
    }
  };

  if (!unlocked) {
    return <PinLock onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 px-2 py-8">
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <DashboardHeader />
          <div className="flex items-center gap-2">
            <CurrencySelector value={currency} onChange={setCurrency} />
            <DarkModeToggle />
            <button
              className="ml-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm"
              onClick={() => setPreviewOpen(true)}
            >
              Print Preview
            </button>
          </div>
        </div>
        <InvoiceForm />
        <InvoiceTotals
          subtotal={subtotal}
          tax={tax}
          discount={form.discount}
          total={total}
        />
      </div>
      <PrintPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        form={form}
        subtotal={subtotal}
        tax={tax}
        discount={form.discount}
        total={total}
        currency={currency}
      />
      <div className="text-center text-xs text-gray-500 mt-8">
        Invoicer Pro &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default Index;
