
import InvoicePreview from "@/components/InvoicePreview";

const PrintView = ({
  invoiceData,
  formatCurrency,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  customTemplateContent
}: any) => {
  // PrintView renders the same as the dashboard preview, full width/centered for print
  return (
    <div className="min-h-screen bg-white print:bg-white flex items-center justify-center py-10">
      <div className="max-w-3xl w-full">
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
  );
};

export default PrintView;
