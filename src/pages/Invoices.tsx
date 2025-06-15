import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Download, Mail, Palette, Save, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CurrencySelector from "@/components/CurrencySelector";
import ClientSelector from "@/components/ClientSelector";
import InvoicePreviewModal from "@/components/InvoicePreviewModal";
import LogoSignatureUpload from "@/components/LogoSignatureUpload";
import InvoiceTemplateSelector from "@/components/InvoiceTemplateSelector";
import SendInvoiceDialog from "@/components/SendInvoiceDialog";
import { InvoiceData, LineItem, colorThemes } from "@/types/invoice";
import { Client } from "@/types/client";
import { useCustomTemplates } from "@/hooks/useCustomTemplates";
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
  invoiceDate: new Date().toISOString(),
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
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
  const { toast } = useToast();
  const userId = "testUser";
  const { customTemplates, saveCustomTemplate, deleteCustomTemplate, loadCustomTemplates } = useCustomTemplates(userId);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);

  useEffect(() => {
    loadSavedInvoices();
  }, []);

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
      item.id === id ? { ...item, [name]: value, amount: Number(item.quantity) * Number(item.rate) } : item
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
    // For now, just show a toast - this can be expanded later
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <CardTitle className="text-2xl font-bold">Invoices</CardTitle>
        <div className="space-x-2">
          <Button onClick={() => setIsHelpCenterOpen(true)}>Help</Button>
          <Button onClick={() => setIsTemplateDialogOpen(true)}>
            <Palette className="w-4 h-4 mr-2" />
            Choose Template
          </Button>
          <Button onClick={() => setIsLogoDialogOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Logo/Signature
          </Button>
          <Button variant="secondary" onClick={() => setInvoiceData(initialInvoiceData)}>
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      <Separator />

      {/* Invoice Form */}
      <Card className="bg-white shadow-md rounded-md">
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                type="text"
                id="businessName"
                name="businessName"
                value={invoiceData.businessName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="businessSlogan">Business Slogan</Label>
              <Input
                type="text"
                id="businessSlogan"
                name="businessSlogan"
                value={invoiceData.businessSlogan || ""}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="businessAddress">Business Address</Label>
              <Textarea
                id="businessAddress"
                name="businessAddress"
                value={invoiceData.businessAddress}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="businessEmail">Business Email</Label>
              <Input
                type="email"
                id="businessEmail"
                name="businessEmail"
                value={invoiceData.businessEmail}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="businessPhone">Business Phone</Label>
              <Input
                type="tel"
                id="businessPhone"
                name="businessPhone"
                value={invoiceData.businessPhone || ""}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="businessWebsite">Business Website</Label>
              <Input
                type="url"
                id="businessWebsite"
                name="businessWebsite"
                value={invoiceData.businessWebsite || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Client and Invoice Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <ClientSelector 
                clients={clients} 
                onSelectClient={handleClientSelect}
                onAddNewClient={handleAddNewClient}
              />
            </div>
            <div>
              <Label htmlFor="clientEmail">Client Email</Label>
              <Input
                type="email"
                id="clientEmail"
                name="clientEmail"
                value={invoiceData.clientEmail}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="clientAddress">Client Address</Label>
              <Textarea
                id="clientAddress"
                name="clientAddress"
                value={invoiceData.clientAddress}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                type="text"
                id="invoiceNumber"
                name="invoiceNumber"
                value={invoiceData.invoiceNumber}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input
                type="date"
                id="invoiceDate"
                name="invoiceDate"
                value={invoiceData.invoiceDate}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                type="date"
                id="dueDate"
                name="dueDate"
                value={invoiceData.dueDate}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <CurrencySelector value={invoiceData.currency} onChange={handleCurrencyChange} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card className="bg-white shadow-md rounded-md">
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoiceData.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Input
                        type="text"
                        name="description"
                        value={item.description}
                        onChange={(e) => handleLineItemChange(e, item.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Input
                        type="number"
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(e, item.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Input
                        type="number"
                        name="rate"
                        value={item.rate}
                        onChange={(e) => handleLineItemChange(e, item.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(Number(item.amount), invoiceData.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button variant="ghost" onClick={() => deleteLineItem(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button variant="secondary" onClick={addLineItem}>
            <Plus className="w-4 h-4 mr-2" />
            Add Line Item
          </Button>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card className="bg-white shadow-md rounded-md">
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={invoiceData.notes}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="paymentTerms">Payment Terms</Label>
            <Textarea
              id="paymentTerms"
              name="paymentTerms"
              value={invoiceData.paymentTerms || ""}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="paymentInstructions">Payment Instructions</Label>
            <Textarea
              id="paymentInstructions"
              name="paymentInstructions"
              value={invoiceData.paymentInstructions || ""}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="footerText">Footer Text</Label>
            <Textarea
              id="footerText"
              name="footerText"
              value={invoiceData.footerText || ""}
              onChange={handleInputChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card className="bg-white shadow-md rounded-md">
        <CardHeader>
          <CardTitle>Bank Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              type="text"
              id="accountNumber"
              name="accountNumber"
              value={invoiceData.accountNumber || ""}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="bankDetails">Bank Details</Label>
            <Textarea
              id="bankDetails"
              name="bankDetails"
              value={invoiceData.bankDetails || ""}
              onChange={handleInputChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card className="bg-white shadow-md rounded-md">
        <CardHeader>
          <CardTitle>Totals</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label>Subtotal</Label>
            <div className="font-semibold">{formatCurrency(calculateSubtotal(), invoiceData.currency)}</div>
          </div>
          <div>
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              type="number"
              id="taxRate"
              name="taxRate"
              value={invoiceData.taxRate}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label>Tax Amount</Label>
            <div className="font-semibold">{formatCurrency(calculateTax(), invoiceData.currency)}</div>
          </div>
          <div>
            <Label htmlFor="discountAmount">Discount Amount</Label>
            <Input
              type="number"
              id="discountAmount"
              name="discountAmount"
              value={invoiceData.discountAmount}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label>Total</Label>
            <div className="text-xl font-bold">{formatCurrency(calculateTotal(), invoiceData.currency)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button onClick={saveInvoice}>
          <Save className="w-4 h-4 mr-2" />
          Save Invoice
        </Button>
        <Button variant="secondary" onClick={() => setIsSendDialogOpen(true)}>
          <Mail className="w-4 h-4 mr-2" />
          Send Invoice
        </Button>
        <Button variant="destructive" onClick={() => deleteInvoice(invoiceData.invoiceNumber)}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Invoice
        </Button>
      </div>

      <Separator />

      {/* Saved Invoices */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Saved Invoices</h2>
        {savedInvoices.length === 0 ? (
          <div className="text-gray-500">No invoices saved yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedInvoices.map((invoice) => (
              <Card key={invoice.invoiceNumber} className="shadow-sm">
                <CardHeader>
                  <CardTitle>Invoice {invoice.invoiceNumber}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Client: {invoice.clientName}</p>
                  <p>Date: {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                  <p>Total: {formatCurrency(calculateTotalForInvoice(invoice), invoice.currency)}</p>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => editInvoice(invoice)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteInvoice(invoice.invoiceNumber)}>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Support Bubble */}
      <SupportBubble onHelpClick={() => setIsHelpCenterOpen(true)} />
      
      {/* Help Center Modal */}
      <HelpCenter 
        isOpen={isHelpCenterOpen} 
        onClose={() => setIsHelpCenterOpen(false)} 
      />
    </div>
  );

  function calculateTotalForInvoice(invoice: InvoiceData) {
    const subtotal = invoice.lineItems.reduce((acc, item) => acc + Number(item.amount), 0);
    const tax = subtotal * (invoice.taxRate / 100);
    return subtotal + tax - invoice.discountAmount;
  }
};

export default Invoices;
