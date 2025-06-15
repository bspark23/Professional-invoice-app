import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, Save, Eye, FileText, Printer, Moon, Sun, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import InvoiceForm from "@/components/InvoiceForm";
import InvoicePreview from "@/components/InvoicePreview";
import PrintView from "@/components/PrintView";
import InvoiceList from "@/components/InvoiceList";
import DashboardStats from "@/components/DashboardStats";
import DashboardWelcome from "@/components/DashboardWelcome";
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { formatCurrency, calculateSubtotal, calculateTax, calculateTotal } from "@/utils/invoiceUtils";
import { exportToPDF, exportToImage } from "@/utils/exportUtils";
import { colorThemes } from "@/types/invoice";
import SignatureInput from "@/components/SignatureInput";

const Index = () => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [viewMode, setViewMode] = useState<'create' | 'list' | 'print'>('create');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const {
    invoiceData,
    setInvoiceData,
    savedInvoices,
    saveInvoiceData,
    saveInvoice,
    loadInvoice,
    deleteInvoice,
    toggleInvoiceStatus,
    addLineItem,
    removeLineItem,
    updateLineItem,
    generateInvoiceNumber
  } = useInvoiceData();

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  useEffect(() => {
    // Initialize dark mode from localStorage
    const savedDarkMode = localStorage.getItem('invoicecraft-dark-mode') === 'true';
    setIsDarkMode(savedDarkMode);
    document.documentElement.classList.toggle('dark', savedDarkMode);
  }, []);

  useEffect(() => {
    localStorage.setItem('invoicecraft-dark-mode', isDarkMode.toString());
  }, [isDarkMode]);

  // Helper functions that use the invoiceData
  const getCalculateSubtotal = () => calculateSubtotal(invoiceData);
  const getCalculateTax = () => calculateTax(invoiceData);
  const getCalculateTotal = () => calculateTotal(invoiceData);
  const getFormatCurrency = (amount: number, currencyCode?: string) => 
    formatCurrency(amount, currencyCode || invoiceData.currency);

  const handleExportToPDF = () => {
    exportToPDF(invoiceData, getFormatCurrency, getCalculateSubtotal, getCalculateTax, getCalculateTotal, toast);
  };

  const handleExportToImage = (format: 'png' | 'jpeg') => {
    exportToImage(format, invoiceData, getFormatCurrency, getCalculateSubtotal, getCalculateTax, getCalculateTotal, toast);
  };

  const printInvoice = () => {
    setViewMode('print');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">InvoiceCraft Pro</CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Professional invoicing for freelancers</p>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="business-name" className="text-sm font-medium">Business Name</Label>
              <Input
                id="business-name"
                placeholder="Enter your business name"
                value={invoiceData.businessName}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, businessName: e.target.value }))}
                className="border-2 focus:border-blue-500 transition-colors"
              />
            </div>
            <Button 
              onClick={() => setIsLoggedIn(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
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
        formatCurrency={getFormatCurrency}
        calculateSubtotal={getCalculateSubtotal}
        calculateTax={getCalculateTax}
        calculateTotal={getCalculateTotal}
        exportToPDF={handleExportToPDF}
        exportToImage={handleExportToImage}
        setViewMode={setViewMode}
      />
    );
  }

  if (viewMode === 'list') {
    return (
      <InvoiceList
        savedInvoices={savedInvoices}
        formatCurrency={getFormatCurrency}
        toggleInvoiceStatus={toggleInvoiceStatus}
        loadInvoice={(invoice) => {
          loadInvoice(invoice);
          setViewMode('create');
        }}
        deleteInvoice={deleteInvoice}
        setViewMode={setViewMode}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
    );
  }

  // Template and color change handlers
  const templateOptions = [
    { value: "minimalist", label: "Minimalist" },
    { value: "bordered", label: "Bordered" },
    { value: "modern", label: "Modern" }
  ];

  const colorThemeOptions = colorThemes;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Calendar View button */}
        <div className="flex items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-0">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg flex items-center justify-center overflow-hidden">
              <img
                src="/lovable-uploads/7ee69eb6-9c39-4842-a5be-8ca62c793130.png"
                alt="App Logo"
                className="w-10 h-10 object-contain"
                style={{ background: "transparent" }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">InvoiceCraft Pro</h1>
              <p className="text-gray-600 dark:text-gray-300">Create professional invoices</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={toggleDarkMode} variant="outline" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-700">
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <a href="/calendar">
              <Button variant="outline" className="hover:bg-yellow-50 dark:hover:bg-yellow-900/30">
                Calendar View
              </Button>
            </a>
            <a href="/expenses">
              <Button variant="outline" className="hover:bg-green-50 dark:hover:bg-green-900/30">
                Track Expenses
              </Button>
            </a>
            <Button onClick={() => setViewMode('list')} variant="outline" className="hover:bg-blue-50 dark:hover:bg-blue-900/30">
              <Eye className="w-4 h-4 mr-2" />
              View Saved ({savedInvoices.length})
            </Button>
            <Button onClick={saveInvoiceData} variant="outline" className="hover:bg-yellow-50 dark:hover:bg-yellow-900/30">
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={saveInvoice} variant="outline" className="bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-800/50">
              <FileText className="w-4 h-4 mr-2" />
              Save Invoice
            </Button>
            <Button onClick={printInvoice} variant="outline" className="hover:bg-purple-50 dark:hover:bg-purple-900/30">
              <Printer className="w-4 h-4 mr-2" />
              Print Preview
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportToPDF}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportToImage('png')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportToImage('jpeg')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export as JPEG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Welcome Section */}
        <DashboardWelcome 
          businessName={invoiceData.businessName} 
          onCreateNew={() => {
            const newLineItem = {
              id: Date.now().toString(),
              description: '',
              quantity: 1,
              rate: 0,
              amount: 0
            };
            setInvoiceData(prev => ({
              ...prev,
              invoiceNumber: generateInvoiceNumber(),
              lineItems: [newLineItem]
            }));
          }}
        />

        {/* Stats Section */}
        <DashboardStats 
          savedInvoices={savedInvoices} 
          formatCurrency={getFormatCurrency}
        />

        {/* Template/Theme Customization */}
        <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-gray-800 rounded-xl p-4 shadow border mb-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Invoice Layout</label>
            <select
              className="rounded border px-4 py-2 bg-gray-50 dark:bg-gray-700 focus:outline-none"
              value={invoiceData.template || "minimalist"}
              onChange={e => setInvoiceData(prev => ({ ...prev, template: e.target.value as 'minimalist' | 'bordered' | 'modern' }))}
            >
              {templateOptions.map(opt => (
                <option value={opt.value} key={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Color Theme</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {colorThemeOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition
                    ${invoiceData.colorTheme === opt.value ? "ring-2 ring-offset-2 ring-black dark:ring-white scale-110" : "opacity-80"}
                  `}
                  aria-label={opt.name}
                  style={{
                    background: opt.type === 'gradient' ? opt.gradient : opt.color
                  }}
                  onClick={() => setInvoiceData(prev => ({ ...prev, colorTheme: opt.value as any }))}
                >
                  {invoiceData.colorTheme === opt.value && (
                    <span className="text-white font-bold text-lg">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Invoice Form */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border-0 overflow-hidden">
            <InvoiceForm
              invoiceData={invoiceData}
              setInvoiceData={setInvoiceData}
              addLineItem={addLineItem}
              removeLineItem={removeLineItem}
              updateLineItem={updateLineItem}
            />
          </div>

          {/* Right Column - Invoice Preview */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border-0 overflow-hidden">
            <InvoicePreview
              invoiceData={invoiceData}
              formatCurrency={getFormatCurrency}
              calculateSubtotal={getCalculateSubtotal}
              calculateTax={getCalculateTax}
              calculateTotal={getCalculateTotal}
            />
          </div>
        </div>

        {/* Signature section config */}
        <div className="bg-white dark:bg-gray-800 p-4 mt-6 rounded-xl shadow border">
          <SignatureInput
            value={invoiceData.signatureImage}
            onChange={sig => setInvoiceData(prev => ({ ...prev, signatureImage: sig }))}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
