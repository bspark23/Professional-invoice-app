import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Download, Save, Eye, FileText, Printer, Moon, Sun, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  id?: string;
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
  currency: string;
  notes: string;
  status: 'paid' | 'unpaid';
  createdAt?: string;
}

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

const Index = () => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [viewMode, setViewMode] = useState<'create' | 'list' | 'print'>('create');
  const [savedInvoices, setSavedInvoices] = useState<InvoiceData[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lineItems: [
      { id: '1', description: "", quantity: 1, rate: 0, amount: 0 }
    ],
    taxRate: 0,
    discountAmount: 0,
    businessName: "Your Business Name",
    currency: 'USD',
    notes: '',
    status: 'unpaid'
  });

  // Generate auto invoice number
  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const lastInvoiceNumber = savedInvoices.length > 0 
      ? Math.max(...savedInvoices.map(inv => {
          const match = inv.invoiceNumber.match(/(\d+)$/);
          return match ? parseInt(match[1]) : 0;
        }))
      : 0;
    const nextNumber = String(lastInvoiceNumber + 1).padStart(3, '0');
    return `INV-${year}-${month}-${nextNumber}`;
  };

  // Format currency
  const formatCurrency = (amount: number, currencyCode: string = invoiceData.currency) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'symbol'
    }).format(amount).replace(currencyCode, currency?.symbol || '$');
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  useEffect(() => {
    // Initialize dark mode from localStorage
    const savedDarkMode = localStorage.getItem('invoicer-dark-mode') === 'true';
    setIsDarkMode(savedDarkMode);
    document.documentElement.classList.toggle('dark', savedDarkMode);

    const savedData = localStorage.getItem('invoicer-pro-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setInvoiceData(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.log('Error loading saved data:', error);
      }
    }

    const savedInvoicesData = localStorage.getItem('invoicer-pro-invoices');
    if (savedInvoicesData) {
      try {
        const parsed = JSON.parse(savedInvoicesData);
        setSavedInvoices(parsed);
      } catch (error) {
        console.log('Error loading saved invoices:', error);
      }
    }

    // Set initial invoice number if empty
    if (!invoiceData.invoiceNumber) {
      setInvoiceData(prev => ({ ...prev, invoiceNumber: generateInvoiceNumber() }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('invoicer-dark-mode', isDarkMode.toString());
  }, [isDarkMode]);

  const saveInvoiceData = () => {
    localStorage.setItem('invoicer-pro-data', JSON.stringify(invoiceData));
    toast({
      title: "Invoice Data Saved",
      description: "Your current invoice data has been saved locally.",
    });
  };

  const saveInvoice = () => {
    const invoiceToSave = {
      ...invoiceData,
      id: invoiceData.id || Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    const existingInvoices = [...savedInvoices];
    const existingIndex = existingInvoices.findIndex(inv => inv.id === invoiceToSave.id);
    
    if (existingIndex >= 0) {
      existingInvoices[existingIndex] = invoiceToSave;
    } else {
      existingInvoices.push(invoiceToSave);
    }

    setSavedInvoices(existingInvoices);
    localStorage.setItem('invoicer-pro-invoices', JSON.stringify(existingInvoices));
    
    setInvoiceData(prev => ({ ...prev, id: invoiceToSave.id }));
    
    toast({
      title: "Invoice Saved",
      description: "Your invoice has been saved and can be viewed later.",
    });
  };

  const loadInvoice = (invoice: InvoiceData) => {
    setInvoiceData(invoice);
    setViewMode('create');
    toast({
      title: "Invoice Loaded",
      description: "Invoice loaded successfully.",
    });
  };

  const deleteInvoice = (invoiceId: string) => {
    const updatedInvoices = savedInvoices.filter(inv => inv.id !== invoiceId);
    setSavedInvoices(updatedInvoices);
    localStorage.setItem('invoicer-pro-invoices', JSON.stringify(updatedInvoices));
    toast({
      title: "Invoice Deleted",
      description: "Invoice has been deleted successfully.",
    });
  };

  const toggleInvoiceStatus = (invoiceId: string) => {
    const updatedInvoices = savedInvoices.map(inv => 
      inv.id === invoiceId 
        ? { ...inv, status: inv.status === 'paid' ? 'unpaid' : 'paid' as 'paid' | 'unpaid' }
        : inv
    );
    setSavedInvoices(updatedInvoices);
    localStorage.setItem('invoicer-pro-invoices', JSON.stringify(updatedInvoices));
    toast({
      title: "Status Updated",
      description: "Invoice status has been updated.",
    });
  };

  const createNewInvoice = () => {
    setInvoiceData({
      clientName: "",
      clientEmail: "",
      clientAddress: "",
      invoiceNumber: generateInvoiceNumber(),
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lineItems: [
        { id: Date.now().toString(), description: "", quantity: 1, rate: 0, amount: 0 }
      ],
      taxRate: 0,
      discountAmount: 0,
      businessName: invoiceData.businessName,
      currency: invoiceData.currency,
      notes: '',
      status: 'unpaid'
    });
    setViewMode('create');
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

  const printInvoice = () => {
    setViewMode('print');
  };

  const exportToPDF = () => {
    try {
      const pdf = new jsPDF();
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.setTextColor(59, 130, 246);
      
      pdf.text(invoiceData.businessName, 20, 30);
      
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.text('INVOICE', 150, 30);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.text(`#${invoiceData.invoiceNumber}`, 150, 40);
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('Bill To:', 20, 60);
      pdf.setFont('helvetica', 'normal');
      pdf.text(invoiceData.clientName, 20, 70);
      pdf.text(invoiceData.clientEmail, 20, 80);
      
      const addressLines = invoiceData.clientAddress.split('\n');
      addressLines.forEach((line, index) => {
        pdf.text(line, 20, 90 + (index * 10));
      });
      
      pdf.text(`Invoice Date: ${invoiceData.invoiceDate}`, 150, 70);
      pdf.text(`Due Date: ${invoiceData.dueDate}`, 150, 80);
      
      let yPosition = 120;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Description', 20, yPosition);
      pdf.text('Qty', 120, yPosition);
      pdf.text('Rate', 140, yPosition);
      pdf.text('Amount', 170, yPosition);
      
      pdf.line(20, yPosition + 2, 190, yPosition + 2);
      
      pdf.setFont('helvetica', 'normal');
      yPosition += 15;
      
      invoiceData.lineItems.forEach((item) => {
        pdf.text(item.description || 'No description', 20, yPosition);
        pdf.text(item.quantity.toString(), 120, yPosition);
        pdf.text(formatCurrency(item.rate), 140, yPosition);
        pdf.text(formatCurrency(item.amount), 170, yPosition);
        yPosition += 15;
      });
      
      yPosition += 10;
      pdf.line(120, yPosition, 190, yPosition);
      yPosition += 10;
      
      pdf.text(`Subtotal: ${formatCurrency(calculateSubtotal())}`, 120, yPosition);
      yPosition += 10;
      
      if (invoiceData.taxRate > 0) {
        pdf.text(`Tax (${invoiceData.taxRate}%): ${formatCurrency(calculateTax())}`, 120, yPosition);
        yPosition += 10;
      }
      
      if (invoiceData.discountAmount > 0) {
        pdf.text(`Discount: -${formatCurrency(invoiceData.discountAmount)}`, 120, yPosition);
        yPosition += 10;
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text(`Total: ${formatCurrency(calculateTotal())}`, 120, yPosition);
      
      if (invoiceData.notes) {
        yPosition += 20;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text('Notes:', 20, yPosition);
        pdf.setFont('helvetica', 'normal');
        yPosition += 10;
        const noteLines = invoiceData.notes.split('\n');
        noteLines.forEach((line, index) => {
          pdf.text(line, 20, yPosition + (index * 10));
        });
      }
      
      pdf.save(`invoice-${invoiceData.invoiceNumber}.pdf`);
      
      toast({
        title: "PDF Generated",
        description: "Invoice PDF has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-blue-600 dark:text-blue-400">Invoicer Pro</CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Professional invoicing for freelancers</p>
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

  if (viewMode === 'print') {
    return (
      <div className="min-h-screen bg-white print:bg-white">
        <div className="max-w-4xl mx-auto p-8 print:p-0">
          <div className="flex justify-between items-center mb-8 print:hidden">
            <h1 className="text-2xl font-bold">Print Preview</h1>
            <div className="flex gap-2">
              <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button onClick={() => setViewMode('create')} variant="outline">
                Back to Edit
              </Button>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-8 print:border-0 print:shadow-none">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold text-blue-600">{invoiceData.businessName}</h2>
              </div>
              <div className="text-right">
                <h3 className="text-2xl font-semibold">INVOICE</h3>
                <p className="text-gray-600">#{invoiceData.invoiceNumber}</p>
                <Badge variant={invoiceData.status === 'paid' ? 'default' : 'destructive'}>
                  {invoiceData.status === 'paid' ? '✅ Paid' : '❌ Unpaid'}
                </Badge>
              </div>
            </div>

            <Separator className="mb-8" />

            {/* Client and Date Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Bill To:</h4>
                <div className="text-gray-600">
                  <p className="font-medium">{invoiceData.clientName}</p>
                  <p>{invoiceData.clientEmail}</p>
                  <p className="whitespace-pre-line">{invoiceData.clientAddress}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="space-y-2">
                  <p><span className="font-medium">Invoice Date:</span> {invoiceData.invoiceDate}</p>
                  <p><span className="font-medium">Due Date:</span> {invoiceData.dueDate}</p>
                  <p><span className="font-medium">Currency:</span> {currencies.find(c => c.code === invoiceData.currency)?.name}</p>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="mb-8">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 grid grid-cols-12 gap-2 p-4 text-sm font-medium text-gray-700">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-center">Rate</div>
                  <div className="col-span-2 text-right">Amount</div>
                </div>
                {invoiceData.lineItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 p-4 border-t text-sm">
                    <div className="col-span-6">{item.description}</div>
                    <div className="col-span-2 text-center">{item.quantity}</div>
                    <div className="col-span-2 text-center">{formatCurrency(item.rate)}</div>
                    <div className="col-span-2 text-right">{formatCurrency(item.amount)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-3 mb-8">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              {invoiceData.taxRate > 0 && (
                <div className="flex justify-between">
                  <span>Tax ({invoiceData.taxRate}%):</span>
                  <span>{formatCurrency(calculateTax())}</span>
                </div>
              )}
              {invoiceData.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-{formatCurrency(invoiceData.discountAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>

            {/* Notes */}
            {invoiceData.notes && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Notes:</h4>
                <p className="text-gray-600 whitespace-pre-line">{invoiceData.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Saved Invoices</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage your saved invoices</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={toggleDarkMode} variant="outline" size="sm">
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
              </Button>
              <Button onClick={createNewInvoice} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
              <Button onClick={() => setViewMode('create')} variant="outline">
                Back to Current
              </Button>
            </div>
          </div>

          {/* Invoices List */}
          <div className="grid gap-4">
            {savedInvoices.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">No saved invoices yet. Create and save your first invoice!</p>
                </CardContent>
              </Card>
            ) : (
              savedInvoices.map((invoice) => (
                <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{invoice.clientName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Due: {invoice.dueDate}</p>
                            <p className="font-medium">{formatCurrency(invoice.lineItems.reduce((sum, item) => sum + item.amount, 0) + (invoice.lineItems.reduce((sum, item) => sum + item.amount, 0) * invoice.taxRate / 100) - invoice.discountAmount, invoice.currency)}</p>
                          </div>
                          <div>
                            <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                              {invoice.status === 'paid' ? '✅ Paid' : '❌ Unpaid'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => toggleInvoiceStatus(invoice.id!)}
                          variant="outline"
                          size="sm"
                        >
                          {invoice.status === 'paid' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </Button>
                        <Button
                          onClick={() => loadInvoice(invoice)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => deleteInvoice(invoice.id!)}
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Invoicer Pro</h1>
            <p className="text-gray-600 dark:text-gray-300">Create professional invoices</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={toggleDarkMode} variant="outline" size="sm">
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button onClick={() => setViewMode('list')} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View Saved ({savedInvoices.length})
            </Button>
            <Button onClick={saveInvoiceData} variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={saveInvoice} variant="outline" className="bg-green-50 hover:bg-green-100 dark:bg-green-900 dark:hover:bg-green-800">
              <FileText className="w-4 h-4 mr-2" />
              Save Invoice
            </Button>
            <Button onClick={printInvoice} variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print Preview
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
          </div>

          {/* Right Column - Invoice Preview */}
          <div className="lg:sticky lg:top-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white dark:bg-gray-800 border rounded-lg p-6 space-y-6">
                  {/* Invoice Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{invoiceData.businessName}</h2>
                    </div>
                    <div className="text-right">
                      <h3 className="text-xl font-semibold">INVOICE</h3>
                      <p className="text-gray-600 dark:text-gray-300">#{invoiceData.invoiceNumber}</p>
                      <Badge variant={invoiceData.status === 'paid' ? 'default' : 'destructive'} className="mt-2">
                        {invoiceData.status === 'paid' ? '✅ Paid' : '❌ Unpaid'}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Client and Date Info */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Bill To:</h4>
                      <div className="text-gray-600 dark:text-gray-300">
                        <p className="font-medium">{invoiceData.clientName}</p>
                        <p>{invoiceData.clientEmail}</p>
                        <p className="whitespace-pre-line">{invoiceData.clientAddress}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="space-y-1">
                        <p><span className="font-medium">Invoice Date:</span> {invoiceData.invoiceDate}</p>
                        <p><span className="font-medium">Due Date:</span> {invoiceData.dueDate}</p>
                        <p><span className="font-medium">Currency:</span> {currencies.find(c => c.code === invoiceData.currency)?.name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Items */}
                  <div>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 dark:bg-gray-700 grid grid-cols-12 gap-2 p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <div className="col-span-6">Description</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-2 text-center">Rate</div>
                        <div className="col-span-2 text-right">Amount</div>
                      </div>
                      {invoiceData.lineItems.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 p-3 border-t text-sm">
                          <div className="col-span-6">{item.description}</div>
                          <div className="col-span-2 text-center">{item.quantity}</div>
                          <div className="col-span-2 text-center">{formatCurrency(item.rate)}</div>
                          <div className="col-span-2 text-right">{formatCurrency(item.amount)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    {invoiceData.taxRate > 0 && (
                      <div className="flex justify-between">
                        <span>Tax ({invoiceData.taxRate}%):</span>
                        <span>{formatCurrency(calculateTax())}</span>
                      </div>
                    )}
                    {invoiceData.discountAmount > 0 && (
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-{formatCurrency(invoiceData.discountAmount)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>

                  {/* Notes Preview */}
                  {invoiceData.notes && (
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Notes:</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-line">{invoiceData.notes}</p>
                    </div>
                  )}
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
