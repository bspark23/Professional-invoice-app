
import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { exportInvoicePDFBase64 } from "@/utils/exportUtils";
import emailjs from "emailjs-com";
import { BusinessProfile } from "@/hooks/useProfiles";
import { InvoiceData } from "@/types/invoice";

interface SendInvoiceDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  invoiceData: InvoiceData;
  userProfile?: BusinessProfile | null;
  getFormatCurrency: (amount: number, currencyCode?: string) => string;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
}

const EMAILJS_SERVICE_ID = "YOUR_EMAILJS_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_EMAILJS_TEMPLATE_ID";
const EMAILJS_USER_ID = "YOUR_EMAILJS_USER_ID_OR_PUBLIC_KEY";

const SendInvoiceDialog: React.FC<SendInvoiceDialogProps> = ({
  open, setOpen, invoiceData, userProfile, getFormatCurrency, getSubtotal, getTax, getTotal
}) => {
  const { toast } = useToast();

  const [to, setTo] = useState(invoiceData.clientEmail || "");
  const [subject, setSubject] = useState(`Invoice #${invoiceData.invoiceNumber} from ${invoiceData.businessName}`);
  const [message, setMessage] = useState(
    `Dear ${invoiceData.clientName || "Client"},\n\nPlease find the attached invoice for your reference.\n\nThank you,\n${invoiceData.businessName}`
  );
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      // 1. Export invoice as PDF Base64
      const pdfBase64 = await exportInvoicePDFBase64(
        invoiceData,
        getFormatCurrency,
        getSubtotal,
        getTax,
        getTotal
      );
      // 2. Prepare EmailJS template params
      const templateParams: Record<string, any> = {
        to_email: to,
        from_email: userProfile?.email || invoiceData.businessEmail || "no-reply@invoiceease.app",
        subject,
        message,
        invoice_pdf: pdfBase64, // Attach as base64
        business_name: invoiceData.businessName,
        client_name: invoiceData.clientName,
      };
      // 3. Send email using emailjs
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_USER_ID
      );
      toast({ title: "Invoice Sent", description: `Invoice sent to ${to}`, variant: "default" });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Send Failed",
        description: error?.message || "Failed to send invoice email.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Invoice via Email</DialogTitle>
          <DialogDescription>
            Enter recipient's email, edit subject/message, and send the PDF attached.  
            <br />
            <span className="text-xs text-muted-foreground">
              Attachments will be included as PDF via EmailJS.  
              (EmailJS credentials must be configured.)
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1 font-semibold">To (Recipient Email)</label>
            <Input value={to} onChange={e => setTo(e.target.value)} type="email" required />
          </div>
          <div>
            <label className="block text-sm mb-1 font-semibold">Subject</label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1 font-semibold">Message</label>
            <Textarea rows={4} value={message} onChange={e => setMessage(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>Cancel</Button>
          <Button onClick={handleSend} disabled={sending || !to}>{sending ? "Sending..." : "Send Invoice"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendInvoiceDialog;
