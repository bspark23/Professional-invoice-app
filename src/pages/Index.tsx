
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Download, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: LineItem[];
  taxRate: number;
  discountAmount: number;
  businessName: string;
}

const Index = () => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lineItems: [
      { id: '1', description: "", quantity: 1, rate: 0, amount: 0 }
    ],
    taxRate: 0,
    discountAmount: 0,
    businessName: "Your Business Name"
  });

  useEffect(() => {
    const savedData = localStorage.getItem('invoicer-pro-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setInvoiceData(parsed);
      } catch (error) {
        console.log('Error loading saved data:', error);
      }
    }
  }, []);

  const saveInvoiceData = () => {
    localStorage.setItem('invoicer-pro-data', JSON.stringify(invoiceData));
    toast({
      title: "Invoice Saved",
      description: "Your invoice data has been saved locally.",
    });
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setInvoiceData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem]
    }));
  };

  const removeLineItem = (id: string) => {
    if (invoiceData.lineItems.length > 1) {
      setInvoiceData(prev => ({
        ...prev,
        lineItems: prev.lineItems.filter(item => item.id !== id)
      }));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setInvoiceData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updated.amount = updated.quantity * updated.rate;
          }
          return updated;
        }
        return item;
      })
    }));
  };

  const calculateSubtotal = () => {
    return invoiceData.lineItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * invoiceData.taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - invoiceData.discountAmount;
  };

  const exportToPDF = () => {
    toast({
      title: "Export Feature",
      description: "PDF export functionality would be implemented here with a library like jsPDF.",
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-blue-600">Invoicer Pro</CardTitle>
            <p className="text-gray-600 mt-2">Professional invoicing for freelancers</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                placeholder="Enter your business name"
                value={invoiceData.businessName}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, businessName: e.target.value }))}
              />
            </div>
            <Button 
              onClick={() => setIsLoggedIn(true)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoicer Pro</h1>
            <p className="text-gray-600">Create professional invoices</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={saveInvoiceData} variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={exportToPDF} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Invoice Form */}
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
                </div>
              </CardContent>
            </Card>

            {/* Client Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          placeholder="0.00"
                          value={item.rate}
                          onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2">
                        {index === 0 && <Label>Amount</Label>}
                        <Input
                          type="number"
                          value={item.amount.toFixed(2)}
                          readOnly
                          className="bg-gray-50"
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
          </div>

          {/* Right Column - Invoice Preview */}
          <div className="lg:sticky lg:top-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white border rounded-lg p-6 space-y-6">
                  {/* Invoice Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-blue-600">{invoiceData.businessName}</h2>
                    </div>
                    <div className="text-right">
                      <h3 className="text-xl font-semibold">INVOICE</h3>
                      <p className="text-gray-600">#{invoiceData.invoiceNumber}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Client and Date Info */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Bill To:</h4>
                      <div className="text-gray-600">
                        <p className="font-medium">{invoiceData.clientName}</p>
                        <p>{invoiceData.clientEmail}</p>
                        <p className="whitespace-pre-line">{invoiceData.clientAddress}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="space-y-1">
                        <p><span className="font-medium">Invoice Date:</span> {invoiceData.invoiceDate}</p>
                        <p><span className="font-medium">Due Date:</span> {invoiceData.dueDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Items */}
                  <div>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 grid grid-cols-12 gap-2 p-3 text-sm font-medium text-gray-700">
                        <div className="col-span-6">Description</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-2 text-center">Rate</div>
                        <div className="col-span-2 text-right">Amount</div>
                      </div>
                      {invoiceData.lineItems.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 p-3 border-t text-sm">
                          <div className="col-span-6">{item.description}</div>
                          <div className="col-span-2 text-center">{item.quantity}</div>
                          <div className="col-span-2 text-center">${item.rate.toFixed(2)}</div>
                          <div className="col-span-2 text-right">${item.amount.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    {invoiceData.taxRate > 0 && (
                      <div className="flex justify-between">
                        <span>Tax ({invoiceData.taxRate}%):</span>
                        <span>${calculateTax().toFixed(2)}</span>
                      </div>
                    )}
                    {invoiceData.discountAmount > 0 && (
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-${invoiceData.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
