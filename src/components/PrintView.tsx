
import InvoicePreview from "@/components/InvoicePreview";

const PrintView = ({
  invoiceData,
  formatCurrency,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  customTemplateContent
}: any) => {
  // PrintView should render *exactly* like the dashboard preview for accuracy
  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen flex items-center justify-center">
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
    </div>
  );
};

export default PrintView;
