import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, Save, Eye, FileText, Printer, Moon, Sun, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

import InvoiceForm from "@/components/InvoiceForm";
import InvoicePreview from "@/components/InvoicePreview";
import PrintView from "@/components/PrintView";
import InvoiceList from "@/components/InvoiceList";
import DashboardStats from "@/components/DashboardStats";
import DashboardWelcome from "@/components/DashboardWelcome";
import AnalyticsDashboard from "@/components/AnalyticsDashboard"; // ADD THIS LINE
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { formatCurrency, calculateSubtotal, calculateTax, calculateTotal } from "@/utils/invoiceUtils";
import { exportToPDF, exportToImage } from "@/utils/exportUtils";
import { colorThemes } from "@/types/invoice";
import SignatureInput from "@/components/SignatureInput";
import { Link } from "react-router-dom"; // Add this import
import InvoiceActivityTimeline from "@/components/InvoiceActivityTimeline";
import { useInvoiceActivity } from "@/hooks/useInvoiceActivity";
import { useProfiles } from "@/hooks/useProfiles";
import ProfileSwitcher from "@/components/ProfileSwitcher";

const Index = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [viewMode, setViewMode] = useState<'create' | 'list' | 'print'>('create');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Custom uploaded template state must be here, BEFORE any returns:
  const [customTemplateContent, setCustomTemplateContent] = useState<string | null>(null);

  // NEW: Use profile management
  const { profiles, activeProfileId, activeProfile, setActiveProfile, createProfile, deleteProfile } = useProfiles();

  // Pass profileId to hooks to segregate their data
  const activity = useInvoiceActivity();
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
  } = useInvoiceData(activeProfileId);

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
    activity.addEvent("downloaded", `Invoice ${invoiceData.invoiceNumber} exported as PDF.`);
  };

  const handleExportToImage = (format: 'png' | 'jpeg') => {
    exportToImage(format, invoiceData, getFormatCurrency, getCalculateSubtotal, getCalculateTax, getCalculateTotal, toast);
    activity.addEvent("downloaded", `Invoice ${invoiceData.invoiceNumber} exported as ${format.toUpperCase()}.`);
  };

  const printInvoice = () => {
    setViewMode('print');
  };

  const handleSaveInvoice = () => {
    saveInvoice();
    activity.addEvent("edited", `Invoice ${invoiceData.invoiceNumber} was saved or updated.`);
  };

  const handleSaveInvoiceData = () => {
    saveInvoiceData();
    activity.addEvent("edited", `Draft for invoice ${invoiceData.invoiceNumber} was saved.`);
  };

  const handleCreateNewInvoice = () => {
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
    activity.addEvent("created", `Invoice draft started.`);
  };

  // Login handler: Use business name as unique identifier
  const handleLogin = () => {
    let name = invoiceData.businessName.trim();
    if (!name) return;
    let profile = profiles.find(p => p.name === name);
    if (!profile) {
      // Create new profile
      profile = createProfile({
        name,
        logo: "",
        email: "",
        address: "",
      });
    }
    if (profile) {
      setActiveProfile(profile.id);
      setIsLoggedIn(true);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t("appName")}
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mt-2">{t("loginSubtitle") || "Professional invoicing for freelancers"}</p>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="business-name" className="text-sm font-medium">{t("name")}</Label>
              <Input
                id="business-name"
                placeholder={t("name")}
                value={invoiceData.businessName}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, businessName: e.target.value }))}
                className="border-2 focus:border-blue-500 transition-colors"
              />
            </div>
            <Button 
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              {t("getStarted") || "Get Started"}
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
        userProfile={activeProfile}
        customTemplateContent={customTemplateContent || ""}
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

  // Add "corporate" and "custom" to the template options
  const templateOptions = [
    { value: "minimalist", label: "Reference (Default)" },
    { value: "corporate", label: "Corporate (New)" },
    { value: "classic", label: "Classic" },
    { value: "modern", label: "Modern" },
    { value: "bold", label: "Bold" },
    { value: "elegant", label: "Elegant" },
    { value: "horizontal", label: "Horizontal" },
    { value: "custom", label: "Custom (Upload)" }
  ];

  // Only light color options
  const colorThemeOptions = colorThemes.filter(opt =>
    !opt.type || opt.type === "gradient"
      ? !opt.color || (opt.color && /#(f|e)[a-f0-9]{5}/i.test(opt.color)) // only very light
      : true
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Calendar View button and Profile Switcher */}
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t("appName")}</h1>
              <p className="text-gray-600 dark:text-gray-300">{t("dashboardSubtitle") || "Create professional invoices"}</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <ProfileSwitcher />
            <Button onClick={toggleDarkMode} variant="outline" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-700">
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Link to="/calendar">
              <Button variant="outline" className="hover:bg-yellow-50 dark:hover:bg-yellow-900/30">
                {t("calendar")}
              </Button>
            </Link>
            <Link to="/expenses">
              <Button variant="outline" className="hover:bg-green-50 dark:hover:bg-green-900/30">
                {t("expenses")}
              </Button>
            </Link>
            <Button onClick={() => setViewMode('list')} variant="outline" className="hover:bg-blue-50 dark:hover:bg-blue-900/30">
              <Eye className="w-4 h-4 mr-2" />
              {t("viewSaved") || `View Saved (${savedInvoices.length})`}
            </Button>
            <Button onClick={handleSaveInvoiceData} variant="outline" className="hover:bg-yellow-50 dark:hover:bg-yellow-900/30">
              <Save className="w-4 h-4 mr-2" />
              {t("saveDraft")}
            </Button>
            <Button onClick={handleSaveInvoice} variant="outline" className="bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-800/50">
              <FileText className="w-4 h-4 mr-2" />
              {t("saveInvoice")}
            </Button>
            <Button onClick={printInvoice} variant="outline" className="hover:bg-purple-50 dark:hover:bg-purple-900/30">
              <Printer className="w-4 h-4 mr-2" />
              {t("printPreview")}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                  <Download className="w-4 h-4 mr-2" />
                  {t("export")}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportToPDF}>
                  <FileText className="w-4 h-4 mr-2" />
                  {t("exportAsPDF")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportToImage('png')}>
                  <Download className="w-4 h-4 mr-2" />
                  {t("exportAsPNG")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportToImage('jpeg')}>
                  <Download className="w-4 h-4 mr-2" />
                  {t("exportAsJPEG")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Welcome Section */}
        <DashboardWelcome 
          businessName={invoiceData.businessName} 
          onCreateNew={handleCreateNewInvoice}
        />

        {/* Stats Section */}
        <DashboardStats 
          savedInvoices={savedInvoices} 
          formatCurrency={getFormatCurrency}
        />

        {/* ---- ADD ANALYTICS DASHBOARD HERE ---- */}
        <AnalyticsDashboard
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
              onChange={e => setInvoiceData(prev => ({ ...prev, template: e.target.value as any }))}
            >
              {templateOptions.map(opt => (
                <option value={opt.value} key={opt.value}>{opt.label}</option>
              ))}
            </select>
            {/* Show upload button if selecting custom */}
            {invoiceData.template === "custom" && (
              <div className="mt-2 space-y-2">
                <input
                  type="file"
                  accept=".html,image/*"
                  className="block"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => {
                      setCustomTemplateContent(ev.target?.result as string);
                    };
                    // Support images and HTML files
                    if (/\.html?$/i.test(file.name)) {
                      reader.readAsText(file);
                    } else {
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">Upload a custom invoice template as an image (png, jpg) or HTML file.</p>
              </div>
            )}
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

          {/* Right Column - Invoice Preview and Activity */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border-0 overflow-hidden space-y-2">
            <InvoicePreview
              invoiceData={invoiceData}
              formatCurrency={getFormatCurrency}
              calculateSubtotal={getCalculateSubtotal}
              calculateTax={getCalculateTax}
              calculateTotal={getCalculateTotal}
              customTemplateContent={customTemplateContent || ""}
            />
            <InvoiceActivityTimeline events={activity.events} />
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
