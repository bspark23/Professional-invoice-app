import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileText, Printer, ChevronDown } from "lucide-react";
import { InvoiceData, currencies, colorThemes } from "@/types/invoice";

interface PrintViewProps {
  invoiceData: InvoiceData;
  formatCurrency: (amount: number, currencyCode?: string) => string;
  calculateSubtotal: () => number;
  calculateTax: () => number;
  calculateTotal: () => number;
  exportToPDF: () => void;
  exportToImage: (format: 'png' | 'jpeg') => void;
  setViewMode: React.Dispatch<React.SetStateAction<'create' | 'list' | 'print'>>;
}

const COLOR_CLASSES = {
  blue: {
    header: "text-blue-700",
    badge: "bg-blue-100 text-blue-800",
    accentBg: "bg-blue-50",
    border: "border-blue-300",
  },
  green: {
    header: "text-green-700",
    badge: "bg-green-100 text-green-800",
    accentBg: "bg-green-50",
    border: "border-green-300",
  },
  gray: {
    header: "text-gray-800",
    badge: "bg-gray-200 text-gray-700",
    accentBg: "bg-gray-50",
    border: "border-gray-400",
  }
};

const COLOR_CLASSES_EXTENDED = {
  ...COLOR_CLASSES,
  purple: {
    header: "text-purple-700",
    badge: "bg-purple-100 text-purple-800",
    accentBg: "bg-purple-50",
    border: "border-purple-300",
  },
  red: {
    header: "text-red-700",
    badge: "bg-red-100 text-red-800",
    accentBg: "bg-red-50",
    border: "border-red-300"
  },
  orange: {
    header: "text-orange-700",
    badge: "bg-orange-100 text-orange-800",
    accentBg: "bg-orange-50",
    border: "border-orange-300"
  },
  teal: {
    header: "text-teal-700",
    badge: "bg-teal-100 text-teal-800",
    accentBg: "bg-teal-50",
    border: "border-teal-300"
  },
  "gradient-blue": {
    header: "text-blue-700",
    badge: "bg-blue-100 text-blue-800",
    accentBg: "",
    border: "border-blue-300"
  },
  "gradient-purple": {
    header: "text-purple-700",
    badge: "bg-purple-100 text-purple-900",
    accentBg: "",
    border: "border-purple-300"
  }
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
}: PrintViewProps) => {
  const colorTheme = invoiceData.colorTheme || "blue";
  const color = COLOR_CLASSES_EXTENDED[colorTheme as keyof typeof COLOR_CLASSES_EXTENDED] || COLOR_CLASSES.blue;
  const themeObj = colorThemes.find(ct => ct.value === colorTheme);

  return (
    <div className={`min-h-screen bg-white print:bg-white`} style={themeObj?.type === "gradient" ? { background: themeObj.gradient } : themeObj?.color ? { background: themeObj.color } : {}}>
      <div className="max-w-4xl mx-auto p-8 print:p-0">
        {/* PRINT CONTROLS */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <h1 className={`text-2xl font-bold ${color.header}`}>Print Preview</h1>
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

        {/* DISTINCT INVOICE HEADER */}
        <div className={`flex flex-col md:flex-row md:justify-between md:items-center mb-10 print:mb-8`}>
          <div className="flex items-center gap-4 mb-6 md:mb-0">
            {invoiceData.businessLogo && (
              <img 
                src={invoiceData.businessLogo}
                alt="Company Logo"
                className="w-20 h-20 object-contain border rounded-lg bg-gray-100"
              />
            )}
            <div>
              <h2 className={`text-3xl font-bold ${color.header}`}>{invoiceData.businessName}</h2>
              {invoiceData.businessName && (
                <div className="text-sm text-gray-600 mt-1">{invoiceData.businessEmail}</div>
              )}
              <div className="text-sm text-gray-500">{invoiceData.businessAddress}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`mb-2`}>
              <span className={`inline-block px-3 py-1 ${color.badge} text-xs font-semibold rounded uppercase tracking-wide`}>
                Invoice
              </span>
            </div>
            <div className="text-xl font-semibold text-gray-800 mb-1">
              #{invoiceData.invoiceNumber}
            </div>
            <Badge variant={invoiceData.status === 'paid' ? 'default' : 'destructive'} className={`print:bg-white print:text-black print:border print:border-gray-400 ${color.badge}`}>
              {invoiceData.status === 'paid' ? '✅ Paid' : invoiceData.status === "unpaid" ? '❌ Unpaid' : invoiceData.status}
            </Badge>
          </div>
        </div>

        <Separator className={`mb-8 print:border-gray-300 ${color.border}`} />

        {/* CLIENT AND DATE/AMOUNT INFO */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 text-gray-700`}>
          <div>
            <h4 className="font-semibold mb-2">Bill To:</h4>
            <div>
              <div className="font-medium">{invoiceData.clientName}</div>
              <div>{invoiceData.clientEmail}</div>
              <div className="whitespace-pre-line">{invoiceData.clientAddress}</div>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div>
              <span className="font-medium">Invoice Date: </span>
              {invoiceData.invoiceDate}
            </div>
            <div>
              <span className="font-medium">Due Date: </span>
              {invoiceData.dueDate}
            </div>
            <div>
              <span className="font-medium">Currency: </span>
              {currencies.find(c => c.code === invoiceData.currency)?.name || 'USD'}
            </div>
          </div>
        </div>

        {/* INVOICE LINE ITEMS */}
        <div className="mb-8">
          <div className={`border rounded-lg overflow-hidden print:border-gray-400 ${color.border}`}>
            <div className={`bg-gray-50 grid grid-cols-12 gap-2 p-4 text-sm font-medium text-gray-700 border-b ${color.border}`}>
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-center">Rate</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            {invoiceData.lineItems.map((item, index) => (
              <div key={item.id} className={`grid grid-cols-12 gap-2 p-4 text-sm ${index < invoiceData.lineItems.length - 1 ? 'border-b border-gray-200' : ''}`}>
                <div className="col-span-6">{item.description}</div>
                <div className="col-span-2 text-center">{item.quantity}</div>
                <div className="col-span-2 text-center">{formatCurrency(item.rate)}</div>
                <div className="col-span-2 text-right">{formatCurrency(item.amount)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TOTALS AND NOTES */}
        <div className="space-y-3 mb-8 text-gray-900">
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

        {invoiceData.notes && (
          <div className="mt-6">
            <h4 className="font-semibold mb-1">Notes:</h4>
            <p className="text-gray-600 whitespace-pre-line text-sm">{invoiceData.notes}</p>
          </div>
        )}

        {/* Signature area at the end of the invoice */}
        <div className="mt-16 flex flex-col items-end print:items-end">
          <span className="text-gray-500 text-xs mb-2">Signature:</span>
          {invoiceData.signatureImage ? (
            <img src={invoiceData.signatureImage} alt="Signature" className="w-48 h-16 object-contain border rounded bg-white" />
          ) : (
            <div className="w-48 h-16 border-b-2 border-gray-400 mb-2"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintView;
