
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { InvoiceData, currencies } from "@/types/invoice";

interface InvoicePreviewProps {
  invoiceData: InvoiceData;
  formatCurrency: (amount: number, currencyCode?: string) => string;
  calculateSubtotal: () => number;
  calculateTax: () => number;
  calculateTotal: () => number;
}

const InvoicePreview = ({
  invoiceData,
  formatCurrency,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
}: InvoicePreviewProps) => {
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
            <div className="border border-gray-400 dark:border-gray-600 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 grid grid-cols-12 gap-2 p-3 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-400 dark:border-gray-600">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-center">Rate</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>
              {invoiceData.lineItems.map((item, index) => (
                <div key={item.id} className={`grid grid-cols-12 gap-2 p-3 text-sm ${index < invoiceData.lineItems.length - 1 ? 'border-b border-gray-400 dark:border-gray-600' : ''}`}>
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

export default InvoicePreview;
