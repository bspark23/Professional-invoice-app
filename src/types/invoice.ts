
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
  businessEmail: string;
  businessAddress: string;
  currency: string;
  notes: string;
  status: 'paid' | 'unpaid';
  createdAt?: string;
  template?: 'minimalist' | 'bordered' | 'modern' | 'classic' | 'bold' | 'elegant' | 'horizontal' | 'corporate' | 'custom';
  colorTheme?: 'blue' | 'green' | 'gray' | 'purple' | 'red' | 'orange' | 'teal' | 'gradient-blue' | 'gradient-purple';
  signatureImage?: string;
  accountNumber?: string;
  bankDetails?: string;
  signatureName?: string;
  signaturePosition?: string;
  signatureNote?: string;
  // New customizable fields
  businessSlogan?: string;
  businessPhone?: string;
  businessWebsite?: string;
  paymentTerms?: string;
  customFields?: { [key: string]: string };
  customTemplate?: string; // For uploaded templates
}

export interface CustomTemplate {
  id: string;
  name: string;
  content: string; // HTML content or image data URL
  type: 'html' | 'image';
  createdAt: string;
  userId: string;
}

export const colorThemes = [
  { value: 'blue', name: 'Blue', type: 'plain', color: '#2563eb' },
  { value: 'green', name: 'Green', type: 'plain', color: '#16a34a' },
  { value: 'gray', name: 'Gray', type: 'plain', color: '#4b5563' },
  { value: 'purple', name: 'Purple', type: 'plain', color: '#7c3aed' },
  { value: 'red', name: 'Red', type: 'plain', color: '#ef4444' },
  { value: 'orange', name: 'Orange', type: 'plain', color: '#f59e42' },
  { value: 'teal', name: 'Teal', type: 'plain', color: '#14b8a6' },
  // Gradients
  { value: 'gradient-blue', name: 'Gradient Blue', type: 'gradient', gradient: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)' },
  { value: 'gradient-purple', name: 'Gradient Purple', type: 'gradient', gradient: 'linear-gradient(90deg, #a78bfa 0%, #818cf8 100%)' },
];

export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];
