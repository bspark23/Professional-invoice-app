
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Print, Mail, X } from "lucide-react";
import InvoicePreview from "./InvoicePreview";
import { InvoiceData } from "@/types/invoice";

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: InvoiceData;
  formatCurrency: (amount: number, currencyCode?: string) => string;
  calculateSubtotal: () => number;
  calculateTax: () => number;
  calculateTotal: () => number;
  onDownload: () => void;
  onEmail?: () => void;
}

const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  isOpen,
  onClose,
  invoiceData,
  formatCurrency,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  onDownload,
  onEmail
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Invoice Preview</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Print className="w-4 h-4 mr-2" />
                Print
              </Button>
              {onEmail && (
                <Button variant="outline" size="sm" onClick={onEmail}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              )}
              <Button size="sm" onClick={onDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <InvoicePreview
              invoiceData={invoiceData}
              formatCurrency={formatCurrency}
              calculateSubtotal={calculateSubtotal}
              calculateTax={calculateTax}
              calculateTotal={calculateTotal}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreviewModal;
