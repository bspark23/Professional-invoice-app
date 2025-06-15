
import InvoicePreview from "@/components/InvoicePreview";

const PrintView = ({
  invoiceData,
  formatCurrency,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  customTemplateContent
}: any) => {
  // PrintView renders exactly like the dashboard preview,
  // but we make sure the main invoice preview has id="invoice-preview"
  // so PDF/image export can find it.
  return (
    <div className="min-h-screen bg-white print:bg-white flex items-center justify-center py-10">
      <div className="max-w-3xl w-full">
        {/* Key: pass id="invoice-preview" */}
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
    </div>
  );
};

export default PrintView;
