import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Download, Mail, Palette, Save, Trash2, Edit, HelpCircle, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CurrencySelector from "@/components/CurrencySelector";
import ClientSelector from "@/components/ClientSelector";
import InvoicePreviewModal from "@/components/InvoicePreviewModal";
import LogoSignatureUpload from "@/components/LogoSignatureUpload";
import InvoiceTemplateSelector from "@/components/InvoiceTemplateSelector";
import SendInvoiceDialog from "@/components/SendInvoiceDialog";
import InvoicePreview from "@/components/InvoicePreview";
import { InvoiceData, LineItem } from "@/types/invoice";
import { Client } from "@/types/client";
import { useCustomTemplates } from "@/hooks/useCustomTemplates";
import { useAuthLocal } from "@/hooks/useAuthLocal";
import SupportBubble from "@/components/SupportBubble";
import HelpCenter from "@/components/HelpCenter";

const initialInvoiceData: InvoiceData = {
  businessName: "Your Business Name",
  businessSlogan: "Your Slogan",
  businessAddress: "123 Business St, City, State, Zip",
  businessEmail: "email@example.com",
  businessPhone: "123-456-7890",
  businessWebsite: "www.example.com",
  businessLogo: "",
  clientName: "Client Name",
  clientEmail: "client@example.com",
  clientAddress: "456 Client St, City, State, Zip",
  invoiceNumber: "INV-001",
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  currency: "USD",
  lineItems: [{ id: "1", description: "Service 1", quantity: 1, rate: 100, amount: 100 }],
  taxRate: 0,
  discountAmount: 0,
  notes: "Thanks for your business!",
  paymentTerms: "Net 30 days",
  accountNumber: "0000000000",
  bankDetails: "Bank Name, Branch, SWIFT Code",
  signatureImage: "",
  signatureName: "John Doe",
  signaturePosition: "CEO",
  signatureNote: "Electronically Signed",
  template: "minimalist",
  colorTheme: "blue",
  status: "unpaid",
  paymentInstructions: "Please pay within 30 days",
  footerText: "Thank you for your business!"
};

const Invoices = () => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(initialInvoiceData);
  const [savedInvoices, setSavedInvoices] = useState<InvoiceData[]>([]);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([
    { 
      id: "1", 
      name: "Acme Corp", 
      email: "acme@example.com", 
      phone: "123-456-7890",
      address: "123 Main St",
      createdAt: new Date().toISOString()
    },
    { 
      id: "2", 
      name: "Beta Co", 
      email: "beta@example.com", 
      phone: "098-765-4321",
      address: "456 Elm St",
      createdAt: new Date().toISOString()
    },
  ]);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthLocal();
  const userId = user?.email || "testUser";
  const { customTemplates, saveCustomTemplate, deleteCustomTemplate, loadCustomTemplates } = useCustomTemplates(userId);

  useEffect(() => {
    loadSavedInvoices();
    // Set user info if logged in
    if (user) {
      setInvoiceData(prev => ({
        ...prev,
        businessName: user.profileName || prev.businessName,
        businessEmail: user.email || prev.businessEmail,
        signatureName: user.profileName || prev.signatureName
      }));
    }
  }, [user]);

  const loadSavedInvoices = () => {
    const storedInvoices = localStorage.getItem("savedInvoices");
    if (storedInvoices) {
      setSavedInvoices(JSON.parse(storedInvoices));
    }
  };

  const saveInvoice = () => {
    const updatedInvoices = [...savedInvoices, invoiceData];
    setSavedInvoices(updatedInvoices);
    localStorage.setItem("savedInvoices", JSON.stringify(updatedInvoices));
    toast({
      title: "Invoice Saved!",
      description: "Your invoice has been saved successfully.",
    });
  };

  const deleteInvoice = (invoiceNumber: string) => {
    const updatedInvoices = savedInvoices.filter((inv) => inv.invoiceNumber !== invoiceNumber);
    setSavedInvoices(updatedInvoices);
    localStorage.setItem("savedInvoices", JSON.stringify(updatedInvoices));
    toast({
      title: "Invoice Deleted!",
      description: "The invoice has been deleted.",
    });
  };

  const editInvoice = (invoice: InvoiceData) => {
    setInvoiceData(invoice);
    toast({
      title: "Invoice Loaded!",
      description: "Invoice data loaded for editing.",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoiceData({ ...invoiceData, [name]: value });
  };

  const handleLineItemChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const { name, value } = e.target;
    const updatedLineItems = invoiceData.lineItems.map((item) =>
      item.id === id ? { 
        ...item, 
        [name]: name === 'quantity' || name === 'rate' ? Number(value) : value,
        amount: name === 'quantity' ? Number(value) * item.rate : name === 'rate' ? item.quantity * Number(value) : item.amount
      } : item
    );
    setInvoiceData({ ...invoiceData, lineItems: updatedLineItems });
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "New Item",
      quantity: 1,
      rate: 50,
      amount: 50,
    };
    setInvoiceData({ ...invoiceData, lineItems: [...invoiceData.lineItems, newItem] });
  };

  const deleteLineItem = (id: string) => {
    const updatedLineItems = invoiceData.lineItems.filter((item) => item.id !== id);
    setInvoiceData({ ...invoiceData, lineItems: updatedLineItems });
  };

  const handleCurrencyChange = (currencyCode: string) => {
    setInvoiceData({ ...invoiceData, currency: currencyCode });
  };

  const handleClientSelect = (client: Client) => {
    setInvoiceData({
      ...invoiceData,
      clientName: client.name,
      clientEmail: client.email,
      clientAddress: client.address,
    });
  };

  const handleAddNewClient = () => {
    toast({
      title: "Add New Client",
      description: "This feature will be implemented soon.",
    });
  };

  const formatCurrency = (amount: number, currencyCode?: string) => {
    const currency = currencyCode || invoiceData.currency || "USD";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const calculateSubtotal = () => {
    return invoiceData.lineItems.reduce((acc, item) => acc + Number(item.amount), 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (invoiceData.taxRate / 100);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    return subtotal + tax - invoiceData.discountAmount;
  };

  const handleLogoUpload = (logoUrl: string) => {
    setInvoiceData({ ...invoiceData, businessLogo: logoUrl });
    setIsLogoDialogOpen(false);
  };

  const handleSignatureUpload = (signatureUrl: string) => {
    setInvoiceData({ ...invoiceData, signatureImage: signatureUrl });
    setIsLogoDialogOpen(false);
  };

  const handleTemplateSelect = (template: InvoiceData['template'], colorTheme: InvoiceData['colorTheme'], customTemplateId?: string) => {
    setInvoiceData({ ...invoiceData, template: template, colorTheme: colorTheme });
    setIsTemplateDialogOpen(false);
  };

  const handleSendInvoice = () => {
    setIsSendDialogOpen(false);
    toast({
      title: "Invoice Sent!",
      description: "The invoice has been sent to the client.",
    });
  };

  const calculateTotalForInvoice = (invoice: InvoiceData) => {
    const subtotal = invoice.lineItems.reduce((acc, item) => acc + Number(item.amount), 0);
    const tax = subtotal * (invoice.taxRate / 100);
    return subtotal + tax - invoice.discountAmount;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
            <p className="text-sm text-gray-500 mt-1">Generate professional invoices for your clients</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsHelpCenterOpen(true)}>
              <HelpCircle className="w-4 h-4 mr-2" />
              FAQ
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsHelpCenterOpen(true)}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Invoice Form */}
          <div className="space-y-6">
            {/* Invoice Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Invoice Details
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setIsTemplateDialogOpen(true)}>
                      <Palette className="w-4 h-4 mr-2" />
                      Template
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsLogoDialogOpen(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Logo
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* People Section */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">People</Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {user?.profileName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.profileName || 'Your Name'}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email || 'your@email.com'}</p>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="clientName" className="text-xs text-gray-600">Client</Label>
                      <ClientSelector 
                        clients={clients} 
                        onSelectClient={handleClientSelect}
                        onAddNewClient={handleAddNewClient}
                      />
                    </div>
                  </div>
                </div>

                {/* Invoice Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoiceNumber" className="text-xs text-gray-600">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      name="invoiceNumber"
                      value={invoiceData.invoiceNumber}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="invoiceDate" className="text-xs text-gray-600">Invoice Date</Label>
                    <Input
                      type="date"
                      id="invoiceDate"
                      name="invoiceDate"
                      value={invoiceData.invoiceDate}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate" className="text-xs text-gray-600">Due Date</Label>
                    <Input
                      type="date"
                      id="dueDate"
                      name="dueDate"
                      value={invoiceData.dueDate}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Currency</Label>
                    <CurrencySelector value={invoiceData.currency} onChange={handleCurrencyChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products/Services Card */}
            <Card>
              <CardHeader>
                <CardTitle>Product</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoiceData.lineItems.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                      <div className="col-span-5">
                        <Label className="text-xs text-gray-600">Item</Label>
                        <Input
                          name="description"
                          value={item.description}
                          onChange={(e) => handleLineItemChange(e, item.id)}
                          placeholder="Description"
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs text-gray-600">Qty</Label>
                        <Input
                          type="number"
                          name="quantity"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(e, item.id)}
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs text-gray-600">Rate</Label>
                        <Input
                          type="number"
                          name="rate"
                          value={item.rate}
                          onChange={(e) => handleLineItemChange(e, item.id)}
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs text-gray-600">Amount</Label>
                        <div className="mt-1 p-2 bg-white rounded border text-sm font-medium">
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        {invoiceData.lineItems.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteLineItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="outline" onClick={addLineItem} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Line
                  </Button>

                  {/* Totals */}
                  <div className="mt-6 pt-4 border-t space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span>Tax</span>
                        <Input
                          type="number"
                          name="taxRate"
                          value={invoiceData.taxRate}
                          onChange={handleInputChange}
                          className="w-16 h-6 text-xs"
                          placeholder="0"
                        />
                        <span>%</span>
                      </div>
                      <span className="font-medium">{formatCurrency(calculateTax())}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span>Discount</span>
                        <Input
                          type="number"
                          name="discountAmount"
                          value={invoiceData.discountAmount}
                          onChange={handleInputChange}
                          className="w-20 h-6 text-xs"
                          placeholder="0"
                        />
                      </div>
                      <span className="font-medium">-{formatCurrency(invoiceData.discountAmount)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={saveInvoice} className="flex-1 sm:flex-none">
                <Save className="w-4 h-4 mr-2" />
                Save Invoice
              </Button>
              <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" onClick={() => setIsSendDialogOpen(true)}>
                <Mail className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>

          {/* Right Side - Preview */}
          <div className="lg:sticky lg:top-6">
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Preview
                  </CardTitle>
                  <Badge variant="secondary">
                    {invoiceData.template || 'Default'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                <div className="bg-white border rounded-lg overflow-hidden" style={{ height: '600px', overflowY: 'auto' }}>
                  <div className="transform scale-75 origin-top-left" style={{ width: '133.33%', height: '133.33%' }}>
                    <InvoicePreview
                      invoiceData={invoiceData}
                      formatCurrency={formatCurrency}
                      calculateSubtotal={calculateSubtotal}
                      calculateTax={calculateTax}
                      calculateTotal={calculateTotal}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <InvoicePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        invoiceData={invoiceData}
        formatCurrency={formatCurrency}
        calculateSubtotal={calculateSubtotal}
        calculateTax={calculateTax}
        calculateTotal={calculateTotal}
        onEmail={() => setIsSendDialogOpen(true)}
      />

      <LogoSignatureUpload
        isOpen={isLogoDialogOpen}
        onClose={() => setIsLogoDialogOpen(false)}
        onLogoUpload={handleLogoUpload}
        onSignatureUpload={handleSignatureUpload}
        currentLogo={invoiceData.businessLogo}
        currentSignature={invoiceData.signatureImage}
      />

      <InvoiceTemplateSelector
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        onTemplateSelect={handleTemplateSelect}
        currentTemplate={invoiceData.template}
        currentColorTheme={invoiceData.colorTheme}
        customTemplates={customTemplates}
        onSaveCustomTemplate={saveCustomTemplate}
        onDeleteCustomTemplate={deleteCustomTemplate}
      />

      <SendInvoiceDialog
        isOpen={isSendDialogOpen}
        onClose={() => setIsSendDialogOpen(false)}
        onSend={handleSendInvoice}
        invoiceData={invoiceData}
      />

      <SupportBubble onHelpClick={() => setIsHelpCenterOpen(true)} />
      
      <HelpCenter 
        isOpen={isHelpCenterOpen} 
        onClose={() => setIsHelpCenterOpen(false)} 
      />
    </div>
  );
};

export default Invoices;
