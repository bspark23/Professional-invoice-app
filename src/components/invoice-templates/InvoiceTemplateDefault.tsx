import React from "react";
import { InvoiceData } from "@/types/invoice";

interface InvoiceTemplateProps {
  invoiceData: InvoiceData;
  formatCurrency: (amount: number, currencyCode?: string) => string;
  calculateSubtotal: () => number;
  calculateTax: () => number;
  calculateTotal: () => number;
}
const InvoiceTemplateDefault: React.FC<InvoiceTemplateProps> = ({
  invoiceData,
  formatCurrency,
  calculateSubtotal,
  calculateTax,
  calculateTotal
}) => {
  return (
    <div className="bg-white shadow-xl rounded-xl border max-w-2xl mx-auto text-gray-800" style={{ fontFamily: "Segoe UI, Arial, sans-serif", minWidth: "340px" }}>
      {/* Top colored bar */}
      <div className="h-7 w-full rounded-t-xl" style={{ background: "#142c2e" }}></div>
      <div className="px-8 py-6">
        <div className="flex justify-between items-center mb-3">
          <div>
            {/* Logo */}
            {invoiceData.businessLogo ? (
              <img src={invoiceData.businessLogo} alt="Logo" className="w-14 h-14 object-contain mb-2" />
            ) : (
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-200 mb-2 text-xs">Logo</div>
            )}
            <div className="text-xs text-gray-500 font-semibold">{invoiceData.businessName}</div>
            <div className="text-xs text-gray-400">{invoiceData.businessAddress}</div>
            <div className="text-xs text-gray-400">{invoiceData.businessEmail}</div>
          </div>
          <div className="text-right">
            <div className="uppercase tracking-widest font-bold text-lg mb-1 mt-2">Invoice</div>
            <div className="text-xs text-gray-600">Number: <span className="font-semibold">{invoiceData.invoiceNumber}</span></div>
            <div className="text-xs text-gray-600">Issue Date: <span className="font-semibold">{invoiceData.invoiceDate}</span></div>
            <div className="text-xs text-gray-600">Due Date: <span className="font-semibold">{invoiceData.dueDate}</span></div>
            <div className="text-xs font-bold text-gray-600 mt-1">Total Due: {formatCurrency(calculateTotal())}</div>
          </div>
        </div>

        <div className="mt-2 mb-4 grid grid-cols-2 gap-4">
          <div>
            <div className="font-bold text-xs text-gray-900 mb-1">BILL FROM:</div>
            <div className="text-xs font-semibold">{invoiceData.businessName}</div>
            <div className="text-xs">{invoiceData.businessAddress}</div>
            <div className="text-xs">{invoiceData.businessEmail}</div>
          </div>
          <div>
            <div className="font-bold text-xs text-gray-900 mb-1">BILL TO:</div>
            <div className="text-xs font-semibold">{invoiceData.clientName}</div>
            <div className="text-xs">{invoiceData.clientAddress}</div>
            <div className="text-xs">{invoiceData.clientEmail}</div>
          </div>
        </div>

        {/* Line items table */}
        <div className="border-2 rounded-lg border-gray-200">
          <div className="grid grid-cols-4 text-xs font-bold bg-gray-100 text-gray-700 border-b border-gray-200 py-2 px-2">
            <div className="col-span-2 pl-2">DESCRIPTION</div>
            <div className="text-center">QTY</div>
            <div className="text-right pr-2">PRICE</div>
          </div>
          {invoiceData.lineItems.map((item) => (
            <div key={item.id} className="grid grid-cols-4 text-xs border-b border-gray-200 last:border-none">
              <div className="col-span-2 pl-2 py-2">{item.description}</div>
              <div className="text-center py-2">{item.quantity}</div>
              <div className="text-right pr-2 py-2">{formatCurrency(item.amount)}</div>
            </div>
          ))}
        </div>

        {/* Terms and totals */}
        <div className="flex flex-col md:flex-row mt-4 gap-4">
          {/* Terms */}
          <div className="flex-1 text-xs text-gray-600">
            <div className="font-semibold text-gray-900 mb-1">TERMS & CONDITIONS:</div>
            {/* Use only user's notes/terms */}
            {invoiceData.notes
              ? <div className="whitespace-pre-line">{invoiceData.notes}</div>
              : <span className="italic text-gray-400">No terms or notes provided.</span>
            }
          </div>
          {/* Totals */}
          <div className="flex-1 max-w-xs ml-auto space-y-1">
            <div className="flex justify-between text-xs">
              <span>SUBTOTAL</span>
              <span>{formatCurrency(calculateSubtotal())}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>TAX ({invoiceData.taxRate}%)</span>
              <span>{formatCurrency(calculateTax())}</span>
            </div>
            {invoiceData.discountAmount > 0 && (
              <div className="flex justify-between text-xs">
                <span>DISCOUNT</span>
                <span>-{formatCurrency(invoiceData.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base mt-2">
              <span>AMOUNT DUE</span>
              <span className="bg-green-200 px-2 rounded">{formatCurrency(calculateTotal())}</span>
            </div>
          </div>
        </div>

        {/* Signature row */}
        <div className="flex flex-col md:flex-row items-end justify-between mt-8 pt-3 border-t border-gray-200">
          <div>
            <div className="text-xs mb-2">Bank details:</div>
            <div className="text-xs text-gray-500">Bank: Example Bank</div>
            <div className="text-xs text-gray-500">Account: 123456789</div>
            <div className="text-xs text-gray-500">Routing: 987654321</div>
          </div>
          <div className="flex flex-col items-end mt-4 md:mt-0">
            {invoiceData.signatureImage && (
              <img
                src={invoiceData.signatureImage}
                alt="Signature"
                className="w-48 h-16 object-contain border rounded bg-white mb-1"
              />
            )}
            <div className="text-sm font-signature">Jane Smith</div>
            <div className="text-xs text-gray-700 font-semibold mt-[-2px]">Founder & CEO</div>
            <div className="text-xs text-gray-500">For {invoiceData.businessName}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplateDefault;
