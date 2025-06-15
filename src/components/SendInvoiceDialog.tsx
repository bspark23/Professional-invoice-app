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
import EmailJsSettingsDialog, { getEmailJsConfig } from "./EmailJsSettingsDialog";
import { Settings } from "lucide-react";

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

  // Settings dialog state
  const [showSettings, setShowSettings] = useState(false);

  const handleSend = async () => {
    const config = getEmailJsConfig();
    if (!config?.serviceId || !config?.templateId || !config?.userId) {
      toast({ title: "EmailJS credentials missing", description: "Please enter your EmailJS keys.", variant: "destructive" });
      setShowSettings(true);
      return;
    }
    setSending(true);
    try {
      const pdfBase64 = await exportInvoicePDFBase64(
        invoiceData,
        getFormatCurrency,
        getSubtotal,
        getTax,
        getTotal
      );
      const templateParams: Record<string, any> = {
        to_email: to,
        from_email: userProfile?.email || invoiceData.businessEmail || "no-reply@invoiceease.app",
        subject,
        message,
        invoice_pdf: pdfBase64,
        business_name: invoiceData.businessName,
        client_name: invoiceData.clientName,
      };
      await emailjs.send(
        config.serviceId,
        config.templateId,
        templateParams,
        config.userId
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
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Invoice via Email</DialogTitle>
            <DialogDescription>
              Enter recipient's email, edit subject/message, and send the PDF attached.<br />
              <span className="text-xs text-muted-foreground">
                Attachments will be included as PDF via EmailJS.<br />
                <b>Your credentials are securely stored in your browser.</b>
                <br />
                <button
                  className="inline-flex items-center gap-1 text-blue-600 underline text-xs mt-1"
                  type="button"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="w-3 h-3" /> EmailJS Settings
                </button>
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
            <Button onClick={handleSend} disabled={sending || !to}>
              {sending ? "Sending..." : "Send Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <EmailJsSettingsDialog open={showSettings} setOpen={setShowSettings} />
    </>
  );
};

export default SendInvoiceDialog;
