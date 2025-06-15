import React, { useState, useRef } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import NewDashboardSidebar from "@/components/NewDashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, Search, Edit, Trash2, Download, Mail, FileText, 
  DollarSign, Calendar, User, Building, Eye, Copy, Send, Palette
} from "lucide-react";
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { useClients } from "@/hooks/useClients";
import { useAuthLocal } from "@/hooks/useAuthLocal";
import { currencies } from "@/types/invoice";
import { formatCurrency, calculateTotal } from "@/utils/invoiceUtils";
import InvoiceTemplateSelector from "@/components/InvoiceTemplateSelector";
import LogoSignatureUpload from "@/components/LogoSignatureUpload";
import InvoicePreviewModal from "@/components/InvoicePreviewModal";

const Invoices: React.FC = () => {
  const { user } = useAuthLocal();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  const {
    invoiceData,
    setInvoiceData,
    savedInvoices,
    saveInvoice,
    loadInvoice,
    deleteInvoice,
    createNewInvoice,
    addLineItem,
    removeLineItem,
    updateLineItem,
    toggleInvoiceStatus,
    generateInvoiceNumber
  } = useInvoiceData(null, user?.email || user?.profileName);

  const { clients } = useClients(null, user?.email || user?.profileName);

  const filteredInvoices = savedInvoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNew = () => {
    createNewInvoice();
    setViewMode('create');
  };

  const handleEditInvoice = (invoice: any) => {
    loadInvoice(invoice);
    setSelectedInvoice(invoice.id);
    setViewMode('edit');
  };

  const handleSaveInvoice = () => {
    saveInvoice();
    setViewMode('list');
    setSelectedInvoice(null);
  };

  const handleDuplicateInvoice = (invoice: any) => {
    const duplicated = {
      ...invoice,
      id: undefined,
      invoiceNumber: generateInvoiceNumber(),
      status: 'unpaid' as const,
      createdAt: new Date().toISOString()
    };
    loadInvoice(duplicated);
    setViewMode('create');
  };

  const handleEmailInvoice = (invoice: any) => {
    // This would integrate with EmailJS
    toast({
      title: "Email Feature",
      description: "Email functionality would be integrated with EmailJS here.",
    });
  };

  const handleTemplateSelect = (template: string, colorTheme: string) => {
    setInvoiceData(prev => ({
      ...prev,
      template: template as any,
      colorTheme: colorTheme as any
    }));
  };

  const handlePreviewInvoice = () => {
    setShowPreviewModal(true);
  };

  const handleDownloadPDF = (invoice?: any) => {
    // This would implement PDF download
    toast({
      title: "Download Feature",
      description: "PDF download functionality would be implemented here.",
    });
    if (showPreviewModal) {
      setShowPreviewModal(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gray-50">
          <NewDashboardSidebar />
          <div className="flex-1">
            <div className="p-4 border-b bg-white">
              <SidebarTrigger />
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {viewMode === 'create' ? 'Create New Invoice' : 'Edit Invoice'}
                  </h1>
                  <p className="text-gray-600">Fill in the invoice details below.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowTemplateSelector(true)}>
                    <Palette className="w-4 h-4 mr-2" />
                    Choose Template
                  </Button>
                  <Button variant="outline" onClick={handlePreviewInvoice}>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" onClick={() => setViewMode('list')}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveInvoice} className="bg-blue-600 hover:bg-blue-700">
                    Save Invoice
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Template Selection Card */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Template & Style</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Current Template: {invoiceData.template || 'Minimalist'}</p>
                        <p className="text-sm text-gray-600">Color Theme: {invoiceData.colorTheme || 'Blue'}</p>
                      </div>
                      <Button variant="outline" onClick={() => setShowTemplateSelector(true)}>
                        <Palette className="w-4 h-4 mr-2" />
                        Change Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Logo & Signature Upload */}
                <LogoSignatureUpload
                  businessLogo={invoiceData.businessLogo}
                  signatureImage={invoiceData.signatureImage}
                  onLogoChange={(dataUrl) => setInvoiceData(prev => ({ ...prev, businessLogo: dataUrl }))}
                  onSignatureChange={(dataUrl) => setInvoiceData(prev => ({ ...prev, signatureImage: dataUrl }))}
                  onLogoClear={() => setInvoiceData(prev => ({ ...prev, businessLogo: "" }))}
                  onSignatureClear={() => setInvoiceData(prev => ({ ...prev, signatureImage: "" }))}
                />

                {/* Invoice Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Invoice Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="invoiceNumber">Invoice Number</Label>
                        <Input
                          id="invoiceNumber"
                          value={invoiceData.invoiceNumber}
                          onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select 
                          value={invoiceData.currency} 
                          onValueChange={(value) => setInvoiceData(prev => ({ ...prev, currency: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="invoiceDate">Invoice Date</Label>
                        <Input
                          id="invoiceDate"
                          type="date"
                          value={invoiceData.invoiceDate}
                          onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={invoiceData.dueDate}
                          onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Client Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Client Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="clientSelect">Select Client (Optional)</Label>
                      <Select onValueChange={(clientId) => {
                        const client = clients.find(c => c.id === clientId);
                        if (client) {
                          setInvoiceData(prev => ({
                            ...prev,
                            clientName: client.name,
                            clientEmail: client.email,
                            clientAddress: client.address
                          }));
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose existing client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="clientName">Client Name</Label>
                      <Input
                        id="clientName"
                        value={invoiceData.clientName}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, clientName: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="clientEmail">Client Email</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={invoiceData.clientEmail}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, clientEmail: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="clientAddress">Client Address</Label>
                      <Textarea
                        id="clientAddress"
                        value={invoiceData.clientAddress}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, clientAddress: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Business Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Business Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={invoiceData.businessName}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, businessName: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="businessEmail">Business Email</Label>
                      <Input
                        id="businessEmail"
                        type="email"
                        value={invoiceData.businessEmail}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, businessEmail: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="businessAddress">Business Address</Label>
                      <Textarea
                        id="businessAddress"
                        value={invoiceData.businessAddress}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, businessAddress: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Line Items */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Invoice Items</CardTitle>
                      <Button onClick={addLineItem} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {invoiceData.lineItems.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                          <div className="col-span-4">
                            <Label>Description</Label>
                            <Input
                              value={item.description}
                              onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                              placeholder="Item description"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(item.id, 'quantity', Number(e.target.value))}
                              min="1"
                            />
                          </div>
                          <div className="col-span-3">
                            <Label>Rate</Label>
                            <Input
                              type="number"
                              value={item.rate}
                              onChange={(e) => updateLineItem(item.id, 'rate', Number(e.target.value))}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Amount</Label>
                            <div className="font-semibold text-lg">
                              {formatCurrency(item.amount, invoiceData.currency)}
                            </div>
                          </div>
                          <div className="col-span-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeLineItem(item.id)}
                              disabled={invoiceData.lineItems.length === 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="mt-6 space-y-2 max-w-md ml-auto">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(
                          invoiceData.lineItems.reduce((sum, item) => sum + item.amount, 0),
                          invoiceData.currency
                        )}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax ({invoiceData.taxRate}%):</span>
                        <span>{formatCurrency(
                          (invoiceData.lineItems.reduce((sum, item) => sum + item.amount, 0) * invoiceData.taxRate) / 100,
                          invoiceData.currency
                        )}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-{formatCurrency(invoiceData.discountAmount, invoiceData.currency)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>{formatCurrency(calculateTotal(invoiceData), invoiceData.currency)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="taxRate">Tax Rate (%)</Label>
                        <Input
                          id="taxRate"
                          type="number"
                          value={invoiceData.taxRate}
                          onChange={(e) => setInvoiceData(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label htmlFor="discount">Discount Amount</Label>
                        <Input
                          id="discount"
                          type="number"
                          value={invoiceData.discountAmount}
                          onChange={(e) => setInvoiceData(prev => ({ ...prev, discountAmount: Number(e.target.value) }))}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Notes & Payment Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={invoiceData.notes}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add any notes or payment instructions here..."
                      rows={4}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Template Selector Modal */}
        <InvoiceTemplateSelector
          isOpen={showTemplateSelector}
          onClose={() => setShowTemplateSelector(false)}
          currentTemplate={invoiceData.template || 'minimalist'}
          currentColorTheme={invoiceData.colorTheme || 'blue'}
          onTemplateSelect={handleTemplateSelect}
        />

        {/* Preview Modal */}
        <InvoicePreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          invoiceData={invoiceData}
          formatCurrency={formatCurrency}
          calculateSubtotal={() => invoiceData.lineItems.reduce((sum, item) => sum + item.amount, 0)}
          calculateTax={() => (invoiceData.lineItems.reduce((sum, item) => sum + item.amount, 0) * invoiceData.taxRate) / 100}
          calculateTotal={() => calculateTotal(invoiceData)}
          onDownload={handleDownloadPDF}
        />
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <NewDashboardSidebar />
        <div className="flex-1">
          <div className="p-4 border-b bg-white">
            <SidebarTrigger />
          </div>
          
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
                <p className="text-gray-600">Manage and track all your invoices.</p>
              </div>
              <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                      <p className="text-2xl font-bold text-gray-900">{savedInvoices.length}</p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-100">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Paid</p>
                      <p className="text-2xl font-bold text-green-600">
                        {savedInvoices.filter(inv => inv.status === 'paid').length}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-green-100">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Unpaid</p>
                      <p className="text-2xl font-bold text-red-600">
                        {savedInvoices.filter(inv => inv.status === 'unpaid').length}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-red-100">
                      <Calendar className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(
                          savedInvoices.reduce((sum, inv) => sum + calculateTotal(inv), 0)
                        )}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-purple-100">
                      <Building className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search invoices by number, client, or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Invoices Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Invoices ({filteredInvoices.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm ? "No invoices found" : "No invoices yet"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm 
                        ? "Try adjusting your search terms" 
                        : "Get started by creating your first invoice"
                      }
                    </p>
                    {!searchTerm && (
                      <Button onClick={handleCreateNew}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Invoice
                      </Button>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{invoice.clientName}</p>
                              <p className="text-sm text-gray-500">{invoice.clientEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(calculateTotal(invoice), invoice.currency)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleInvoiceStatus(invoice.id!)}
                                title="Toggle Status"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditInvoice(invoice)}
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDuplicateInvoice(invoice)}
                                title="Duplicate"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEmailInvoice(invoice)}
                                title="Email"
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadPDF(invoice)}
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" title="Delete">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete invoice {invoice.invoiceNumber}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteInvoice(invoice.id!)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Invoices;
