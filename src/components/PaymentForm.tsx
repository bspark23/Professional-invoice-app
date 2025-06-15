
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InvoiceData } from "@/types/invoice";
import { PaymentReceipt, paymentMethods } from "@/types/receipt";
import { usePaymentReceipts } from "@/hooks/usePaymentReceipts";
import { useAuthLocal } from "@/hooks/useAuthLocal";
import { CreditCard, Plus } from "lucide-react";

interface PaymentFormProps {
  invoices: InvoiceData[];
  onPaymentRecorded?: (receipt: PaymentReceipt) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ invoices, onPaymentRecorded }) => {
  const { user, profiles, currentProfile } = useAuthLocal();
  const { saveReceipt } = usePaymentReceipts(currentProfile?.id, user?.email);
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    payerName: "",
    payerEmail: "",
    payerAddress: "",
    amountPaid: "",
    paymentMethod: "",
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const selectedInvoice = invoices.find(inv => inv.invoiceNumber === formData.invoiceNumber);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedInvoice) {
      return;
    }

    const receipt = saveReceipt({
      invoiceId: selectedInvoice.id,
      invoiceNumber: formData.invoiceNumber,
      payerName: formData.payerName,
      payerEmail: formData.payerEmail || undefined,
      payerAddress: formData.payerAddress || undefined,
      payeeName: selectedInvoice.businessName,
      payeeEmail: selectedInvoice.businessEmail || undefined,
      payeeAddress: selectedInvoice.businessAddress || undefined,
      amountPaid: parseFloat(formData.amountPaid),
      paymentMethod: formData.paymentMethod,
      paymentDate: formData.paymentDate,
      notes: formData.notes || undefined,
      currency: selectedInvoice.currency,
    });

    if (receipt && onPaymentRecorded) {
      onPaymentRecorded(receipt);
    }

    // Reset form
    setFormData({
      invoiceNumber: "",
      payerName: "",
      payerEmail: "",
      payerAddress: "",
      amountPaid: "",
      paymentMethod: "",
      paymentDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <CreditCard className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Payment Receipt</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number *</Label>
              <Select value={formData.invoiceNumber} onValueChange={(value) => setFormData(prev => ({ ...prev, invoiceNumber: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select invoice" />
                </SelectTrigger>
                <SelectContent>
                  {invoices.map((invoice) => (
                    <SelectItem key={invoice.id} value={invoice.invoiceNumber}>
                      {invoice.invoiceNumber} - {invoice.clientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amountPaid">Amount Paid *</Label>
              <Input
                id="amountPaid"
                type="number"
                step="0.01"
                value={formData.amountPaid}
                onChange={(e) => setFormData(prev => ({ ...prev, amountPaid: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payerName">Payer Name *</Label>
            <Input
              id="payerName"
              value={formData.payerName}
              onChange={(e) => setFormData(prev => ({ ...prev, payerName: e.target.value }))}
              placeholder="Enter payer's name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payerEmail">Payer Email</Label>
              <Input
                id="payerEmail"
                type="email"
                value={formData.payerEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, payerEmail: e.target.value }))}
                placeholder="payer@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payerAddress">Payer Address</Label>
              <Input
                id="payerAddress"
                value={formData.payerAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, payerAddress: e.target.value }))}
                placeholder="Payer's address"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional payment notes (optional)"
              rows={3}
            />
          </div>

          {selectedInvoice && (
            <Card className="bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">Invoice Details</h4>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Client:</span> {selectedInvoice.clientName}</p>
                  <p><span className="font-medium">Date:</span> {selectedInvoice.invoiceDate}</p>
                  <p><span className="font-medium">Currency:</span> {selectedInvoice.currency}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.invoiceNumber || !formData.amountPaid || !formData.payerName || !formData.paymentMethod}>
              Generate Receipt
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentForm;
