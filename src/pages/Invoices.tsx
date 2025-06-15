import React, { useState, useEffect, useCallback } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Eye,
  Mail,
  Palette,
  Save,
  Image,
  Edit,
  FileText
} from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/ui/sidebar";
import NewDashboardSidebar from "@/components/NewDashboardSidebar";
import DarkModeToggle from "@/components/DarkModeToggle";
import SupportBubble from "@/components/SupportBubble";
import HelpCenter from "@/components/HelpCenter";
import LogoSignatureUpload from "@/components/LogoSignatureUpload";
import InvoiceTemplateSelector from "@/components/InvoiceTemplateSelector";
import SendInvoiceDialog from "@/components/SendInvoiceDialog";
import InvoicePreviewModal from "@/components/InvoicePreviewModal";
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { useAuthLocal } from "@/hooks/useAuthLocal";
import { formatCurrency, calculateTotal } from "@/utils/invoiceUtils";
import ResponsiveNavButtons from "@/components/ResponsiveNavButtons";
import { InvoiceData as ImportedInvoiceData } from "@/types/invoice";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  businessName: string;
  businessEmail: string;
  businessAddress: string;
  businessPhone: string;
  businessWebsite: string;
  businessSlogan: string;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes: string;
  terms: string;
  currency: string;
  status: 'paid' | 'unpaid' | 'pending';
  businessLogo?: string;
  signatureImage?: string;
  accountNumber: string;
  bankDetails: string;
  paymentTerms: string;
  discountAmount: number;
}

const Invoices: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthLocal();
  const { savedInvoices, saveInvoice } = useInvoiceData(null, user?.email || user?.profileName);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('minimalist');
  const [selectedColorTheme, setSelectedColorTheme] = useState('blue');
  const [selectedCustomTemplate, setSelectedCustomTemplate] = useState<string | null>(null);

  const [formData, setFormData] = useState<InvoiceData>({
    invoiceNumber: "INV-" + Math.floor(Math.random() * 1000),
    invoiceDate: new Date().toLocaleDateString(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toLocaleDateString(),
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    businessName: "InvoiceCraft Pro",
    businessEmail: user?.email || "",
    businessAddress: "",
    businessPhone: "",
    businessWebsite: "",
    businessSlogan: "",
    lineItems: [{ id: uuidv4(), description: "", quantity: 1, rate: 0 }],
    subtotal: 0,
    taxRate: 7.5,
    taxAmount: 0,
    total: 0,
    notes: "",
    terms: "",
    currency: "USD",
    status: 'pending',
    businessLogo: '',
    signatureImage: '',
    accountNumber: '',
    bankDetails: '',
    paymentTerms: '',
    discountAmount: 0,
  });

  useEffect(() => {
    calculateInvoice();
  }, [formData.lineItems, formData.taxRate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLineItemChange = (id: string, field: string, value: any) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      lineItems: prevFormData.lineItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addLineItem = () => {
    setFormData(prevFormData => ({
      ...prevFormData,
      lineItems: [...prevFormData.lineItems, { id: uuidv4(), description: "", quantity: 1, rate: 0 }],
    }));
  };

  const removeLineItem = (id: string) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      lineItems: prevFormData.lineItems.filter(item => item.id !== id),
    }));
  };

  const calculateInvoice = () => {
    const subtotal = formData.lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const taxAmount = subtotal * (formData.taxRate / 100);
    const total = subtotal + taxAmount;

    setFormData(prevFormData => ({
      ...prevFormData,
      subtotal,
      taxAmount,
      total,
    }));
  };

  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const taxRate = parseFloat(e.target.value) || 0;
    setFormData({ ...formData, taxRate });
  };

  const handleCurrencyChange = (value: string) => {
    setFormData({ ...formData, currency: value });
  };

  const handleStatusChange = (value: 'paid' | 'unpaid' | 'pending') => {
    setFormData({ ...formData, status: value });
  };

  const handleSaveInvoice = () => {
    // Convert local InvoiceData to ImportedInvoiceData format
    const invoiceToSave: ImportedInvoiceData = {
      ...formData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      lineItems: formData.lineItems.map(item => ({
        ...item,
        amount: item.quantity * item.rate
      }))
    };
    saveInvoice(invoiceToSave);
    alert("Invoice saved!");
  };

  const loadInvoice = (invoice: ImportedInvoiceData) => {
    const loadedInvoice: InvoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      clientAddress: invoice.clientAddress,
      businessName: invoice.businessName,
      businessEmail: invoice.businessEmail,
      businessAddress: invoice.businessAddress,
      businessPhone: invoice.businessPhone || "",
      businessWebsite: invoice.businessWebsite || "",
      businessSlogan: invoice.businessSlogan || "",
      lineItems: invoice.lineItems.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate
      })),
      subtotal: calculateTotal(invoice) - (invoice.taxRate / 100 * calculateTotal(invoice)) + invoice.discountAmount,
      taxRate: invoice.taxRate,
      taxAmount: (invoice.taxRate / 100) * calculateTotal(invoice),
      total: calculateTotal(invoice),
      notes: invoice.notes,
      terms: invoice.paymentTerms || "",
      currency: invoice.currency,
      status: invoice.status,
      businessLogo: invoice.businessLogo,
      signatureImage: invoice.signatureImage,
      accountNumber: invoice.accountNumber || "",
      bankDetails: invoice.bankDetails || "",
      paymentTerms: invoice.paymentTerms || "",
      discountAmount: invoice.discountAmount
    };
    setFormData(loadedInvoice);
  };

  const handlePreview = () => {
    setSelectedInvoice(formData);
    setIsPreviewOpen(true);
  };

  const handleDownload = () => {
    const input = document.getElementById('invoice-preview');
    if (!input) return;

    const canvasOptions = { scale: 2, useCORS: true };

    html2canvas(input, canvasOptions)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`invoice-${formData.invoiceNumber}.pdf`);
      });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <NewDashboardSidebar />
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border-b bg-white gap-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Invoice Management</h1>
            </div>
            <div className="flex items-center gap-2">
              <ResponsiveNavButtons 
                onHelpClick={() => setIsHelpCenterOpen(true)}
                onChatClick={() => setIsHelpCenterOpen(true)}
              />
              <DarkModeToggle />
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Left Side - Invoice Form */}
              <div className="space-y-6">
                <Card className="bg-white shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                        Create New Invoice
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsTemplateDialogOpen(true)}
                          className="text-xs sm:text-sm"
                        >
                          <Palette className="w-4 h-4 mr-2" />
                          Choose Template
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsLogoDialogOpen(true)}
                          className="text-xs sm:text-sm"
                        >
                          <Image className="w-4 h-4 mr-2" />
                          Logo & Signature
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="invoiceNumber">Invoice Number</Label>
                      <Input
                        type="text"
                        id="invoiceNumber"
                        name="invoiceNumber"
                        value={formData.invoiceNumber}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="invoiceDate">Date</Label>
                        <Input
                          type="text"
                          id="invoiceDate"
                          name="invoiceDate"
                          value={formData.invoiceDate}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                          type="text"
                          id="dueDate"
                          name="dueDate"
                          value={formData.dueDate}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="clientName">Client Name</Label>
                      <Input
                        type="text"
                        id="clientName"
                        name="clientName"
                        value={formData.clientName}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="clientEmail">Client Email</Label>
                      <Input
                        type="email"
                        id="clientEmail"
                        name="clientEmail"
                        value={formData.clientEmail}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="clientAddress">Client Address</Label>
                      <Textarea
                        id="clientAddress"
                        name="clientAddress"
                        value={formData.clientAddress}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>

                    <div>
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        type="text"
                        id="businessName"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="businessEmail">Business Email</Label>
                      <Input
                        type="email"
                        id="businessEmail"
                        name="businessEmail"
                        value={formData.businessEmail}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="businessAddress">Business Address</Label>
                      <Textarea
                        id="businessAddress"
                        name="businessAddress"
                        value={formData.businessAddress}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="businessPhone">Business Phone</Label>
                        <Input
                          type="tel"
                          id="businessPhone"
                          name="businessPhone"
                          value={formData.businessPhone}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessWebsite">Business Website</Label>
                        <Input
                          type="url"
                          id="businessWebsite"
                          name="businessWebsite"
                          value={formData.businessWebsite}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="businessSlogan">Business Slogan</Label>
                      <Input
                        type="text"
                        id="businessSlogan"
                        name="businessSlogan"
                        value={formData.businessSlogan}
                        onChange={handleInputChange}
                      />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>

                    {formData.lineItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                        <div>
                          <Label htmlFor={`description-${item.id}`}>Description</Label>
                          <Input
                            type="text"
                            id={`description-${item.id}`}
                            value={item.description}
                            onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                          <Input
                            type="number"
                            id={`quantity-${item.id}`}
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(item.id, 'quantity', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`rate-${item.id}`}>Rate</Label>
                          <Input
                            type="number"
                            id={`rate-${item.id}`}
                            value={item.rate}
                            onChange={(e) => handleLineItemChange(item.id, 'rate', Number(e.target.value))}
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeLineItem(item.id)}
                          disabled={formData.lineItems.length === 1}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}

                    <Button onClick={addLineItem}>Add Line Item</Button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="taxRate">Tax Rate (%)</Label>
                        <Input
                          type="number"
                          id="taxRate"
                          name="taxRate"
                          value={formData.taxRate}
                          onChange={handleTaxRateChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select value={formData.currency} onValueChange={handleCurrencyChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="NGN">NGN (₦)</SelectItem>
                            <SelectItem value="CAD">CAD (C$)</SelectItem>
                            <SelectItem value="AUD">AUD (A$)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="terms">Terms & Conditions</Label>
                      <Textarea
                        id="terms"
                        name="terms"
                        value={formData.terms}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>

                    <div>
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        type="text"
                        id="accountNumber"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="bankDetails">Bank Details</Label>
                      <Input
                        type="text"
                        id="bankDetails"
                        name="bankDetails"
                        value={formData.bankDetails}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="paymentTerms">Payment Terms</Label>
                      <Textarea
                        id="paymentTerms"
                        name="paymentTerms"
                        value={formData.paymentTerms}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={handleStatusChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="unpaid">Unpaid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Side - Live Preview */}
              <div className="space-y-6">
                <Card className="bg-white shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                        Live Preview
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={handlePreview}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        <Button
                          onClick={handleDownload}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          onClick={() => setIsSendDialogOpen(true)}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </Button>
                        <Button
                          onClick={handleSaveInvoice}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Invoice
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[600px]">
                      <div className="bg-white rounded shadow-sm p-4 sm:p-6 overflow-auto">
                        <div id="invoice-preview">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              {formData.businessLogo && (
                                <img
                                  src={formData.businessLogo}
                                  alt="Business Logo"
                                  className="max-w-40 max-h-20 mb-4"
                                />
                              )}
                              <h2 className="text-2xl font-bold">{formData.businessName}</h2>
                              <p>{formData.businessAddress}</p>
                              <p>{formData.businessEmail}</p>
                              <p>{formData.businessPhone}</p>
                              <p>{formData.businessWebsite}</p>
                              <p>{formData.businessSlogan}</p>
                            </div>
                            <div className="text-right">
                              <h1 className="text-4xl font-bold">INVOICE</h1>
                              <p>Invoice Number: {formData.invoiceNumber}</p>
                              <p>Date: {formData.invoiceDate}</p>
                              <p>Due Date: {formData.dueDate}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h3>Bill to:</h3>
                            <p>{formData.clientName}</p>
                            <p>{formData.clientAddress}</p>
                            <p>{formData.clientEmail}</p>
                          </div>

                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                <th className="text-left py-2">Description</th>
                                <th className="text-right py-2">Quantity</th>
                                <th className="text-right py-2">Rate</th>
                                <th className="text-right py-2">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {formData.lineItems.map((item) => (
                                <tr key={item.id}>
                                  <td className="py-2">{item.description}</td>
                                  <td className="text-right py-2">{item.quantity}</td>
                                  <td className="text-right py-2">{formatCurrency(item.rate)}</td>
                                  <td className="text-right py-2">{formatCurrency(item.quantity * item.rate)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <div className="text-right mt-4">
                            <p>Subtotal: {formatCurrency(formData.subtotal)}</p>
                            <p>Tax ({formData.taxRate}%): {formatCurrency(formData.taxAmount)}</p>
                            <h2 className="text-2xl font-bold">Total: {formatCurrency(formData.total)}</h2>
                          </div>

                          <div className="mt-8">
                            <h3>Notes:</h3>
                            <p>{formData.notes}</p>
                          </div>

                          <div className="mt-8">
                            <h3>Terms & Conditions:</h3>
                            <p>{formData.terms}</p>
                          </div>

                          <div className="mt-8">
                            <h3>Payment Information:</h3>
                            <p>Account Number: {formData.accountNumber}</p>
                            <p>Bank Details: {formData.bankDetails}</p>
                            <p>Payment Terms: {formData.paymentTerms}</p>
                          </div>

                          {formData.signatureImage && (
                            <div className="mt-8">
                              <h3>Signature:</h3>
                              <img
                                src={formData.signatureImage}
                                alt="Signature"
                                className="max-w-40 max-h-20"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Saved Invoices Section */}
            <div className="mt-8">
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                    Saved Invoices ({savedInvoices.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {savedInvoices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm sm:text-base">No saved invoices yet. Create your first invoice above!</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savedInvoices.map((invoice, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 truncate">
                                  Invoice #{invoice.invoiceNumber}
                                </h3>
                                <p className="text-sm text-gray-500 truncate">
                                  {invoice.clientName}
                                </p>
                              </div>
                              <Badge 
                                variant={invoice.status === 'paid' ? 'default' : 'destructive'}
                                className="flex-shrink-0 ml-2"
                              >
                                {invoice.status}
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                              <p>Date: {invoice.invoiceDate}</p>
                              <p>Total: {formatCurrency(calculateTotal(invoice))}</p>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => loadInvoice(invoice)}
                                className="flex-1 text-xs"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const convertedInvoice: InvoiceData = {
                                    invoiceNumber: invoice.invoiceNumber,
                                    invoiceDate: invoice.invoiceDate,
                                    dueDate: invoice.dueDate,
                                    clientName: invoice.clientName,
                                    clientEmail: invoice.clientEmail,
                                    clientAddress: invoice.clientAddress,
                                    businessName: invoice.businessName,
                                    businessEmail: invoice.businessEmail,
                                    businessAddress: invoice.businessAddress,
                                    businessPhone: invoice.businessPhone || "",
                                    businessWebsite: invoice.businessWebsite || "",
                                    businessSlogan: invoice.businessSlogan || "",
                                    lineItems: invoice.lineItems.map(item => ({
                                      id: item.id,
                                      description: item.description,
                                      quantity: item.quantity,
                                      rate: item.rate
                                    })),
                                    subtotal: calculateTotal(invoice) - (invoice.taxRate / 100 * calculateTotal(invoice)) + invoice.discountAmount,
                                    taxRate: invoice.taxRate,
                                    taxAmount: (invoice.taxRate / 100) * calculateTotal(invoice),
                                    total: calculateTotal(invoice),
                                    notes: invoice.notes,
                                    terms: invoice.paymentTerms || "",
                                    currency: invoice.currency,
                                    status: invoice.status,
                                    businessLogo: invoice.businessLogo,
                                    signatureImage: invoice.signatureImage,
                                    accountNumber: invoice.accountNumber || "",
                                    bankDetails: invoice.bankDetails || "",
                                    paymentTerms: invoice.paymentTerms || "",
                                    discountAmount: invoice.discountAmount
                                  };
                                  setSelectedInvoice(convertedInvoice);
                                  setIsPreviewOpen(true);
                                }}
                                className="flex-1 text-xs"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Support Bubble */}
        <SupportBubble onHelpClick={() => setIsHelpCenterOpen(true)} />

        {/* Modals */}
        <LogoSignatureUpload
          onLogoUpload={(logoUrl) => setFormData({...formData, businessLogo: logoUrl})}
          onSignatureUpload={(signatureUrl) => setFormData({...formData, signatureImage: signatureUrl})}
          currentLogo={formData.businessLogo}
          currentSignature={formData.signatureImage}
        />

        <InvoiceTemplateSelector
          isOpen={isTemplateDialogOpen}
          onClose={() => setIsTemplateDialogOpen(false)}
          onSelectTemplate={(template, colorTheme, customTemplateId) => {
            setSelectedTemplate(template);
            setSelectedColorTheme(colorTheme);
            if (customTemplateId) setSelectedCustomTemplate(customTemplateId);
            setIsTemplateDialogOpen(false);
          }}
          selectedTemplate={selectedTemplate}
          selectedColorTheme={selectedColorTheme}
          onUploadCustomTemplate={(template) => console.log('Custom template:', template)}
          onDeleteCustomTemplate={(templateId) => console.log('Delete template:', templateId)}
        />

        <SendInvoiceDialog
          isOpen={isSendDialogOpen}
          onClose={() => setIsSendDialogOpen(false)}
          onSend={() => console.log('Invoice sent!')}
          invoiceData={formData}
        />

        <InvoicePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          invoiceData={selectedInvoice || formData}
          template={selectedTemplate}
          colorTheme={selectedColorTheme}
        />

        <HelpCenter 
          isOpen={isHelpCenterOpen} 
          onClose={() => setIsHelpCenterOpen(false)} 
        />
      </div>
    </SidebarProvider>
  );
};

export default Invoices;
