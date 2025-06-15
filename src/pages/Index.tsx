import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SectionCard from "@/components/SectionCard";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CurrencySelector from "@/components/CurrencySelector";
import DarkModeToggle from "@/components/DarkModeToggle";
import { Badge } from "@/components/ui/badge";
import { FileText, Printer, Tag } from "lucide-react";
import PrintPreviewModal from "@/components/PrintPreviewModal";
import { currencies } from "@/types/invoice";
import BusinessBrandingCard, { Branding } from "@/components/BusinessBrandingCard";
import { useNavigate } from "react-router-dom";

const Index: React.FC = () => {
  // Branding
  const [branding, setBranding] = useState<Branding>(() => {
    try {
      const b = localStorage.getItem("invoiceease-branding");
      return b ? JSON.parse(b) : { name: "", phone: "", email: "", address: "", logo: "" };
    } catch {
      return { name: "", phone: "", email: "", address: "", logo: "" };
    }
  });

  // Currency handling
  const defaultCurrency = localStorage.getItem("invoicer-pro-currency") || "USD";
  const [currency, setCurrency] = useState<string>(defaultCurrency);
  // Status
  const [status, setStatus] = useState<"paid" | "unpaid">("unpaid");
  // Print preview modal
  const [previewOpen, setPreviewOpen] = useState(false);

  // Invoice logic
  const {
    subtotal,
    tax,
    form,
    setField,
    addItem,
    updateItem,
    removeItem,
    total
  } = useInvoiceForm();

  const navigate = useNavigate();

  useEffect(() => {
    // PIN checking removed
    // if (!localStorage.getItem("invoicer-pro-pin")) setUnlocked(false);
  }, []);

  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency
      }).format(amount);
    } catch {
      const selected = currencies.find(c => c.code === currency);
      return (selected?.symbol || "$") + amount.toFixed(2);
    }
  };

  const handlePreview = () => {
    // Pass form and calculations via router state
    navigate("/dashboard/print-preview", {
      state: {
        form,
        subtotal,
        tax,
        total,
        formatCurrency: (amount: number) => formatCurrency(amount)
      }
    });
  };

  // New: Main dashboard color scheme (use landing page blue)
  const dashboardAccent = "bg-gradient-to-br from-blue-500 to-blue-700 text-white";

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 lg:flex-row animate-fade-in">

        {/* Left column: Main content */}
        <section className="flex-1 flex flex-col gap-6">
          {/* Business Branding */}
          <BusinessBrandingCard onBrandingChange={setBranding} />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className={`rounded-2xl shadow p-5 flex flex-col justify-between min-h-[120px] ${dashboardAccent}`}>
              <span className="font-semibold text-lg">Total Invoiced</span>
              <span className="text-2xl font-bold mt-1">{formatCurrency(total)}</span>
              <span className="text-sm mt-2 opacity-75">Across all clients</span>
            </div>
            <div className="rounded-2xl shadow p-5 flex flex-col justify-between min-h-[120px] bg-white dark:bg-gray-900">
              <span className="font-semibold text-lg text-blue-800 dark:text-blue-200">Pending</span>
              <span className="text-2xl font-bold mt-1 text-blue-700 dark:text-blue-300">
                {status === "unpaid" ? formatCurrency(total) : formatCurrency(0)}
              </span>
              <span className="text-sm mt-2 opacity-60">As of now</span>
            </div>
            <div className="rounded-2xl shadow p-5 flex flex-col justify-between min-h-[120px] bg-white dark:bg-gray-900">
              <span className="font-semibold text-lg text-blue-800 dark:text-blue-200">Paid</span>
              <span className="text-2xl font-bold mt-1 text-green-700 dark:text-green-400">
                {status === "paid" ? formatCurrency(total) : formatCurrency(0)}
              </span>
              <span className="text-sm mt-2 opacity-60">This Month</span>
            </div>
          </div>

          {/* Actions / Invoice Status Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <Badge
                variant={status === "paid" ? "default" : "destructive"}
                className={`text-base px-4 rounded-xl font-semibold ${
                  status === "paid" ? "bg-blue-600 text-white" : "bg-red-500"
                }`}
              >
                {status === "paid" ? "✅ Paid" : "❌ Unpaid"}
              </Badge>
              <Button
                variant={status === "paid" ? "secondary" : "default"}
                onClick={() => setStatus(status === "paid" ? "unpaid" : "paid")}
                size="sm"
              >
                Mark as {status === "paid" ? "Unpaid" : "Paid"}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePreview}><Printer size={18}/>Preview</Button>
              <Button variant="outline" onClick={() => window.print()}><FileText size={18}/>Print</Button>
            </div>
          </div>

          {/* Invoice Form Cards - visually separated */}
          <SectionCard title="Client Details" className="shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                className="font-inter"
                placeholder="Client Name"
                value={form.clientName}
                onChange={e => setField("clientName", e.target.value)}
                required
              />
              <Input
                className="font-inter"
                placeholder="Client Email"
                value={form.clientEmail}
                type="email"
                onChange={e => setField("clientEmail", e.target.value)}
                required
              />
              <Input
                className="font-inter"
                placeholder="Client Address"
                value={form.clientAddress}
                onChange={e => setField("clientAddress", e.target.value)}
                required
              />
            </div>
          </SectionCard>

          <SectionCard title="Invoice Info" className="shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                className="font-inter"
                placeholder="Invoice Number"
                value={form.invoiceNumber}
                onChange={e => setField("invoiceNumber", e.target.value)}
                readOnly
              />
              <Input
                className="font-inter"
                type="date"
                placeholder="Invoice Date"
                value={form.invoiceDate}
                onChange={e => setField("invoiceDate", e.target.value)}
              />
              <Input
                className="font-inter"
                type="date"
                placeholder="Due Date"
                value={form.dueDate}
                onChange={e => setField("dueDate", e.target.value)}
              />
            </div>
          </SectionCard>

          <SectionCard title="Services / Items" className="shadow">
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-12 gap-2 font-semibold mb-2 text-gray-600">
                <div className="col-span-4">Description</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-3">Rate</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-1"></div>
              </div>
              {form.items.map((item, idx) => (
                <div className="grid grid-cols-12 gap-2 items-center" key={item.id}>
                  <div className="col-span-4">
                    <Input
                      className="font-inter"
                      placeholder="Description"
                      value={item.description}
                      onChange={e => updateItem(item.id, { description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      className="font-inter"
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={e => updateItem(item.id, { quantity: +e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      className="font-inter"
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="Rate"
                      value={item.rate}
                      onChange={e => updateItem(item.id, { rate: +e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-span-2 font-semibold text-gray-800">
                    {formatCurrency(item.amount)}
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                      disabled={form.items.length === 1}
                      size="icon"
                      className="text-red-500"
                      aria-label="Remove item"
                    >✕</Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                className="mt-3 w-fit"
                variant="secondary"
                onClick={addItem}
              >+ Add Service / Item</Button>
            </div>
          </SectionCard>

          <SectionCard title="Summary" className="shadow">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-gray-600 text-sm mb-1 block font-inter">Tax (%)</label>
                <Input
                  className="font-inter"
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.taxRate}
                  onChange={e => setField("taxRate", +e.target.value)}
                />
              </div>
              <div>
                <label className="text-gray-600 text-sm mb-1 block font-inter">Discount</label>
                <Input
                  className="font-inter"
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.discount}
                  onChange={e => setField("discount", +e.target.value)}
                />
              </div>
              <div className="font-inter mt-2 sm:mt-0">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="font-semibold">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="font-semibold">-{formatCurrency(form.discount)}</span>
                </div>
                <div className="flex justify-between text-lg mt-2">
                  <span>Total</span>
                  <span className="font-bold text-blue-900 dark:text-blue-300">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Notes / Terms" className="shadow">
            <Textarea
              className="font-inter"
              rows={3}
              placeholder="Payment in 7 days. Thank you!"
              value={form.notes || ""}
              onChange={e => setField("notes" as any, e.target.value)}
            />
          </SectionCard>

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 mt-8 mb-2 font-inter">
            Invoicer Pro &copy; {new Date().getFullYear()}
          </div>
        </section>

        {/* Right column: Preview panel - coming soon */}
        <aside className="lg:w-[380px] w-full lg:ml-6 mt-0 lg:mt-0">
          <div className="rounded-2xl shadow p-6 bg-white dark:bg-gray-900 sticky top-10">
            <span className="block text-xl font-semibold text-blue-900 mb-2">Invoice Preview</span>
            <div className="border border-blue-300 rounded-md p-4 bg-blue-50 dark:bg-blue-900 mb-3 flex flex-col items-center">
              <span className="font-semibold text-blue-700 mb-1">{branding.name || "Your Business"}</span>
              {branding.logo && (
                <img src={branding.logo} className="h-16 w-16 rounded-full mb-2 object-cover bg-white" alt="Logo" />
              )}
              <span className="text-xs text-blue-600">{branding.email}</span>
              <span className="text-xs text-blue-600">{branding.phone}</span>
              <span className="text-xs text-blue-600">{branding.address}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Client:</span>
                <span>{form.clientName || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Due:</span>
                <span>{form.dueDate || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Status:</span>
                <span>
                  {status === "paid" ? (
                    <span className="text-green-600 font-bold">Paid</span>
                  ) : (
                    <span className="text-red-500 font-semibold">Unpaid</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
};

export default Index;
