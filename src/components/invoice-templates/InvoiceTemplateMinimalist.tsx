
import React from "react";
import { InvoiceData } from "@/types/invoice";

interface InvoiceTemplateMinimalistProps {
  invoiceData: InvoiceData;
  formatCurrency: (amount: number, currencyCode?: string) => string;
  calculateSubtotal: () => number;
  calculateTax: () => number;
  calculateTotal: () => number;
}

const InvoiceTemplateMinimalist: React.FC<InvoiceTemplateMinimalistProps> = ({
  invoiceData,
  formatCurrency,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
}) => {
  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = calculateTotal();

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-gray-800">
      {/* Header with Logo */}
      <div className="flex justify-between items-start mb-8">
        <div>
          {invoiceData.businessLogo && (
            <img 
              src={invoiceData.businessLogo} 
              alt="Business Logo" 
              className="h-16 mb-4"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">#{invoiceData.invoiceNumber}</p>
          <p className="text-gray-600">Date: {new Date(invoiceData.invoiceDate).toLocaleDateString()}</p>
          <p className="text-gray-600">Due: {new Date(invoiceData.dueDate).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Business and Client Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">From:</h3>
          <div className="text-gray-700">
            <p className="font-medium">{invoiceData.businessName}</p>
            <p>{invoiceData.businessEmail}</p>
            <div className="whitespace-pre-line">{invoiceData.businessAddress}</div>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">To:</h3>
          <div className="text-gray-700">
            <p className="font-medium">{invoiceData.clientName}</p>
            <p>{invoiceData.clientEmail}</p>
            <div className="whitespace-pre-line">{invoiceData.clientAddress}</div>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-2 font-semibold">Description</th>
              <th className="text-right py-3 px-2 font-semibold">Qty</th>
              <th className="text-right py-3 px-2 font-semibold">Rate</th>
              <th className="text-right py-3 px-2 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.lineItems.map((item, index) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3 px-2">{item.description}</td>
                <td className="text-right py-3 px-2">{item.quantity}</td>
                <td className="text-right py-3 px-2">{formatCurrency(item.rate, invoiceData.currency)}</td>
                <td className="text-right py-3 px-2">{formatCurrency(item.amount, invoiceData.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal, invoiceData.currency)}</span>
          </div>
          {invoiceData.taxRate > 0 && (
            <div className="flex justify-between py-2">
              <span>Tax ({invoiceData.taxRate}%):</span>
              <span>{formatCurrency(tax, invoiceData.currency)}</span>
            </div>
          )}
          {invoiceData.discountAmount > 0 && (
            <div className="flex justify-between py-2">
              <span>Discount:</span>
              <span>-{formatCurrency(invoiceData.discountAmount, invoiceData.currency)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 border-t-2 border-gray-200 font-bold text-lg">
            <span>Total:</span>
            <span>{formatCurrency(total, invoiceData.currency)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoiceData.notes && (
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-2">Notes:</h3>
          <div className="text-gray-700 whitespace-pre-line">{invoiceData.notes}</div>
        </div>
      )}

      {/* Signature */}
      {invoiceData.signatureImage && (
        <div className="flex justify-end mt-12">
          <div className="text-center">
            <img 
              src={invoiceData.signatureImage} 
              alt="Signature" 
              className="h-16 mb-2"
            />
            <div className="border-t border-gray-400 pt-1 text-sm text-gray-600">
              Authorized Signature
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceTemplateMinimalist;
