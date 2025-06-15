import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { InvoiceData, LineItem, currencies } from "@/types/invoice";
import { Client } from "@/types/client";
import ClientSelector from "./ClientSelector";
import ClientDialog from "./ClientDialog";
import { useClients } from "@/hooks/useClients";

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
  addLineItem: () => void;
  removeLineItem: (id: string) => void;
  updateLineItem: (id: string, field: keyof LineItem, value: string | number) => void;
}

const InvoiceForm = ({
  invoiceData,
  setInvoiceData,
  addLineItem,
  removeLineItem,
  updateLineItem,
}: InvoiceFormProps) => {
  const { clients, addClient } = useClients();
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>();

  const handleSelectClient = (client: Client) => {
    setSelectedClientId(client.id);
    setInvoiceData(prev => ({
      ...prev,
      clientName: client.name,
      clientEmail: client.email,
      clientAddress: client.address,
    }));
  };

  const handleAddClient = (clientData: any) => {
    const newClient = addClient(clientData);
    handleSelectClient(newClient);
  };

  return (
    <div className="space-y-6">
      {/* Business Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Business Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                value={invoiceData.businessName}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, businessName: e.target.value }))}
              />
            </div>
            {/* --- ACCOUNT NUMBER FIELD --- */}
            <div>
              <Label htmlFor="account-number">Account Number</Label>
              <Input
                id="account-number"
                placeholder="Account Number"
                value={invoiceData.accountNumber || ""}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, accountNumber: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="business-logo">Company Logo</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="business-logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const result = ev.target?.result as string;
                        setInvoiceData(prev => ({ ...prev, businessLogo: result }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="flex-1"
                />
                {invoiceData.businessLogo && (
                  <img 
                    src={invoiceData.businessLogo} 
                    alt="Logo Preview" 
                    className="w-12 h-12 object-contain border rounded"
                  />
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={invoiceData.currency} onValueChange={(value) => setInvoiceData(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Details with Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Client Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Select Client</Label>
              <ClientSelector
                clients={clients}
                selectedClientId={selectedClientId}
                onSelectClient={handleSelectClient}
                onAddNewClient={() => setClientDialogOpen(true)}
              />
            </div>
            <div>
              <Label htmlFor="client-name">Client Name</Label>
              <Input
                id="client-name"
                placeholder="Client Name"
                value={invoiceData.clientName}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, clientName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="client-email">Client Email</Label>
              <Input
                id="client-email"
                type="email"
                placeholder="client@example.com"
                value={invoiceData.clientEmail}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, clientEmail: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="client-address">Client Address</Label>
              <Textarea
                id="client-address"
                placeholder="Client Address"
                value={invoiceData.clientAddress}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, clientAddress: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="invoice-number">Invoice Number</Label>
              <Input
                id="invoice-number"
                value={invoiceData.invoiceNumber}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="invoice-date">Invoice Date</Label>
              <Input
                id="invoice-date"
                type="date"
                value={invoiceData.invoiceDate}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="status">Status:</Label>
            <div className="flex items-center gap-2">
              <Switch
                id="status"
                checked={invoiceData.status === 'paid'}
                onCheckedChange={(checked) => setInvoiceData(prev => ({ ...prev, status: checked ? 'paid' : 'unpaid' }))}
              />
              <Badge variant={invoiceData.status === 'paid' ? 'default' : 'destructive'}>
                {invoiceData.status === 'paid' ? '✅ Paid' : '❌ Unpaid'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Services / Items</CardTitle>
            <Button onClick={addLineItem} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoiceData.lineItems.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  {index === 0 && <Label>Description</Label>}
                  <Input
                    placeholder="Service description"
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  {index === 0 && <Label>Qty</Label>}
                  <Input
                    type="number"
                    placeholder="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  {index === 0 && <Label>Rate</Label>}
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={item.rate}
                    onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  {index === 0 && <Label>Amount</Label>}
                  <Input
                    type="number"
                    step="0.01"
                    value={item.amount.toFixed(2)}
                    onChange={(e) => updateLineItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                    className="bg-white dark:bg-gray-800"
                  />
                </div>
                <div className="col-span-1">
                  {index === 0 && <div className="h-6"></div>}
                  <Button
                    onClick={() => removeLineItem(item.id)}
                    variant="outline"
                    size="sm"
                    disabled={invoiceData.lineItems.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invoice Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  placeholder="0"
                  value={invoiceData.taxRate}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="discount">Discount Amount</Label>
                <Input
                  id="discount"
                  type="number"
                  placeholder="0.00"
                  value={invoiceData.discountAmount}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, discountAmount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notes & Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Payment instructions, terms, or additional notes..."
              value={invoiceData.notes}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <ClientDialog
        open={clientDialogOpen}
        onOpenChange={setClientDialogOpen}
        onSave={handleAddClient}
      />
    </div>
  );
};

export default InvoiceForm;
