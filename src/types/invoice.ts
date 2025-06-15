
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  businessName: string;
  businessEmail: string;
  businessAddress: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: LineItem[];
  currency: string;
  taxRate: number;
  discountAmount: number;
  status: 'paid' | 'unpaid';
  notes: string;
  businessLogo?: string;
  signatureImage?: string;
  signatureName?: string;
  signaturePosition?: string;
  paymentTerms?: string;
  bankDetails?: string;
  paymentInstructions?: string;
  lpoReference?: string; // Add LPO reference field
}

export interface CustomTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}
