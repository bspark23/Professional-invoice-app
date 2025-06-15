
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LandingPage from "@/components/LandingPage";

const HomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  // Sample invoice data for the preview
  const sampleInvoiceData = {
    businessName: "InvoiceCraft Pro",
    invoiceNumber: "INV-001",
    clientName: "Acme Corporation",
    total: "$2,500.00",
    status: 'paid' as const,
    currency: "USD"
  };

  return (
    <LandingPage
      businessName={sampleInvoiceData.businessName}
      invoiceNumber={sampleInvoiceData.invoiceNumber}
      clientName={sampleInvoiceData.clientName}
      total={sampleInvoiceData.total}
      status={sampleInvoiceData.status}
      currency={sampleInvoiceData.currency}
      onGetStarted={handleGetStarted}
    />
  );
};

export default HomePage;
