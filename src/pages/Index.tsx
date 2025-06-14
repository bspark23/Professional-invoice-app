
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Trash2, Download, Save, Eye, FileText, Printer, Moon, Sun, Check, X, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import LandingPage from "@/components/LandingPage";

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
  businessLogo?: string;
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

const InvoiceForm = ({
  invoiceData,
  setInvoiceData,
  addLineItem,
  removeLineItem,
  updateLineItem,
}: {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
  addLineItem: () => void;
  removeLineItem: (id: string) => void;
  updateLineItem: (id: string, field: keyof LineItem, value: string | number) => void;
}) => {
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
  );
};

const InvoicePreview = ({
  invoiceData,
  formatCurrency,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
}: {
  invoiceData: InvoiceData;
  formatCurrency: (amount: number, currencyCode?: string) => string;
  calculateSubtotal: () => number;
  calculateTax: () => number;
  calculateTotal: () => number;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Invoice Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white dark:bg-gray-800 border rounded-lg p-6 space-y-6">
          {/* Invoice Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {invoiceData.businessLogo && (
                <img 
                  src={invoiceData.businessLogo} 
                  alt="Company Logo" 
                  className="w-12 h-12 object-contain"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{invoiceData.businessName}</h2>
              </div>
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
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 grid grid-cols-12 gap-2 p-3 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-center">Rate</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>
              {invoiceData.lineItems.map((item, index) => (
                <div key={item.id} className={`grid grid-cols-12 gap-2 p-3 text-sm ${index < invoiceData.lineItems.length - 1 ? 'border-b border-gray-300 dark:border-gray-600' : ''}`}>
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
  );
};

const PrintView = ({
  invoiceData,
  formatCurrency,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  exportToPDF,
  exportToImage,
  setViewMode,
}: {
  invoiceData: InvoiceData;
  formatCurrency: (amount: number, currencyCode?: string) => string;
  calculateSubtotal: () => number;
  calculateTax: () => number;
  calculateTotal: () => number;
  exportToPDF: () => void;
  exportToImage: (format: 'png' | 'jpeg') => void;
  setViewMode: React.Dispatch<React.SetStateAction<'create' | 'list' | 'print'>>;
}) => {
  return (
    <div className="min-h-screen bg-white print:bg-white">
      <div className="max-w-4xl mx-auto p-8 print:p-0">
        <div className="flex justify-between items-center mb-8 print:hidden">
          <h1 className="text-2xl font-bold text-gray-900">Print Preview</h1>
          <div className="flex gap-2">
            <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportToPDF}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToImage('png')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToImage('jpeg')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export as JPEG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setViewMode('create')} variant="outline">
              Back to Edit
            </Button>
          </div>
        </div>
        
        {/* Beautiful Landing Page Section */}
        <div className="mb-16 print:mb-8 print:page-break-after-always">
          <LandingPage 
            businessName={invoiceData.businessName}
            businessLogo={invoiceData.businessLogo}
            invoiceNumber={invoiceData.invoiceNumber}
            clientName={invoiceData.clientName}
            total={formatCurrency(calculateTotal())}
            status={invoiceData.status}
            currency={currencies.find(c => c.code === invoiceData.currency)?.name || 'USD'}
          />
        </div>
        
        {/* Invoice Content */}
        <div className="invoice-print-content bg-white border rounded-lg p-8 print:border-0 print:shadow-none print:bg-white">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              {invoiceData.businessLogo && (
                <img 
                  src={invoiceData.businessLogo} 
                  alt="Company Logo" 
                  className="w-16 h-16 object-contain"
                />
              )}
              <div>
                <h2 className="text-3xl font-bold text-blue-600 print:text-blue-600">{invoiceData.businessName}</h2>
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-semibold text-gray-900 print:text-black">INVOICE</h3>
              <p className="text-gray-600 print:text-black">#{invoiceData.invoiceNumber}</p>
              <Badge variant={invoiceData.status === 'paid' ? 'default' : 'destructive'} className="print:bg-white print:text-black print:border print:border-gray-400">
                {invoiceData.status === 'paid' ? '✅ Paid' : '❌ Unpaid'}
              </Badge>
            </div>
          </div>

          <Separator className="mb-8 print:border-gray-300" />

          {/* Client and Date Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 print:text-black">Bill To:</h4>
              <div className="text-gray-600 print:text-black">
                <p className="font-medium">{invoiceData.clientName}</p>
                <p>{invoiceData.clientEmail}</p>
                <p className="whitespace-pre-line">{invoiceData.clientAddress}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="space-y-2 text-gray-600 print:text-black">
                <p><span className="font-medium">Invoice Date:</span> {invoiceData.invoiceDate}</p>
                <p><span className="font-medium">Due Date:</span> {invoiceData.dueDate}</p>
                <p><span className="font-medium">Currency:</span> {currencies.find(c => c.code === invoiceData.currency)?.name}</p>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-8">
            <div className="border border-gray-400 rounded-lg overflow-hidden print:border-gray-400">
              <div className="bg-gray-50 grid grid-cols-12 gap-2 p-4 text-sm font-medium text-gray-700 print:bg-gray-100 print:text-black border-b border-gray-400 print:border-gray-400">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-center">Rate</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>
              {invoiceData.lineItems.map((item, index) => (
                <div key={item.id} className={`grid grid-cols-12 gap-2 p-4 text-sm print:text-black ${index < invoiceData.lineItems.length - 1 ? 'border-b border-gray-400 print:border-gray-400' : ''}`}>
                  <div className="col-span-6">{item.description}</div>
                  <div className="col-span-2 text-center">{item.quantity}</div>
                  <div className="col-span-2 text-center">{formatCurrency(item.rate)}</div>
                  <div className="col-span-2 text-right">{formatCurrency(item.amount)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-3 mb-8 text-gray-900 print:text-black">
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
            <Separator className="print:border-gray-300" />
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span>{formatCurrency(calculateTotal())}</span>
            </div>
          </div>

          {/* Notes */}
          {invoiceData.notes && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 print:text-black">Notes:</h4>
              <p className="text-gray-600 whitespace-pre-line print:text-black">{invoiceData.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InvoiceList = ({
  savedInvoices,
  formatCurrency,
  toggleInvoiceStatus,
  loadInvoice,
  deleteInvoice,
  setViewMode,
  isDarkMode,
  toggleDarkMode,
}: {
  savedInvoices: InvoiceData[];
  formatCurrency: (amount: number, currencyCode?: string) => string;
  toggleInvoiceStatus: (invoiceId: string) => void;
  loadInvoice: (invoice: InvoiceData) => void;
  deleteInvoice: (invoiceId: string) => void;
  setViewMode: React.Dispatch<React.SetStateAction<'create' | 'list' | 'print'>>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}) => {
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
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
};

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
    businessLogo: "",
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
      businessLogo: invoiceData.businessLogo,
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
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Set consistent colors for PDF
      const primaryColor = [0, 0, 0]; // Black text
      const blueColor = [59, 130, 246]; // Blue for business name
      const greenColor = [34, 197, 94]; // Green for paid status
      const redColor = [239, 68, 68]; // Red for unpaid status
      
      let yPosition = 20;
      
      // Add logo and business name section
      if (invoiceData.businessLogo) {
        try {
          // Convert base64 to proper format for jsPDF
          let logoData = invoiceData.businessLogo;
          if (logoData.startsWith('data:image/')) {
            pdf.addImage(logoData, 'JPEG', 20, yPosition, 30, 20);
          }
        } catch (error) {
          console.log('Error adding logo to PDF:', error);
        }
      }
      
      // Business name
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
      pdf.text(invoiceData.businessName, invoiceData.businessLogo ? 60 : 20, yPosition + 15);
      
      // Invoice title and details on the right
      pdf.setFontSize(16);
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.text('INVOICE', 150, yPosition + 10);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`#${invoiceData.invoiceNumber}`, 150, yPosition + 20);
      
      // Status badge
      pdf.setFontSize(9);
      if (invoiceData.status === 'paid') {
        pdf.setTextColor(greenColor[0], greenColor[1], greenColor[2]);
        pdf.text('✅ Paid', 150, yPosition + 30);
      } else {
        pdf.setTextColor(redColor[0], redColor[1], redColor[2]);
        pdf.text('❌ Unpaid', 150, yPosition + 30);
      }
      
      yPosition += 50;
      
      // Separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, yPosition, 190, yPosition);
      yPosition += 15;
      
      // Client and Date Info
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.text('Bill To:', 20, yPosition);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      yPosition += 10;
      pdf.text(invoiceData.clientName, 20, yPosition);
      yPosition += 8;
      pdf.text(invoiceData.clientEmail, 20, yPosition);
      yPosition += 8;
      
      const addressLines = invoiceData.clientAddress.split('\n');
      addressLines.forEach((line) => {
        pdf.text(line, 20, yPosition);
        yPosition += 8;
      });
      
      // Date information on the right
      let rightYPosition = yPosition - (addressLines.length + 2) * 8 - 10;
      pdf.text(`Invoice Date: ${invoiceData.invoiceDate}`, 120, rightYPosition);
      rightYPosition += 8;
      pdf.text(`Due Date: ${invoiceData.dueDate}`, 120, rightYPosition);
      rightYPosition += 8;
      pdf.text(`Currency: ${currencies.find(c => c.code === invoiceData.currency)?.name}`, 120, rightYPosition);
      
      yPosition += 20;
      
      // Line items table with borders
      pdf.setFillColor(249, 250, 251);
      pdf.rect(20, yPosition - 5, 170, 12, 'F');
      
      // Table borders
      pdf.setDrawColor(100, 100, 100);
      pdf.setLineWidth(0.5);
      pdf.rect(20, yPosition - 5, 170, 12); // Header border
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Description', 25, yPosition + 3);
      pdf.text('Qty', 120, yPosition + 3);
      pdf.text('Rate', 140, yPosition + 3);
      pdf.text('Amount', 170, yPosition + 3);
      
      yPosition += 15;
      
      // Line items with borders
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      
      invoiceData.lineItems.forEach((item, index) => {
        // Draw row borders
        pdf.setDrawColor(150, 150, 150);
        pdf.setLineWidth(0.3);
        pdf.rect(20, yPosition - 5, 170, 12); // Row border
        
        pdf.text(item.description || 'No description', 25, yPosition + 3);
        pdf.text(item.quantity.toString(), 125, yPosition + 3);
        pdf.text(formatCurrency(item.rate), 140, yPosition + 3);
        pdf.text(formatCurrency(item.amount), 170, yPosition + 3);
        yPosition += 12;
      });
      
      yPosition += 15;
      
      // Totals section
      const totalsStartX = 120;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Subtotal:`, totalsStartX, yPosition);
      pdf.text(formatCurrency(calculateSubtotal()), 170, yPosition);
      yPosition += 10;
      
      if (invoiceData.taxRate > 0) {
        pdf.text(`Tax (${invoiceData.taxRate}%):`, totalsStartX, yPosition);
        pdf.text(formatCurrency(calculateTax()), 170, yPosition);
        yPosition += 10;
      }
      
      if (invoiceData.discountAmount > 0) {
        pdf.text(`Discount:`, totalsStartX, yPosition);
        pdf.text(`-${formatCurrency(invoiceData.discountAmount)}`, 170, yPosition);
        yPosition += 10;
      }
      
      // Total line
      pdf.setDrawColor(0, 0, 0);
      pdf.line(totalsStartX, yPosition + 2, 190, yPosition + 2);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text(`Total:`, totalsStartX, yPosition);
      pdf.text(formatCurrency(calculateTotal()), 170, yPosition);
      
      // Notes section
      if (invoiceData.notes) {
        yPosition += 25;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text('Notes:', 20, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        yPosition += 10;
        
        const noteLines = invoiceData.notes.split('\n');
        noteLines.forEach((line) => {
          pdf.text(line, 20, yPosition);
          yPosition += 8;
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

  const exportToImage = (format: 'png' | 'jpeg') => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Set canvas size for high quality
      canvas.width = 800;
      canvas.height = 1200;
      
      // Fill white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      let yPosition = 50;
      
      // Add logo if present
      if (invoiceData.businessLogo) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 50, yPosition, 60, 40);
          continueImageGeneration();
        };
        img.onerror = () => {
          console.log('Error loading logo for image export');
          continueImageGeneration();
        };
        img.src = invoiceData.businessLogo;
      } else {
        continueImageGeneration();
      }
      
      function continueImageGeneration() {
        // Business name
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(invoiceData.businessName, invoiceData.businessLogo ? 120 : 50, yPosition + 25);
        
        // Invoice title
        ctx.fillStyle = 'black';
        ctx.font = '18px Arial';
        ctx.fillText('INVOICE', 650, yPosition + 15);
        
        ctx.font = '14px Arial';
        ctx.fillText(`#${invoiceData.invoiceNumber}`, 650, yPosition + 35);
        
        // Status
        ctx.fillStyle = invoiceData.status === 'paid' ? '#22c55e' : '#ef4444';
        ctx.fillText(invoiceData.status === 'paid' ? '✅ Paid' : '❌ Unpaid', 650, yPosition + 55);
        
        yPosition += 100;
        
        // Bill To section
        ctx.fillStyle = 'black';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Bill To:', 50, yPosition);
        
        ctx.font = '12px Arial';
        ctx.fillText(invoiceData.clientName, 50, yPosition + 25);
        ctx.fillText(invoiceData.clientEmail, 50, yPosition + 45);
        
        const addressLines = invoiceData.clientAddress.split('\n');
        addressLines.forEach((line, index) => {
          ctx.fillText(line, 50, yPosition + 65 + (index * 20));
        });
        
        // Date information
        const dateY = yPosition;
        ctx.fillText(`Invoice Date: ${invoiceData.invoiceDate}`, 500, dateY);
        ctx.fillText(`Due Date: ${invoiceData.dueDate}`, 500, dateY + 20);
        ctx.fillText(`Currency: ${currencies.find(c => c.code === invoiceData.currency)?.name}`, 500, dateY + 40);
        
        // Line items table
        let tableY = yPosition + 120;
        
        // Table header with background and borders
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(50, tableY - 10, 700, 30);
        
        // Draw table borders
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 1;
        ctx.strokeRect(50, tableY - 10, 700, 30);
        
        ctx.fillStyle = 'black';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('Description', 60, tableY + 10);
        ctx.fillText('Qty', 450, tableY + 10);
        ctx.fillText('Rate', 550, tableY + 10);
        ctx.fillText('Amount', 650, tableY + 10);
        
        // Line items with borders
        ctx.font = '11px Arial';
        tableY += 40;
        
        invoiceData.lineItems.forEach((item, index) => {
          const y = tableY + (index * 25);
          
          // Draw row borders
          ctx.strokeStyle = '#d1d5db';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(50, y - 10, 700, 25);
          
          ctx.fillStyle = 'black';
          ctx.fillText(item.description || 'No description', 60, y);
          ctx.fillText(item.quantity.toString(), 465, y);
          ctx.fillText(formatCurrency(item.rate), 550, y);
          ctx.fillText(formatCurrency(item.amount), 650, y);
        });
        
        // Totals section
        const totalsY = tableY + (invoiceData.lineItems.length * 25) + 40;
        ctx.font = '12px Arial';
        
        let currentY = totalsY;
        ctx.fillText(`Subtotal: ${formatCurrency(calculateSubtotal())}`, 500, currentY);
        currentY += 20;
        
        if (invoiceData.taxRate > 0) {
          ctx.fillText(`Tax (${invoiceData.taxRate}%): ${formatCurrency(calculateTax())}`, 500, currentY);
          currentY += 20;
        }
        
        if (invoiceData.discountAmount > 0) {
          ctx.fillText(`Discount: -${formatCurrency(invoiceData.discountAmount)}`, 500, currentY);
          currentY += 20;
        }
        
        // Total
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`Total: ${formatCurrency(calculateTotal())}`, 500, currentY + 20);
        
        // Notes
        if (invoiceData.notes) {
          ctx.font = 'bold 12px Arial';
          ctx.fillText('Notes:', 50, currentY + 60);
          ctx.font = '11px Arial';
          
          const noteLines = invoiceData.notes.split('\n');
          noteLines.forEach((line, index) => {
            ctx.fillText(line, 50, currentY + 85 + (index * 20));
          });
        }
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${invoiceData.invoiceNumber}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            toast({
              title: "Image Generated",
              description: `Invoice has been downloaded as ${format.toUpperCase()}.`,
            });
          }
        }, `image/${format}`);
      }
      
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating the image. Please try again.",
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
      <PrintView
        invoiceData={invoiceData}
        formatCurrency={formatCurrency}
        calculateSubtotal={calculateSubtotal}
        calculateTax={calculateTax}
        calculateTotal={calculateTotal}
        exportToPDF={exportToPDF}
        exportToImage={exportToImage}
        setViewMode={setViewMode}
      />
    );
  }

  if (viewMode === 'list') {
    return (
      <InvoiceList
        savedInvoices={savedInvoices}
        formatCurrency={formatCurrency}
        toggleInvoiceStatus={toggleInvoiceStatus}
        loadInvoice={loadInvoice}
        deleteInvoice={deleteInvoice}
        setViewMode={setViewMode}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportToPDF}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToImage('png')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToImage('jpeg')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export as JPEG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Invoice Form */}
          <InvoiceForm
            invoiceData={invoiceData}
            setInvoiceData={setInvoiceData}
            addLineItem={addLineItem}
            removeLineItem={removeLineItem}
            updateLineItem={updateLineItem}
          />

          {/* Right Column - Invoice Preview */}
          <InvoicePreview
            invoiceData={invoiceData}
            formatCurrency={formatCurrency}
            calculateSubtotal={calculateSubtotal}
            calculateTax={calculateTax}
            calculateTotal={calculateTotal}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
