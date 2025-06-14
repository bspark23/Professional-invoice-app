import jsPDF from 'jspdf';
import { InvoiceData, currencies } from "@/types/invoice";

export const exportToPDF = (
  invoiceData: InvoiceData,
  formatCurrency: (amount: number, currencyCode?: string) => string,
  calculateSubtotal: () => number,
  calculateTax: () => number,
  calculateTotal: () => number,
  toast: any
) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Set colors based on theme
    const themeMap: any = {
      blue:   { header: [59, 130, 246], badge: [59, 130, 246] }, // blue-600
      green:  { header: [34, 197, 94], badge: [34, 197, 94] },   // green-500
      gray:   { header: [55, 65, 81], badge: [107, 114, 128] },  // gray-800 / gray-500
    };
    const colorTheme = invoiceData.colorTheme || "blue";
    const template = invoiceData.template || "minimalist";
    const colors = themeMap[colorTheme];

    let yPosition = 20;
    
    // Add border if template == "bordered"
    if (template === "bordered") {
      pdf.setDrawColor(...colors.header);
      pdf.setLineWidth(3);
      pdf.rect(8, 8, 194, 281); // thick border around full page
    } else if (template === "modern") {
      // Modern: subtle shade, maybe colored rectangles at top/bottom
      pdf.setFillColor(...colors.header, 0.10);
      pdf.rect(0, 0, 210, 30, 'F');
      pdf.rect(0, 280, 210, 18, 'F');
    }
    // Set consistent colors for PDF
    const primaryColor = [0, 0, 0]; // Black text
    const blueColor = [59, 130, 246]; // Blue for business name
    const greenColor = [34, 197, 94]; // Green for paid status
    const redColor = [239, 68, 68]; // Red for unpaid status
    
    
    // Add logo and business name section
    if (invoiceData.businessLogo) {
      try {
        // Convert base64 to proper format for jsPDF
        let logoData = invoiceData.businessLogo;
        if (logoData.startsWith('data:image/')) {
          pdf.addImage(logoData, 'JPEG', 20, yPosition, 30, 20);
        }
      } catch (error) {
        console.log('Error adding logo to PDF:', error);
      }
    }
    
    // Business name
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(colors.header[0], colors.header[1], colors.header[2]);
    pdf.text(invoiceData.businessName, invoiceData.businessLogo ? 60 : 20, yPosition + 15);
    
    // Invoice title and details on the right
    pdf.setFontSize(16);
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text('INVOICE', 150, yPosition + 10);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`#${invoiceData.invoiceNumber}`, 150, yPosition + 20);
    
    // Status badge
    pdf.setFontSize(9);
    if (invoiceData.status === 'paid') {
      pdf.setTextColor(greenColor[0], greenColor[1], greenColor[2]);
      pdf.text('✅ Paid', 150, yPosition + 30);
    } else {
      pdf.setTextColor(redColor[0], redColor[1], redColor[2]);
      pdf.text('❌ Unpaid', 150, yPosition + 30);
    }
    
    yPosition += 50;
    
    // Separator line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 15;
    
    // Client and Date Info
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text('Bill To:', 20, yPosition);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    yPosition += 10;
    pdf.text(invoiceData.clientName, 20, yPosition);
    yPosition += 8;
    pdf.text(invoiceData.clientEmail, 20, yPosition);
    yPosition += 8;
    
    const addressLines = invoiceData.clientAddress.split('\n');
    addressLines.forEach((line) => {
      pdf.text(line, 20, yPosition);
      yPosition += 8;
    });
    
    // Date information on the right
    let rightYPosition = yPosition - (addressLines.length + 2) * 8 - 10;
    pdf.text(`Invoice Date: ${invoiceData.invoiceDate}`, 120, rightYPosition);
    rightYPosition += 8;
    pdf.text(`Due Date: ${invoiceData.dueDate}`, 120, rightYPosition);
    rightYPosition += 8;
    pdf.text(`Currency: ${currencies.find(c => c.code === invoiceData.currency)?.name}`, 120, rightYPosition);
    
    yPosition += 20;
    
    // Line items table with borders
    pdf.setFillColor(249, 250, 251);
    pdf.rect(20, yPosition - 5, 170, 12, 'F');
    
    // Table borders
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.5);
    pdf.rect(20, yPosition - 5, 170, 12); // Header border
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Description', 25, yPosition + 3);
    pdf.text('Qty', 120, yPosition + 3);
    pdf.text('Rate', 140, yPosition + 3);
    pdf.text('Amount', 170, yPosition + 3);
    
    yPosition += 15;
    
    // Line items with borders
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    
    invoiceData.lineItems.forEach((item, index) => {
      // Draw row borders
      pdf.setDrawColor(150, 150, 150);
      pdf.setLineWidth(0.3);
      pdf.rect(20, yPosition - 5, 170, 12); // Row border
      
      pdf.text(item.description || 'No description', 25, yPosition + 3);
      pdf.text(item.quantity.toString(), 125, yPosition + 3);
      pdf.text(formatCurrency(item.rate), 140, yPosition + 3);
      pdf.text(formatCurrency(item.amount), 170, yPosition + 3);
      yPosition += 12;
    });
    
    yPosition += 15;
    
    // Totals section
    const totalsStartX = 120;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Subtotal:`, totalsStartX, yPosition);
    pdf.text(formatCurrency(calculateSubtotal()), 170, yPosition);
    yPosition += 10;
    
    if (invoiceData.taxRate > 0) {
      pdf.text(`Tax (${invoiceData.taxRate}%):`, totalsStartX, yPosition);
      pdf.text(formatCurrency(calculateTax()), 170, yPosition);
      yPosition += 10;
    }
    
    if (invoiceData.discountAmount > 0) {
      pdf.text(`Discount:`, totalsStartX, yPosition);
      pdf.text(`-${formatCurrency(invoiceData.discountAmount)}`, 170, yPosition);
      yPosition += 10;
    }
    
    // Total line
    pdf.setDrawColor(0, 0, 0);
    pdf.line(totalsStartX, yPosition + 2, 190, yPosition + 2);
    yPosition += 10;
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(`Total:`, totalsStartX, yPosition);
    pdf.text(formatCurrency(calculateTotal()), 170, yPosition);
    
    // Notes section
    if (invoiceData.notes) {
      yPosition += 25;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('Notes:', 20, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      yPosition += 10;
      
      const noteLines = invoiceData.notes.split('\n');
      noteLines.forEach((line) => {
        pdf.text(line, 20, yPosition);
        yPosition += 8;
      });
    }
    
    pdf.save(`invoice-${invoiceData.invoiceNumber}.pdf`);
    
    toast({
      title: "PDF Generated",
      description: "Invoice PDF has been downloaded successfully.",
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast({
      title: "Export Failed",
      description: "There was an error generating the PDF. Please try again.",
      variant: "destructive",
    });
  }
};

export const exportToImage = (
  format: 'png' | 'jpeg',
  invoiceData: InvoiceData,
  formatCurrency: (amount: number, currencyCode?: string) => string,
  calculateSubtotal: () => number,
  calculateTax: () => number,
  calculateTotal: () => number,
  toast: any
) => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    // Set canvas size for high quality
    canvas.width = 800;
    canvas.height = 1200;
    
    // Fill white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    let yPosition = 50;
    
    // Add logo if present
    if (invoiceData.businessLogo) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 50, yPosition, 60, 40);
        continueImageGeneration();
      };
      img.onerror = () => {
        console.log('Error loading logo for image export');
        continueImageGeneration();
      };
      img.src = invoiceData.businessLogo;
    } else {
      continueImageGeneration();
    }
    
    function continueImageGeneration() {
      // Business name
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(invoiceData.businessName, invoiceData.businessLogo ? 120 : 50, yPosition + 25);
      
      // Invoice title
      ctx.fillStyle = 'black';
      ctx.font = '18px Arial';
      ctx.fillText('INVOICE', 650, yPosition + 15);
      
      ctx.font = '14px Arial';
      ctx.fillText(`#${invoiceData.invoiceNumber}`, 650, yPosition + 35);
      
      // Status
      ctx.fillStyle = invoiceData.status === 'paid' ? '#22c55e' : '#ef4444';
      ctx.fillText(invoiceData.status === 'paid' ? '✅ Paid' : '❌ Unpaid', 650, yPosition + 55);
      
      yPosition += 100;
      
      // Bill To section
      ctx.fillStyle = 'black';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('Bill To:', 50, yPosition);
      
      ctx.font = '12px Arial';
      ctx.fillText(invoiceData.clientName, 50, yPosition + 25);
      ctx.fillText(invoiceData.clientEmail, 50, yPosition + 45);
      
      const addressLines = invoiceData.clientAddress.split('\n');
      addressLines.forEach((line, index) => {
        ctx.fillText(line, 50, yPosition + 65 + (index * 20));
      });
      
      // Date information
      const dateY = yPosition;
      ctx.fillText(`Invoice Date: ${invoiceData.invoiceDate}`, 500, dateY);
      ctx.fillText(`Due Date: ${invoiceData.dueDate}`, 500, dateY + 20);
      ctx.fillText(`Currency: ${currencies.find(c => c.code === invoiceData.currency)?.name}`, 500, dateY + 40);
      
      // Line items table
      let tableY = yPosition + 120;
      
      // Table header with background and borders
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(50, tableY - 10, 700, 30);
      
      // Draw table borders
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 1;
      ctx.strokeRect(50, tableY - 10, 700, 30);
      
      ctx.fillStyle = 'black';
      ctx.font = 'bold 12px Arial';
      ctx.fillText('Description', 60, tableY + 10);
      ctx.fillText('Qty', 450, tableY + 10);
      ctx.fillText('Rate', 550, tableY + 10);
      ctx.fillText('Amount', 650, tableY + 10);
      
      // Line items with borders
      ctx.font = '11px Arial';
      tableY += 40;
      
      invoiceData.lineItems.forEach((item, index) => {
        const y = tableY + (index * 25);
        
        // Draw row borders
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(50, y - 10, 700, 25);
        
        ctx.fillStyle = 'black';
        ctx.fillText(item.description || 'No description', 60, y);
        ctx.fillText(item.quantity.toString(), 465, y);
        ctx.fillText(formatCurrency(item.rate), 550, y);
        ctx.fillText(formatCurrency(item.amount), 650, y);
      });
      
      // Totals section
      const totalsY = tableY + (invoiceData.lineItems.length * 25) + 40;
      ctx.font = '12px Arial';
      
      let currentY = totalsY;
      ctx.fillText(`Subtotal: ${formatCurrency(calculateSubtotal())}`, 500, currentY);
      currentY += 20;
      
      if (invoiceData.taxRate > 0) {
        ctx.fillText(`Tax (${invoiceData.taxRate}%): ${formatCurrency(calculateTax())}`, 500, currentY);
        currentY += 20;
      }
      
      if (invoiceData.discountAmount > 0) {
        ctx.fillText(`Discount: -${formatCurrency(invoiceData.discountAmount)}`, 500, currentY);
        currentY += 20;
      }
      
      // Total
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`Total: ${formatCurrency(calculateTotal())}`, 500, currentY + 20);
      
      // Notes
      if (invoiceData.notes) {
        ctx.font = 'bold 12px Arial';
        ctx.fillText('Notes:', 50, currentY + 60);
        ctx.font = '11px Arial';
        
        const noteLines = invoiceData.notes.split('\n');
        noteLines.forEach((line, index) => {
          ctx.fillText(line, 50, currentY + 85 + (index * 20));
        });
      }
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `invoice-${invoiceData.invoiceNumber}.${format}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          toast({
            title: "Image Generated",
            description: `Invoice has been downloaded as ${format.toUpperCase()}.`,
          });
        }
      }, `image/${format}`);
    }
    
  } catch (error) {
    console.error('Error generating image:', error);
    toast({
      title: "Export Failed",
      description: "There was an error generating the image. Please try again.",
      variant: "destructive",
    });
  }
};
