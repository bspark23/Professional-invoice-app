
// TypeScript global augmentation for window (only needed if we ever use window.X)
// But since we now do dynamic local imports, this isn't necessary anymore.
// declare global { interface Window { jspdf?: any; html2canvas?: any; } }

import { InvoiceData } from "@/types/invoice";

export const exportToPDF = async (
  invoiceData: InvoiceData,
  formatCurrency: (amount: number, currencyCode?: string) => string,
  calculateSubtotal: () => number,
  calculateTax: () => number,
  calculateTotal: () => number,
  toast: any
) => {
  try {
    // Dynamically import jsPDF
    const { jsPDF } = await import('jspdf');

    // Subtle light background
    const doc = new jsPDF('p', 'pt');
    doc.setFillColor(248, 250, 252); // light blue/gray background
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');

    // Header
    doc.setTextColor(40, 50, 85);
    doc.setFontSize(21);
    doc.text(invoiceData.businessName, 36, 50);

    // Business details
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(invoiceData.businessAddress, 36, 65);
    doc.text(invoiceData.businessEmail, 36, 80);

    // Invoice details
    doc.setFontSize(16);
    doc.setTextColor(40, 50, 85);
    doc.text("INVOICE", 450, 50);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Invoice Number: ${invoiceData.invoiceNumber}`, 450, 65);
    doc.text(`Invoice Date: ${invoiceData.invoiceDate}`, 450, 80);
    doc.text(`Due Date: ${invoiceData.dueDate}`, 450, 95);

    // Client details
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text("Bill To:", 36, 130);
    doc.setFontSize(11);
    doc.text(invoiceData.clientName, 36, 145);
    doc.text(invoiceData.clientEmail, 36, 160);
    doc.text(invoiceData.clientAddress.split('\n').join(', '), 36, 175);

    // Add logo if available
    if (invoiceData.businessLogo) {
      try {
        doc.addImage(invoiceData.businessLogo, 'PNG', 450, 110, 100, 50);
      } catch (error) {
        console.error("Error adding logo to PDF:", error);
      }
    }

    // Tighter table with visible lines
    let startY = 230;
    const colWidths = [200, 70, 70, 90];
    doc.setFontSize(13);
    doc.setTextColor(33, 37, 41);

    // Use lighter gray for table border and row backgrounds
    doc.setLineWidth(0.7);
    doc.setDrawColor(210, 220, 235);

    const tableLeft = 36;
    // Header row
    doc.setFillColor(236, 240, 248); // even lighter gray
    doc.rect(tableLeft, startY, colWidths.reduce((a,b) => a+b), 26, "F");
    doc.rect(tableLeft, startY, colWidths.reduce((a,b) => a+b), 26);
    doc.text("Description", tableLeft+8, startY+17);
    doc.text("Qty", tableLeft+colWidths[0]+8, startY+17);
    doc.text("Rate", tableLeft+colWidths[0]+colWidths[1]+8, startY+17);
    doc.text("Amount", tableLeft+colWidths[0]+colWidths[1]+colWidths[2]+8, startY+17);
    startY += 26;

    // Table body
    invoiceData.lineItems.forEach((item, idx) => {
      const itemY = startY + idx*23;
      // Alternate row background for better readability
      if (idx % 2 === 0) {
        doc.setFillColor(244, 247, 252);
        doc.rect(tableLeft, itemY, colWidths.reduce((a,b) => a+b), 23, "F");
      }
      doc.rect(tableLeft, itemY, colWidths.reduce((a,b) => a+b), 23); // border for this row
      doc.text(String(item.description), tableLeft+8, itemY+15);
      doc.text(String(item.quantity), tableLeft+colWidths[0]+8, itemY+15);
      doc.text(formatCurrency(item.rate, invoiceData.currency), tableLeft+colWidths[0]+colWidths[1]+8, itemY+15);
      doc.text(formatCurrency(item.amount, invoiceData.currency), tableLeft+colWidths[0]+colWidths[1]+colWidths[2]+8, itemY+15);
    });

    // Crop: move totals/signature closer to the table if table is short
    let endTableY = startY + invoiceData.lineItems.length*23;
    let summaryY = endTableY + 18;
    if (invoiceData.lineItems.length < 4) summaryY -= (4-invoiceData.lineItems.length)*14;

    doc.setFontSize(14);
    doc.text(`Subtotal: ${formatCurrency(calculateSubtotal(), invoiceData.currency)}`, tableLeft, summaryY);
    doc.text(`Tax: ${formatCurrency(calculateTax(), invoiceData.currency)}`, tableLeft, summaryY+18);
    doc.text(`Discount: -${formatCurrency(invoiceData.discountAmount, invoiceData.currency)}`, tableLeft, summaryY+36);
    doc.setFontSize(17);
    doc.text(`Total: ${formatCurrency(calculateTotal(), invoiceData.currency)}`, tableLeft, summaryY+56);

    // Notes
    if (invoiceData.notes) {
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text("Notes:", tableLeft, summaryY + 85);
      doc.text(invoiceData.notes, tableLeft, summaryY + 100);
    }

    // Signature
    if (invoiceData.signatureImage) {
      try {
        doc.addImage(invoiceData.signatureImage, 'PNG', 400, summaryY + 85, 150, 60);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(400, summaryY + 155, 550, summaryY + 155);
        doc.setFontSize(10);
        doc.text("Authorized Signature", 450, summaryY + 170);
      } catch (error) {
        console.error("Error adding signature to PDF:", error);
      }
    }

    // Status watermark for paid invoices
    if (invoiceData.status === 'paid') {
      if (doc.setGState) {
        doc.setGState(new (jsPDF as any).GState({ opacity: 0.3 }));
        doc.setTextColor(0, 128, 0);
        doc.setFontSize(80);
        doc.text("PAID", 250, 450, { angle: 45 });
      }
    }

    doc.save(`${invoiceData.invoiceNumber}.pdf`);
    if (toast) toast({ title: "Exported PDF", description: "Export successful" });
  } catch (error) {
    console.error("Error generating PDF:", error);
    if (toast) toast({ 
      title: "Export Failed", 
      description: "Could not generate PDF. Please try again.",
      variant: "destructive"
    });
  }
};

export const exportToImage = async (
  format: 'png' | 'jpeg',
  invoiceData: InvoiceData,
  formatCurrency: (amount: number, currencyCode?: string) => string,
  calculateSubtotal: () => number,
  calculateTax: () => number,
  calculateTotal: () => number,
  toast: any,
) => {
  try {
    // Dynamically import html2canvas
    const html2canvas = (await import('html2canvas')).default;

    // Get the invoice element
    const invoiceElement = document.getElementById('invoice-preview');
    if (!invoiceElement) {
      throw new Error("Invoice preview element not found");
    }

    // Add a class for tighter export styling
    invoiceElement.classList.add('export-mode');

    // Capture the element
    const canvas = await html2canvas(invoiceElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
    });

    invoiceElement.classList.remove('export-mode');

    // Convert to image
    const image = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.95 : undefined);

    // Download link
    const link = document.createElement('a');
    link.download = `${invoiceData.invoiceNumber}.${format}`;
    link.href = image;
    link.click();

    toast?.({ 
      title: `Exported ${format.toUpperCase()}`, 
      description: "Export successful" 
    });
  } catch (error) {
    console.error(`Error generating ${format}:`, error);
    toast?.({ 
      title: "Export Failed", 
      description: `Could not generate ${format.toUpperCase()}. Please try again.`,
      variant: "destructive"
    });
  }
};
