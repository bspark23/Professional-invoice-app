import jsPDF from 'jspdf';
import { InvoiceData, currencies, colorThemes } from "@/types/invoice";

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

    // Find theme style for light effect
    const themeObj = colorThemes.find(ct => ct.value === invoiceData.colorTheme) || colorThemes[0];

    // --- INVOICE CARD LIGHT BACKGROUND LOGIC ---
    // Card position and size on page
    const cardX = 12;
    const cardY = 12;
    const cardW = 186;  // 210mm - (12*2) margin
    const cardH = 273;  // 297mm - (12*2) margin

    if (themeObj.type === 'gradient' && themeObj.gradient) {
      // Simulate a light gradient: overlay a semi-transparent white over base gradient
      // jsPDF doesn't support gradients directly; so we approximate with pale fill + border

      // Light blue as fallback for "gradient-blue", light purple for "gradient-purple"
      const gradLightColor =
        themeObj.value === "gradient-blue"
          ? [228, 233, 255]
          : themeObj.value === "gradient-purple"
          ? [239, 233, 252]
          : [245, 247, 255];
      pdf.setFillColor(...gradLightColor);
      pdf.roundedRect(cardX, cardY, cardW, cardH, 6, 6, 'F');
      // Also white overlay for near-90% white
      pdf.setFillColor(255, 255, 255, 0.9 * 255);  // Not all pdf viewers handle alpha (so we just use lightest color)
      pdf.roundedRect(cardX, cardY, cardW, cardH, 6, 6, 'F');
      // Card border
      pdf.setDrawColor(200, 200, 230);
      pdf.roundedRect(cardX, cardY, cardW, cardH, 6, 6, 'S'); // border only

    } else if (themeObj.type === 'plain' && themeObj.color) {
      // Use the specified plain color, but with alpha blending over white
      // Parse color and blend with white: result = color at 10% + 90% white
      function hexToRgb(hex: string): [number, number, number] {
        const n = hex.replace("#", "");
        return [
          parseInt(n.slice(0, 2), 16),
          parseInt(n.slice(2, 4), 16),
          parseInt(n.slice(4, 6), 16),
        ];
      }
      const baseRgb = hexToRgb(themeObj.color);
      // Blend: light = 10% color + 90% white
      const lightRgb: [number, number, number] = [
        Math.round(baseRgb[0] * 0.1 + 255 * 0.9),
        Math.round(baseRgb[1] * 0.1 + 255 * 0.9),
        Math.round(baseRgb[2] * 0.1 + 255 * 0.9),
      ];
      pdf.setFillColor(...lightRgb);
      pdf.roundedRect(cardX, cardY, cardW, cardH, 6, 6, 'F');
      // Border similar to color, but softer
      pdf.setDrawColor(baseRgb[0], baseRgb[1], baseRgb[2]);
      pdf.roundedRect(cardX, cardY, cardW, cardH, 6, 6, 'S');
    } else {
      // Default: white card area with a light gray border
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(cardX, cardY, cardW, cardH, 6, 6, 'F');
      pdf.setDrawColor(210, 210, 210);
      pdf.roundedRect(cardX, cardY, cardW, cardH, 6, 6, 'S');
    }

    let yPosition = cardY + 8;
    
    // Add border if template == "bordered"
    if (template === "bordered") {
      pdf.setDrawColor(colors.header[0], colors.header[1], colors.header[2]);
      pdf.setLineWidth(3);
      pdf.rect(8, 8, 194, 281); // thick border around full page
    } else if (template === "modern") {
      // Modern: subtle shade, maybe colored rectangles at top/bottom
      // FIX: setFillColor expects r,g,b,a NOT spread!
      pdf.setFillColor(colors.header[0], colors.header[1], colors.header[2], 0.10);
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
          pdf.addImage(logoData, 'JPEG', cardX + 8, yPosition, 30, 20);
        }
      } catch (error) {
        console.log('Error adding logo to PDF:', error);
      }
    }
    
    // Business name
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(colors.header[0], colors.header[1], colors.header[2]);
    pdf.text(invoiceData.businessName, invoiceData.businessLogo ? cardX + 48 : cardX + 8, yPosition + 15);
    
    // Invoice title and details on the right
    pdf.setFontSize(16);
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text('INVOICE', cardX + 138, yPosition + 10);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`#${invoiceData.invoiceNumber}`, cardX + 138, yPosition + 20);
    
    // Status badge
    pdf.setFontSize(9);
    if (invoiceData.status === 'paid') {
      pdf.setTextColor(greenColor[0], greenColor[1], greenColor[2]);
      pdf.text('✅ Paid', cardX + 138, yPosition + 30);
    } else {
      pdf.setTextColor(redColor[0], redColor[1], redColor[2]);
      pdf.text('❌ Unpaid', cardX + 138, yPosition + 30);
    }
    
    yPosition += 50;
    
    // Separator line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(cardX + 8, yPosition, cardX + 178, yPosition);
    yPosition += 15;
    
    // Client and Date Info
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text('Bill To:', cardX + 8, yPosition);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    yPosition += 10;
    pdf.text(invoiceData.clientName, cardX + 8, yPosition);
    yPosition += 8;
    pdf.text(invoiceData.clientEmail, cardX + 8, yPosition);
    yPosition += 8;
    
    const addressLines = invoiceData.clientAddress.split('\n');
    addressLines.forEach((line) => {
      pdf.text(line, cardX + 8, yPosition);
      yPosition += 8;
    });
    
    // Date information on the right
    let rightYPosition = yPosition - (addressLines.length + 2) * 8 - 10;
    pdf.text(`Invoice Date: ${invoiceData.invoiceDate}`, cardX + 108, rightYPosition);
    rightYPosition += 8;
    pdf.text(`Due Date: ${invoiceData.dueDate}`, cardX + 108, rightYPosition);
    rightYPosition += 8;
    pdf.text(`Currency: ${currencies.find(c => c.code === invoiceData.currency)?.name}`, cardX + 108, rightYPosition);
    
    yPosition += 20;
    
    // Line items table with borders
    pdf.setFillColor(249, 250, 251);
    pdf.rect(cardX + 8, yPosition - 5, 170, 12, 'F');
    
    // Table borders
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.5);
    pdf.rect(cardX + 8, yPosition - 5, 170, 12); // Header border
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Description', cardX + 13, yPosition + 3);
    pdf.text('Qty', cardX + 108, yPosition + 3);
    pdf.text('Rate', cardX + 128, yPosition + 3);
    pdf.text('Amount', cardX + 158, yPosition + 3);
    
    yPosition += 15;
    
    // Line items with borders
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    
    invoiceData.lineItems.forEach((item, index) => {
      // Draw row borders
      pdf.setDrawColor(150, 150, 150);
      pdf.setLineWidth(0.3);
      pdf.rect(cardX + 8, yPosition - 5, 170, 12); // Row border
      
      pdf.text(item.description || 'No description', cardX + 13, yPosition + 3);
      pdf.text(item.quantity.toString(), cardX + 113, yPosition + 3);
      pdf.text(formatCurrency(item.rate), cardX + 128, yPosition + 3);
      pdf.text(formatCurrency(item.amount), cardX + 158, yPosition + 3);
      yPosition += 12;
    });
    
    yPosition += 15;
    
    // Totals section
    const totalsStartX = cardX + 108;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Subtotal:`, totalsStartX, yPosition);
    pdf.text(formatCurrency(calculateSubtotal()), cardX + 158, yPosition);
    yPosition += 10;
    
    if (invoiceData.taxRate > 0) {
      pdf.text(`Tax (${invoiceData.taxRate}%):`, totalsStartX, yPosition);
      pdf.text(formatCurrency(calculateTax()), cardX + 158, yPosition);
      yPosition += 10;
    }
    
    if (invoiceData.discountAmount > 0) {
      pdf.text(`Discount:`, totalsStartX, yPosition);
      pdf.text(`-${formatCurrency(invoiceData.discountAmount)}`, cardX + 158, yPosition);
      yPosition += 10;
    }
    
    // Total line
    pdf.setDrawColor(0, 0, 0);
    pdf.line(totalsStartX, yPosition + 2, cardX + 178, yPosition + 2);
    yPosition += 10;
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(`Total:`, totalsStartX, yPosition);
    pdf.text(formatCurrency(calculateTotal()), cardX + 158, yPosition);
    
    // Notes section
    if (invoiceData.notes) {
      yPosition += 25;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('Notes:', cardX + 8, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      yPosition += 10;
      
      const noteLines = invoiceData.notes.split('\n');
      noteLines.forEach((line) => {
        pdf.text(line, cardX + 8, yPosition);
        yPosition += 8;
      });
    }

    let yPos = pdf.internal.pageSize.getHeight()-45;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.text('Signature:', cardX + 8, yPos);

    if (invoiceData.signatureImage) {
      try {
        pdf.addImage(invoiceData.signatureImage, 'PNG', cardX + 38, yPos-10, 60, 20);
      } catch {}
    } else {
      pdf.line(cardX + 38, yPos, cardX + 108, yPos); // blank signature line
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
    
    // Card area in image
    const cardX = 36;
    const cardY = 36;
    const cardW = canvas.width - 72;   // 800 - 36*2
    const cardH = canvas.height - 72;

    // Find theme style for light "card" effect
    const themeObj2 = colorThemes.find(ct => ct.value === invoiceData.colorTheme) || colorThemes[0];

    if (themeObj2.type === "gradient" && themeObj2.gradient) {
      // Approximate a light gradient as pale color + white overlay
      ctx.save();
      let grad;
      if (themeObj2.value === "gradient-blue") {
        grad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
        grad.addColorStop(0, "#e4e9ff"); // very light blue
        grad.addColorStop(1, "#f8faff");
      } else {
        grad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
        grad.addColorStop(0, "#efe9fc"); // very light purple
        grad.addColorStop(1, "#f8faff");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(cardX, cardY, cardW, cardH);
      ctx.globalAlpha = 0.9; // white overlay
      ctx.fillStyle = "#fff";
      ctx.fillRect(cardX, cardY, cardW, cardH);
      ctx.globalAlpha = 1;
      ctx.restore();
      // border
      ctx.strokeStyle = "#c7d5fc";
      ctx.lineWidth = 2;
      ctx.strokeRect(cardX, cardY, cardW, cardH);
    } else if (themeObj2.type === "plain" && themeObj2.color) {
      // Blend with white: 10% color, 90% white
      function hexToRgb(hex: string): [number, number, number] {
        const n = hex.replace("#", "");
        return [
          parseInt(n.slice(0, 2), 16),
          parseInt(n.slice(2, 4), 16),
          parseInt(n.slice(4, 6), 16),
        ];
      }
      const baseRgb = hexToRgb(themeObj2.color);
      const lightRgb = [
        Math.round(baseRgb[0] * 0.1 + 255 * 0.9),
        Math.round(baseRgb[1] * 0.1 + 255 * 0.9),
        Math.round(baseRgb[2] * 0.1 + 255 * 0.9),
      ];
      ctx.fillStyle = `rgb(${lightRgb[0]},${lightRgb[1]},${lightRgb[2]})`;
      ctx.fillRect(cardX, cardY, cardW, cardH);
      // border
      ctx.strokeStyle = `rgb(${baseRgb[0]},${baseRgb[1]},${baseRgb[2]})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(cardX, cardY, cardW, cardH);
    } else {
      // fallback (white card)
      ctx.fillStyle = "#fff";
      ctx.fillRect(cardX, cardY, cardW, cardH);
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 2;
      ctx.strokeRect(cardX, cardY, cardW, cardH);
    }
    
    let yPosition = cardY + 30;
    
    // Add logo if present
    if (invoiceData.businessLogo) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, cardX + 14, yPosition, 60, 40);
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
      ctx.fillText(invoiceData.businessName, invoiceData.businessLogo ? cardX + 84 : cardX + 14, yPosition + 25);
      
      // Invoice title
      ctx.fillStyle = 'black';
      ctx.font = '18px Arial';
      ctx.fillText('INVOICE', cardX + 614, yPosition + 15);
      
      ctx.font = '14px Arial';
      ctx.fillText(`#${invoiceData.invoiceNumber}`, cardX + 614, yPosition + 35);
      
      // Status
      ctx.fillStyle = invoiceData.status === 'paid' ? '#22c55e' : '#ef4444';
      ctx.fillText(invoiceData.status === 'paid' ? '✅ Paid' : '❌ Unpaid', cardX + 614, yPosition + 55);
      
      yPosition += 100;
      
      // Bill To section
      ctx.fillStyle = 'black';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('Bill To:', cardX + 14, yPosition);
      
      ctx.font = '12px Arial';
      ctx.fillText(invoiceData.clientName, cardX + 14, yPosition + 25);
      ctx.fillText(invoiceData.clientEmail, cardX + 14, yPosition + 45);
      
      const addressLines = invoiceData.clientAddress.split('\n');
      addressLines.forEach((line, index) => {
        ctx.fillText(line, cardX + 14, yPosition + 65 + (index * 20));
      });
      
      // Date information
      const dateY = yPosition;
      ctx.fillText(`Invoice Date: ${invoiceData.invoiceDate}`, cardX + 464, dateY);
      ctx.fillText(`Due Date: ${invoiceData.dueDate}`, cardX + 464, dateY + 20);
      ctx.fillText(`Currency: ${currencies.find(c => c.code === invoiceData.currency)?.name}`, cardX + 464, dateY + 40);
      
      // Line items table
      let tableY = yPosition + 120;
      
      // Table header with background and borders
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(cardX + 14, tableY - 10, 700, 30);
      
      // Draw table borders
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 1;
      ctx.strokeRect(cardX + 14, tableY - 10, 700, 30);
      
      ctx.fillStyle = 'black';
      ctx.font = 'bold 12px Arial';
      ctx.fillText('Description', cardX + 24, tableY + 10);
      ctx.fillText('Qty', cardX + 414, tableY + 10);
      ctx.fillText('Rate', cardX + 514, tableY + 10);
      ctx.fillText('Amount', cardX + 614, tableY + 10);
      
      // Line items with borders
      ctx.font = '11px Arial';
      tableY += 40;
      
      invoiceData.lineItems.forEach((item, index) => {
        const y = tableY + (index * 25);
        
        // Draw row borders
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(cardX + 14, y - 10, 700, 25);
        
        ctx.fillStyle = 'black';
        ctx.fillText(item.description || 'No description', cardX + 24, y);
        ctx.fillText(item.quantity.toString(), cardX + 429, y);
        ctx.fillText(formatCurrency(item.rate), cardX + 514, y);
        ctx.fillText(formatCurrency(item.amount), cardX + 614, y);
      });
      
      // Totals section
      const totalsY = tableY + (invoiceData.lineItems.length * 25) + 40;
      ctx.font = '12px Arial';
      
      let currentY = totalsY;
      ctx.fillText(`Subtotal: ${formatCurrency(calculateSubtotal())}`, cardX + 464, currentY);
      currentY += 20;
      
      if (invoiceData.taxRate > 0) {
        ctx.fillText(`Tax (${invoiceData.taxRate}%): ${formatCurrency(calculateTax())}`, cardX + 464, currentY);
        currentY += 20;
      }
      
      if (invoiceData.discountAmount > 0) {
        ctx.fillText(`Discount: -${formatCurrency(invoiceData.discountAmount)}`, cardX + 464, currentY);
        currentY += 20;
      }
      
      // Total
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`Total: ${formatCurrency(calculateTotal())}`, cardX + 464, currentY + 20);
      
      // Notes
      if (invoiceData.notes) {
        ctx.font = 'bold 12px Arial';
        ctx.fillText('Notes:', cardX + 14, currentY + 60);
        ctx.font = '11px Arial';
        
        const noteLines = invoiceData.notes.split('\n');
        noteLines.forEach((line, index) => {
          ctx.fillText(line, cardX + 14, currentY + 85 + (index * 20));
        });
      }

      ctx.font = '11px Arial';
      ctx.fillStyle = '#555';
      ctx.fillText("Signature:", cardX + 24, canvas.height - 60);

      if (invoiceData.signatureImage) {
        const img = new window.Image();
        img.src = invoiceData.signatureImage;
        img.onload = () => ctx.drawImage(img, cardX + 84, canvas.height-80, 120, 36);
        // If signature image: append after download
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
            toast({ title: "Image Generated", description: `Invoice has been downloaded as ${format.toUpperCase()}.`, });
          }
        }, `image/${format}`);
      } else {
        ctx.strokeStyle = '#a3a3a3';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cardX + 84, canvas.height - 66);
        ctx.lineTo(cardX + 224, canvas.height - 66);
        ctx.stroke();
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
