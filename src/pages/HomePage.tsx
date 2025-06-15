
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LandingPage from "@/components/LandingPage";

const HomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  // Sample invoice data for the preview - always show this regardless of user status
  const sampleInvoiceData = {
    businessName: "InvoiceCraft Pro",
    businessLogo: "",
    invoiceNumber: "INV-2024-12-001",
    clientName: "Acme Corporation",
    total: "$2,500.00",
    status: 'paid' as const,
    currency: "USD"
  };

  return (
    <div className="min-h-screen">
      <LandingPage
        businessName={sampleInvoiceData.businessName}
        businessLogo={sampleInvoiceData.businessLogo}
        invoiceNumber={sampleInvoiceData.invoiceNumber}
        clientName={sampleInvoiceData.clientName}
        total={sampleInvoiceData.total}
        status={sampleInvoiceData.status}
        currency={sampleInvoiceData.currency}
        onGetStarted={handleGetStarted}
      />
    </div>
  );
};

export default HomePage;
