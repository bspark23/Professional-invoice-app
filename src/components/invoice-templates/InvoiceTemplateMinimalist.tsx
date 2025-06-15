
import React from "react";
import { InvoiceData } from "@/types/invoice";

interface InvoiceTemplateMinimalistProps {
  invoiceData: InvoiceData;
  formatCurrency: (amount: number, currencyCode?: string) => string;
  calculateSubtotal: () => number;
  calculateTax: () => number;
  calculateTotal: () => number;
}

const InvoiceTemplateMinimalistProps: React.FC<InvoiceTemplateMinimalistProps> = ({
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
    <div className="max-w-4xl mx-auto bg-white text-gray-800 shadow-lg">
      {/* Red Header Section */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-8">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            {invoiceData.businessLogo && (
              <div className="bg-white p-2 rounded-full">
                <img 
                  src={invoiceData.businessLogo} 
                  alt="Business Logo" 
                  className="h-12 w-12 object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{invoiceData.businessName || "YOUR BUSINESS NAME"}</h1>
              <p className="text-red-100">{invoiceData.businessSlogan || "Your Business Slogan"}</p>
            </div>
          </div>
          <div className="bg-red-600 px-6 py-3 rounded-l-lg">
            <h2 className="text-2xl font-bold">INVOICE</h2>
          </div>
        </div>
      </div>

      {/* Business and Client Info Section */}
      <div className="p-8">
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3">FROM:</h3>
            <div className="text-gray-800">
              <p className="font-semibold text-lg mb-1">{invoiceData.businessName}</p>
              <p className="text-sm whitespace-pre-line">{invoiceData.businessAddress}</p>
              <p className="text-sm">{invoiceData.businessEmail}</p>
              {invoiceData.businessPhone && (
                <p className="text-sm">{invoiceData.businessPhone}</p>
              )}
              {invoiceData.businessWebsite && (
                <p className="text-sm">{invoiceData.businessWebsite}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="bg-orange-500 text-white px-4 py-2 rounded mb-4 inline-block">
              <span className="text-sm">BILL TO</span>
            </div>
            <div className="text-gray-800">
              <p className="font-semibold text-lg mb-1">{invoiceData.clientName}</p>
              <p className="text-sm">{invoiceData.clientEmail}</p>
              <p className="text-sm whitespace-pre-line">{invoiceData.clientAddress}</p>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
          <div>
            <p><span className="font-semibold">Invoice Date:</span> {new Date(invoiceData.invoiceDate).toLocaleDateString()}</p>
            <p><span className="font-semibold">Due Date:</span> {new Date(invoiceData.dueDate).toLocaleDateString()}</p>
            {invoiceData.paymentTerms && (
              <p><span className="font-semibold">Payment Terms:</span> {invoiceData.paymentTerms}</p>
            )}
          </div>
          <div className="text-right">
            <p><span className="font-semibold">Invoice No:</span> {invoiceData.invoiceNumber}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-red-500 text-white">
                <th className="border border-gray-300 py-3 px-4 text-left font-semibold">QT</th>
                <th className="border border-gray-300 py-3 px-4 text-left font-semibold">Description</th>
                <th className="border border-gray-300 py-3 px-4 text-center font-semibold">Price</th>
                <th className="border border-gray-300 py-3 px-4 text-center font-semibold">Qty</th>
                <th className="border border-gray-300 py-3 px-4 text-center font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.lineItems.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="border border-gray-300 py-3 px-4 text-center font-medium">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td className="border border-gray-300 py-3 px-4">{item.description}</td>
                  <td className="border border-gray-300 py-3 px-4 text-center">
                    {formatCurrency(item.rate, invoiceData.currency)}
                  </td>
                  <td className="border border-gray-300 py-3 px-4 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 py-3 px-4 text-center font-semibold text-red-600">
                    {formatCurrency(item.amount, invoiceData.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            {/* Payment Info */}
            <div className="bg-gray-800 text-white p-6 rounded">
              <h3 className="font-semibold mb-4">Payment Info:</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-300">Account No:</span> {invoiceData.accountNumber || "0000 000 000"}</p>
                <p><span className="text-gray-300">A/C Name:</span> {invoiceData.businessName}</p>
                <div className="text-gray-300">
                  <span>Bank Details:</span>
                  <div className="mt-1 whitespace-pre-line">
                    {invoiceData.bankDetails || "Add your bank details"}
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <p className="font-semibold mb-2">Thank you for your business!</p>
                <p className="text-xs text-gray-300">
                  {invoiceData.paymentTerms || "Payment terms and conditions"}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="font-semibold">Sub Total:</span>
                <span className="font-semibold">{formatCurrency(subtotal, invoiceData.currency)}</span>
              </div>
              {invoiceData.taxRate > 0 && (
                <div className="flex justify-between py-2">
                  <span className="font-semibold">Tax ({invoiceData.taxRate}%):</span>
                  <span className="font-semibold">{formatCurrency(tax, invoiceData.currency)}</span>
                </div>
              )}
              {invoiceData.discountAmount > 0 && (
                <div className="flex justify-between py-2">
                  <span className="font-semibold">Discount:</span>
                  <span className="font-semibold">-{formatCurrency(invoiceData.discountAmount, invoiceData.currency)}</span>
                </div>
              )}
              <div className="bg-red-500 text-white px-4 py-3 rounded flex justify-between items-center">
                <span className="font-bold">Total Due</span>
                <span className="text-xl font-bold">{formatCurrency(total, invoiceData.currency)}</span>
              </div>
            </div>

            {/* Large Total Display */}
            <div className="mt-4 bg-gray-800 text-white p-6 rounded text-center">
              <div className="bg-red-500 px-4 py-2 rounded mb-2 inline-block">
                <span className="font-bold">Total Due</span>
              </div>
              <div className="text-3xl font-bold">
                {formatCurrency(total, invoiceData.currency)}
              </div>
              <div className="text-sm text-gray-300 mt-2">
                <p>Invoice No: {invoiceData.invoiceNumber}</p>
                <p>Invoice Date: {new Date(invoiceData.invoiceDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div className="flex justify-end mb-8">
          <div className="text-center">
            {invoiceData.signatureImage && (
              <img 
                src={invoiceData.signatureImage} 
                alt="Signature" 
                className="h-16 mb-2 mx-auto"
              />
            )}
            <div className="border-t border-gray-400 pt-2 text-sm text-gray-600 w-48">
              <p className="font-semibold">{invoiceData.signatureName || "AUTHORIZED SIGNATURE"}</p>
              <p className="text-xs">{invoiceData.signaturePosition || "Position"}</p>
              {invoiceData.signatureNote && (
                <p className="text-xs mt-1">{invoiceData.signatureNote}</p>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoiceData.notes && (
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold text-gray-900 mb-2">Notes:</h3>
            <div className="text-gray-700 text-sm whitespace-pre-line">{invoiceData.notes}</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white p-6">
        <div className="grid grid-cols-3 gap-8 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs">📞</span>
            </div>
            <span>{invoiceData.businessPhone || "000 1234 6789"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs">✉</span>
            </div>
            <span>{invoiceData.businessEmail || "yourbusiness@email.com"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs">📍</span>
            </div>
            <span>{invoiceData.businessAddress || "123 St, Street Address Country State, Zip Code - 1234"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplateMinimalistProps;
