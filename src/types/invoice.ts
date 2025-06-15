
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
  lpoReference?: string;
  template?: string;
  colorTheme?: string;
  createdAt?: string;
}

export interface CustomTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  type?: string;
  userId?: string;
}

export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

export const colorThemes = [
  { id: 'blue', name: 'Blue', primary: '#3B82F6', secondary: '#EFF6FF' },
  { id: 'green', name: 'Green', primary: '#10B981', secondary: '#ECFDF5' },
  { id: 'purple', name: 'Purple', primary: '#8B5CF6', secondary: '#F3E8FF' },
  { id: 'red', name: 'Red', primary: '#EF4444', secondary: '#FEF2F2' },
  { id: 'orange', name: 'Orange', primary: '#F97316', secondary: '#FFF7ED' },
  { id: 'gray', name: 'Gray', primary: '#6B7280', secondary: '#F9FAFB' },
];
