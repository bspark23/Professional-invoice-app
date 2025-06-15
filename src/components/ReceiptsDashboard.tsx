
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { usePaymentReceipts } from "@/hooks/usePaymentReceipts";
import { useAuthLocal } from "@/hooks/useAuthLocal";
import { PaymentReceipt } from "@/types/receipt";
import { formatCurrency } from "@/utils/invoiceUtils";
import { downloadAsPDF, generateFileName } from "@/utils/downloadUtils";
import ReceiptTemplate from "./ReceiptTemplate";
import { Search, Download, Eye, Trash2, Receipt } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ReceiptsDashboard: React.FC = () => {
  const { user, currentProfile } = useAuthLocal();
  const { receipts, deleteReceipt } = usePaymentReceipts(currentProfile?.id, user?.email);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const filteredReceipts = receipts.filter(receipt =>
    receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.payerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadPDF = async (receipt: PaymentReceipt) => {
    try {
      setSelectedReceipt(receipt);
      // Wait for the template to render
      setTimeout(async () => {
        const filename = generateFileName(receipt.receiptNumber, receipt.payerName, 'pdf');
        await downloadAsPDF(`receipt-${receipt.id}`, filename);
      }, 100);
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  const handlePreview = (receipt: PaymentReceipt) => {
    setSelectedReceipt(receipt);
    setPreviewOpen(true);
  };

  const totalReceipts = receipts.length;
  const totalAmount = receipts.reduce((sum, receipt) => sum + receipt.amountPaid, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Receipts</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage and download payment receipts</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search receipts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Receipts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalReceipts}</p>
              </div>
              <Receipt className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Amount Received</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalAmount, 'USD')}</p>
              </div>
              <Receipt className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Receipts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No payment receipts found</p>
              <p className="text-sm text-gray-400 mt-1">Record your first payment to see receipts here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-300">Receipt #</th>
                    <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-300">Invoice #</th>
                    <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-300">Payer</th>
                    <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-300">Amount</th>
                    <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-300">Payment Date</th>
                    <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-300">Method</th>
                    <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReceipts.map((receipt) => (
                    <tr key={receipt.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-2 font-medium">{receipt.receiptNumber}</td>
                      <td className="p-2">{receipt.invoiceNumber}</td>
                      <td className="p-2">{receipt.payerName}</td>
                      <td className="p-2 font-medium text-green-600">
                        {formatCurrency(receipt.amountPaid, receipt.currency)}
                      </td>
                      <td className="p-2">{new Date(receipt.paymentDate).toLocaleDateString()}</td>
                      <td className="p-2">
                        <Badge variant="outline">{receipt.paymentMethod}</Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreview(receipt)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadPDF(receipt)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteReceipt(receipt.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Receipt Preview</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="mt-4">
              <ReceiptTemplate receipt={selectedReceipt} />
              <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => handleDownloadPDF(selectedReceipt)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden receipt templates for PDF generation */}
      <div className="hidden">
        {selectedReceipt && <ReceiptTemplate receipt={selectedReceipt} />}
      </div>
    </div>
  );
};

export default ReceiptsDashboard;
