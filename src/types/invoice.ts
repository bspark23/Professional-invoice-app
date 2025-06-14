
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceData {
  id?: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: LineItem[];
  taxRate: number;
  discountAmount: number;
  businessName: string;
  businessLogo?: string;
  businessEmail: string;    // <--- Added
  businessAddress: string;  // <--- Added
  currency: string;
  notes: string;
  status: 'paid' | 'unpaid';
  createdAt?: string;
}

export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

