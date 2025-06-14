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
import AppLandingPage from "@/components/AppLandingPage";
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { formatCurrency, calculateSubtotal, calculateTax, calculateTotal } from "@/utils/invoiceUtils";
import { exportToPDF, exportToImage } from "@/utils/exportUtils";

const Index = () => {
  const { toast } = useToast();
  const [showLandingPage, setShowLandingPage] = useState(true);
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

    // Check if user has visited before
    const hasVisited = localStorage.getItem('invoicecraft-has-visited') === 'true';
    if (hasVisited) {
      setShowLandingPage(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('invoicecraft-dark-mode', isDarkMode.toString());
  }, [isDarkMode]);

  const handleGetStarted = () => {
    localStorage.setItem('invoicecraft-has-visited', 'true');
    setShowLandingPage(false);
  };

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

  // Show landing page first
  if (showLandingPage) {
    return <AppLandingPage onGetStarted={handleGetStarted} />;
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-blue-600 dark:text-blue-400">InvoiceCraft Pro</CardTitle>
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">InvoiceCraft Pro</h1>
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
            formatCurrency={getFormatCurrency}
            calculateSubtotal={getCalculateSubtotal}
            calculateTax={getCalculateTax}
            calculateTotal={getCalculateTotal}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
