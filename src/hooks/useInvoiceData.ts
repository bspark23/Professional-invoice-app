import { useState, useEffect } from "react";
import { InvoiceData, LineItem } from "@/types/invoice";
import { useToast } from "@/hooks/use-toast";

export const useInvoiceData = () => {
  const { toast } = useToast();
  const [savedInvoices, setSavedInvoices] = useState<InvoiceData[]>([]);
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lineItems: [
      { id: '1', description: "", quantity: 1, rate: 0, amount: 0 }
    ],
    taxRate: 0,
    discountAmount: 0,
    businessName: "Your Business Name",
    businessLogo: "",
    businessEmail: "",
    businessAddress: "",
    currency: 'USD',
    notes: '',
    status: 'unpaid',
    template: 'minimalist',
    colorTheme: 'blue'
  });

  // Generate auto invoice number
  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const lastInvoiceNumber = savedInvoices.length > 0 
      ? Math.max(...savedInvoices.map(inv => {
          const match = inv.invoiceNumber.match(/(\d+)$/);
          return match ? parseInt(match[1]) : 0;
        }))
      : 0;
    const nextNumber = String(lastInvoiceNumber + 1).padStart(3, '0');
    return `INV-${year}-${month}-${nextNumber}`;
  };

  useEffect(() => {
    const savedData = localStorage.getItem('invoicer-pro-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setInvoiceData(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.log('Error loading saved data:', error);
      }
    }

    const savedInvoicesData = localStorage.getItem('invoicer-pro-invoices');
    if (savedInvoicesData) {
      try {
        const parsed = JSON.parse(savedInvoicesData);
        setSavedInvoices(parsed);
      } catch (error) {
        console.log('Error loading saved invoices:', error);
      }
    }

    // Set initial invoice number if empty
    if (!invoiceData.invoiceNumber) {
      setInvoiceData(prev => ({ ...prev, invoiceNumber: generateInvoiceNumber() }));
    }
  }, []);

  const saveInvoiceData = () => {
    localStorage.setItem('invoicer-pro-data', JSON.stringify(invoiceData));
    toast({
      title: "Invoice Data Saved",
      description: "Your current invoice data has been saved locally.",
    });
  };

  const saveInvoice = () => {
    const invoiceToSave = {
      ...invoiceData,
      id: invoiceData.id || Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    const existingInvoices = [...savedInvoices];
    const existingIndex = existingInvoices.findIndex(inv => inv.id === invoiceToSave.id);
    
    if (existingIndex >= 0) {
      existingInvoices[existingIndex] = invoiceToSave;
    } else {
      existingInvoices.push(invoiceToSave);
    }

    setSavedInvoices(existingInvoices);
    localStorage.setItem('invoicer-pro-invoices', JSON.stringify(existingInvoices));
    
    setInvoiceData(prev => ({ ...prev, id: invoiceToSave.id }));
    
    toast({
      title: "Invoice Saved",
      description: "Your invoice has been saved and can be viewed later.",
    });
  };

  const loadInvoice = (invoice: InvoiceData) => {
    setInvoiceData(invoice);
    toast({
      title: "Invoice Loaded",
      description: "Invoice loaded successfully.",
    });
  };

  const deleteInvoice = (invoiceId: string) => {
    const updatedInvoices = savedInvoices.filter(inv => inv.id !== invoiceId);
    setSavedInvoices(updatedInvoices);
    localStorage.setItem('invoicer-pro-invoices', JSON.stringify(updatedInvoices));
    toast({
      title: "Invoice Deleted",
      description: "Invoice has been deleted successfully.",
    });
  };

  const toggleInvoiceStatus = (invoiceId: string) => {
    const updatedInvoices = savedInvoices.map(inv => 
      inv.id === invoiceId 
        ? { ...inv, status: inv.status === 'paid' ? 'unpaid' : 'paid' as 'paid' | 'unpaid' }
        : inv
    );
    setSavedInvoices(updatedInvoices);
    localStorage.setItem('invoicer-pro-invoices', JSON.stringify(updatedInvoices));
    toast({
      title: "Status Updated",
      description: "Invoice status has been updated.",
    });
  };

  const createNewInvoice = () => {
    setInvoiceData({
      clientName: "",
      clientEmail: "",
      clientAddress: "",
      invoiceNumber: generateInvoiceNumber(),
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lineItems: [
        { id: Date.now().toString(), description: "", quantity: 1, rate: 0, amount: 0 }
      ],
      taxRate: 0,
      discountAmount: 0,
      businessName: invoiceData.businessName,
      businessLogo: invoiceData.businessLogo,
      businessEmail: invoiceData.businessEmail,
      businessAddress: invoiceData.businessAddress,
      currency: invoiceData.currency,
      notes: '',
      status: 'unpaid',
      template: invoiceData.template || 'minimalist',
      colorTheme: invoiceData.colorTheme || 'blue'
    });
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setInvoiceData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem]
    }));
  };

  const removeLineItem = (id: string) => {
    if (invoiceData.lineItems.length > 1) {
      setInvoiceData(prev => ({
        ...prev,
        lineItems: prev.lineItems.filter(item => item.id !== id)
      }));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setInvoiceData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updated.amount = updated.quantity * updated.rate;
          }
          return updated;
        }
        return item;
      })
    }));
  };

  return {
    invoiceData,
    setInvoiceData,
    savedInvoices,
    setSavedInvoices,
    saveInvoiceData,
    saveInvoice,
    loadInvoice,
    deleteInvoice,
    toggleInvoiceStatus,
    createNewInvoice,
    addLineItem,
    removeLineItem,
    updateLineItem,
    generateInvoiceNumber
  };
};
