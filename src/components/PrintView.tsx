
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileText, Printer, ChevronDown } from "lucide-react";
import LandingPage from "@/components/LandingPage";
import { InvoiceData, currencies } from "@/types/invoice";

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

export default PrintView;
