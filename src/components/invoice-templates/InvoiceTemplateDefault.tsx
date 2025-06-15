
import React from "react";
import { InvoiceData } from "@/types/invoice";

// LITE BLUE: Use landing page soft blue accents
const LITE_BLUE_BG = "bg-gradient-to-br from-blue-100 to-blue-200";
const LITE_BLUE_BORDER = "border-blue-200";
const LITE_BLUE_TXT = "text-blue-600";

function InvoiceTemplateDefault({
  invoiceData,
  formatCurrency,
  calculateSubtotal,
  calculateTax,
  calculateTotal
}: {
  invoiceData: InvoiceData;
  formatCurrency: (amount: number, currencyCode?: string) => string;
  calculateSubtotal: () => number;
  calculateTax: () => number;
  calculateTotal: () => number;
}) {
  return (
    <div className="font-inter text-gray-900 bg-white px-8 py-8 rounded-xl print:rounded-none print:shadow-none print:bg-white">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          {invoiceData.businessLogo && (
            <img src={invoiceData.businessLogo} alt="Logo" className="h-14 w-14 mb-2 object-contain rounded" />
          )}
          <div className="font-bold text-xl">{invoiceData.businessName || "Business Name"}</div>
          <div className="text-sm text-gray-500">{invoiceData.businessEmail}</div>
          <div className="text-sm text-gray-500">{invoiceData.businessAddress}</div>
        </div>
        <div className="text-right">
          <h1 className="font-bold text-2xl tracking-widest uppercase mb-2">INVOICE</h1>
          <div className={`rounded-md px-6 py-3 text-blue-700 font-bold ${LITE_BLUE_BG} flex flex-col gap-2 shadow`}>
            <div className="flex flex-row justify-between gap-10">
              <div>
                <div className="text-xs uppercase opacity-90">Date</div>
                <div className="text-sm">{invoiceData.invoiceDate}</div>
              </div>
              <div>
                <div className="text-xs uppercase opacity-90">Invoice No</div>
                <div className="text-sm">{invoiceData.invoiceNumber}</div>
              </div>
            </div>
            <div className="mt-2 flex flex-col items-end">
              <div className="uppercase text-xs opacity-80">Total Due</div>
              <span className="text-lg tracking-wide font-extrabold">{formatCurrency(calculateTotal(), invoiceData.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="flex justify-between mb-6">
        <div>
          <div className="font-semibold text-gray-600 text-sm">Billed To:</div>
          <div className="font-bold text-base">{invoiceData.clientName}</div>
          <div className="text-sm text-gray-500">{invoiceData.clientAddress}</div>
          <div className="text-sm text-gray-500">{invoiceData.clientEmail}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600 font-semibold">Due Date</div>
          <div className="font-semibold">{invoiceData.dueDate}</div>
        </div>
      </div>

      {/* Items Table */}
      <div className={`rounded-lg overflow-hidden border ${LITE_BLUE_BORDER} mb-8`}>
        {/* Table header */}
        <div className={`${LITE_BLUE_BG} ${LITE_BLUE_TXT} font-bold flex`}>
          <div className="w-12 text-center py-3"></div>
          <div className="flex-1 py-3 px-2">Description</div>
          <div className="w-24 py-3 text-center">Price</div>
          <div className="w-20 py-3 text-center">Quantity</div>
          <div className="w-28 py-3 px-2 text-right">Total</div>
        </div>
        {/* Line items */}
        {invoiceData.lineItems.map((item, idx) => (
          <div
            key={item.id}
            className="flex border-b last:border-b-0 border-blue-50 hover:bg-blue-50/60 transition"
          >
            <div className={`${LITE_BLUE_TXT} w-12 p-3 flex items-center justify-center font-semibold`}>{idx + 1}</div>
            <div className="flex-1 p-3">
              <div className="font-medium">{item.description}</div>
            </div>
            <div className="w-24 p-3 text-center">{formatCurrency(item.rate, invoiceData.currency)}</div>
            <div className="w-20 p-3 text-center">{item.quantity}</div>
            <div className="w-28 p-3 text-right font-semibold">{formatCurrency(item.amount, invoiceData.currency)}</div>
          </div>
        ))}
      </div>

      {/* Totals summary */}
      <div className="flex flex-col items-end gap-1 mb-8">
        <div className="flex gap-10">
          <div className="flex flex-col gap-1 min-w-[180px]">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="font-semibold">{formatCurrency(calculateSubtotal(), invoiceData.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tax & VAT:</span>
              <span className="font-semibold">{formatCurrency(calculateTax(), invoiceData.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Discount:</span>
              <span className="font-semibold">-{formatCurrency(invoiceData.discountAmount, invoiceData.currency)}</span>
            </div>
            <div className="h-2"></div>
            <div className={`flex justify-between font-extrabold text-lg ${LITE_BLUE_TXT}`}>
              <span>TOTAL</span>
              <span>{formatCurrency(calculateTotal(), invoiceData.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods & Signature */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className={`${LITE_BLUE_BG} ${LITE_BLUE_TXT} text-xs font-bold px-4 py-2 rounded-t`}>
            PAYMENT METHOD
          </div>
          <div className={`border-x border-b ${LITE_BLUE_BORDER} rounded-b px-4 py-3`}>
            <div className="text-sm">PayPal: your@email.com</div>
            {invoiceData.accountNumber && (
              <div className="text-sm">Account Number: {invoiceData.accountNumber}</div>
            )}
            {invoiceData.bankDetails && (
              <div className="text-sm whitespace-pre-line">{invoiceData.bankDetails}</div>
            )}
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-between items-end pr-4">
          <div className="text-sm mb-2 font-medium">Thank you for your business!</div>
          {invoiceData.signatureImage && (
            <img src={invoiceData.signatureImage} alt="Signature" className="h-10 mb-1 object-contain" />
          )}
          {invoiceData.signatureName && (
            <div className="font-semibold">{invoiceData.signatureName}</div>
          )}
          {invoiceData.signaturePosition && (
            <div className="text-xs text-gray-500">{invoiceData.signaturePosition}</div>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="flex items-center w-full justify-between gap-2 border-t pt-4 text-xs text-gray-500">
        <div>
          <b>Terms:</b> {invoiceData.notes || "Payment due within 7 days unless otherwise stated."}
        </div>
        <div>
          <b>Address:</b> {invoiceData.businessAddress}
        </div>
      </div>
    </div>
  );
}

export default InvoiceTemplateDefault;

