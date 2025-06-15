
import React from "react";
import InvoicePreview from "@/components/InvoicePreview";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PrintViewProps {
  invoiceData: any;
  formatCurrency: (amount: number, currencyCode?: string) => string;
  calculateSubtotal: () => number;
  calculateTax: () => number;
  calculateTotal: () => number;
  customTemplateContent?: string | null;
  onBack?: () => void;
}

const PrintView = ({
  invoiceData,
  formatCurrency,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  customTemplateContent,
  onBack,
}: PrintViewProps) => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen flex flex-col items-center justify-center py-4">
      {/* Go to Dashboard button - hidden in print */}
      <div className="w-full max-w-3xl flex justify-end mb-3 print:hidden">
        <Button
          onClick={handleGoToDashboard}
          className="mb-3"
          variant="outline"
          style={{
            printColorAdjust: "exact"
          }}
        >
          Go to Dashboard
        </Button>
      </div>
      <div className="w-full max-w-3xl mx-auto">
        <div id="invoice-preview">
          <InvoicePreview
            invoiceData={invoiceData}
            formatCurrency={formatCurrency}
            calculateSubtotal={calculateSubtotal}
            calculateTax={calculateTax}
            calculateTotal={calculateTotal}
            customTemplateContent={customTemplateContent}
          />
        </div>
      </div>
      <style>{`
        @media print {
          .print\\:hidden, button, .mb-3 { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
};

export default PrintView;

