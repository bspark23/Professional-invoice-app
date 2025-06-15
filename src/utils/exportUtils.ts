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
    if (!window.jspdf) {
      const jspdfModule = await import('jspdf');
      window.jspdf = { jsPDF: jspdfModule.default };
    }

    // Subtle light background
    const doc = new window.jspdf.jsPDF('p', 'pt');
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
    doc.setLineWidth(0.6);
    const tableLeft = 36;
    // Header row
    doc.setFillColor(226, 232, 240); // subtle gray
    doc.rect(tableLeft, startY, colWidths.reduce((a,b) => a+b), 28, "F");
    doc.setDrawColor(180, 190, 205); // light gray lines
    doc.rect(tableLeft, startY, colWidths.reduce((a,b) => a+b), 28);
    doc.text("Description", tableLeft+8, startY+19);
    doc.text("Qty", tableLeft+colWidths[0]+8, startY+19);
    doc.text("Rate", tableLeft+colWidths[0]+colWidths[1]+8, startY+19);
    doc.text("Amount", tableLeft+colWidths[0]+colWidths[1]+colWidths[2]+8, startY+19);
    startY += 28;

    // Table body
    invoiceData.lineItems.forEach((item, idx) => {
      const itemY = startY + idx*27;
      doc.setFillColor(255, 255, 255);
      doc.rect(tableLeft, itemY, colWidths.reduce((a,b) => a+b), 27, "F");
      doc.rect(tableLeft, itemY, colWidths.reduce((a,b) => a+b), 27); // border for this row
      doc.text(String(item.description), tableLeft+8, itemY+18);
      doc.text(String(item.quantity), tableLeft+colWidths[0]+8, itemY+18);
      doc.text(formatCurrency(item.rate, invoiceData.currency), tableLeft+colWidths[0]+colWidths[1]+8, itemY+18);
      doc.text(formatCurrency(item.amount, invoiceData.currency), tableLeft+colWidths[0]+colWidths[1]+colWidths[2]+8, itemY+18);
    });

    // Crop: move totals/signature closer to the table if table is short
    let endTableY = startY + invoiceData.lineItems.length*27;
    let summaryY = endTableY + 20;
    if (invoiceData.lineItems.length < 4) summaryY -= (4-invoiceData.lineItems.length)*18;

    doc.setFontSize(14);
    doc.text(`Subtotal: ${formatCurrency(calculateSubtotal(), invoiceData.currency)}`, tableLeft, summaryY);
    doc.text(`Tax: ${formatCurrency(calculateTax(), invoiceData.currency)}`, tableLeft, summaryY+20);
    doc.text(`Discount: -${formatCurrency(invoiceData.discountAmount, invoiceData.currency)}`, tableLeft, summaryY+40);
    doc.setFontSize(17);
    doc.text(`Total: ${formatCurrency(calculateTotal(), invoiceData.currency)}`, tableLeft, summaryY+65);

    // Notes
    if (invoiceData.notes) {
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text("Notes:", tableLeft, summaryY + 100);
      doc.text(invoiceData.notes, tableLeft, summaryY + 115);
    }

    // Signature
    if (invoiceData.signatureImage) {
      try {
        doc.addImage(invoiceData.signatureImage, 'PNG', 400, summaryY + 100, 150, 60);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(400, summaryY + 170, 550, summaryY + 170);
        doc.setFontSize(10);
        doc.text("Authorized Signature", 450, summaryY + 185);
      } catch (error) {
        console.error("Error adding signature to PDF:", error);
      }
    }

    // Status watermark for paid invoices
    if (invoiceData.status === 'paid') {
      doc.setGState(new window.jspdf.GState({ opacity: 0.3 }));
      doc.setTextColor(0, 128, 0);
      doc.setFontSize(80);
      doc.text("PAID", 250, 450, { angle: 45 });
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
    if (!window.html2canvas) {
      const html2canvasModule = await import('html2canvas');
      window.html2canvas = html2canvasModule.default;
    }

    // Get the invoice element
    const invoiceElement = document.getElementById('invoice-preview');
    if (!invoiceElement) {
      throw new Error("Invoice preview element not found");
    }

    // Add a class for tighter export styling
    invoiceElement.classList.add('export-mode');

    // Capture the element
    const canvas = await window.html2canvas(invoiceElement, {
      scale: 2, // Higher resolution
      useCORS: true, // Allow images from other domains
      allowTaint: true,
      backgroundColor: '#ffffff',
    });

    // Remove the export class
    invoiceElement.classList.remove('export-mode');

    // Convert to image
    const image = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.95 : undefined);

    // Create download link
    const link = document.createElement('a');
    link.download = `${invoiceData.invoiceNumber}.${format}`;
    link.href = image;
    link.click();

    toast({ 
      title: `Exported ${format.toUpperCase()}`, 
      description: "Export successful" 
    });
  } catch (error) {
    console.error(`Error generating ${format}:`, error);
    toast({ 
      title: "Export Failed", 
      description: `Could not generate ${format.toUpperCase()}. Please try again.`,
      variant: "destructive"
    });
  }
};
