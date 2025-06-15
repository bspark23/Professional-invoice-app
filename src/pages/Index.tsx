
import React from "react";
import { useNavigate } from "react-router-dom";
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { useClients } from "@/hooks/useClients";
import { useAuthLocal } from "@/hooks/useAuthLocal";
import { Plus, UserRound, FileText, DollarSign, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Simple logo placeholder (replace src if you have a custom logo file)
const LOGO_SRC = "/lovable-uploads/7ee69eb6-9c39-4842-a5be-8ca62c793130.png"; // update if you have a different logo

const StatCard = ({ icon, color, label, value, subtitle }: 
  { icon: React.ReactNode, color: string, label: string, value: string, subtitle?: string }
) => (
  <div className={`flex flex-col bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-5 min-w-[180px] border-l-8 ${color}`}>
    <div className="flex items-center gap-2 mb-3">{icon}<span className="text-lg font-bold">{label}</span></div>
    <div className="text-2xl font-bold mb-1">{value}</div>
    {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuthLocal();
  const profileId = user?.email || user?.profileName || "anon";
  const userId = user?.email || user?.profileName;

  const {
    savedInvoices,
    createNewInvoice,
    toggleInvoiceStatus,
    loadInvoice,
    deleteInvoice,
  } = useInvoiceData(profileId, userId);
  const { clients } = useClients(profileId, userId);

  // Gather dashboard stats
  const paidInvoices = savedInvoices.filter(inv => inv.status === "paid").length;
  const unpaidInvoices = savedInvoices.filter(inv => inv.status === "unpaid").length;
  const totalRevenue = savedInvoices
    .filter(inv => inv.status === "paid")
    .reduce((sum, inv) => {
      const subtotal = inv.lineItems?.reduce((itemSum, item) => itemSum + (item.quantity * item.rate), 0) || 0;
      const tax = subtotal * (inv.taxRate / 100);
      return sum + subtotal + tax;
    }, 0);
  const totalClients = clients.length;

  // Simple currency formatting
  const formatCurrency = (amount: number, currencyCode: string = "USD") =>
    `${currencyCode} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const businessName = savedInvoices[0]?.businessName || "Your Business";
  
  // Welcome section time
  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 py-8 px-2 md:px-6 animate-fade-in">
      {/* Hero / Welcome */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-2xl mb-10 px-6 py-8 flex flex-col md:flex-row items-center md:justify-between gap-8 text-white relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full -mt-20 -mr-20 blur-xl"></div>
        <div className="flex items-center gap-6 z-10">
          <img
            src={LOGO_SRC}
            alt="Logo"
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-white object-contain"
            style={{ background: "white" }}
          />
          <div>
            <div className="flex items-center gap-2 text-yellow-300 mb-1">
              <span className="font-semibold">{getGreeting()},</span>
              <span>{user?.profileName ? user.profileName : businessName}!</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-1">
              Welcome to <span className="text-yellow-200">{businessName}</span>
            </h1>
            <p className="text-white/90 font-medium max-w-[400px]">Create, manage, and track professional invoices easily.</p>
          </div>
        </div>
        <div className="flex flex-col items-center z-10">
          <Button 
            size="lg"
            onClick={createNewInvoice}
            className="flex gap-2 bg-white text-blue-700 hover:bg-blue-100/80 font-bold shadow-lg px-8 py-4 text-xl"
          >
            <Plus className="w-5 h-5" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          icon={<DollarSign className="text-green-500" />}
          color="border-green-500"
          label="Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle="Total paid invoices"
        />
        <StatCard
          icon={<FileText className="text-indigo-500" />}
          color="border-indigo-500"
          label="Invoices"
          value={savedInvoices.length.toString()}
          subtitle={`${paidInvoices} paid • ${unpaidInvoices} unpaid`}
        />
        <StatCard
          icon={<UserRound className="text-pink-500" />}
          color="border-pink-500"
          label="Clients"
          value={totalClients.toString()}
          subtitle="Active clients"
        />
        <StatCard
          icon={<CheckCircle className="text-emerald-400" />}
          color="border-emerald-400"
          label="Paid Rate"
          value={
            savedInvoices.length > 0
              ? `${((paidInvoices / savedInvoices.length) * 100).toFixed(0)}%`
              : "0%"
          }
          subtitle="Invoices paid"
        />
      </div>

      {/* Lists */}
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2 text-blue-900 dark:text-white">Clients</h2>
          <div className="rounded-xl bg-white dark:bg-gray-900 shadow-md p-6">
            {totalClients === 0 ? (
              <div className="opacity-70 text-center text-gray-600">No clients yet.</div>
            ) : (
              <ul className="flex flex-wrap gap-4">
                {clients.map((c) => (
                  <li key={c.id} className="px-3 py-2 bg-blue-50 dark:bg-gray-800 rounded border border-blue-200 dark:border-gray-800 text-blue-900 dark:text-gray-200">{c.name}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2 text-blue-900 dark:text-white">Invoices</h2>
          <div className="rounded-xl bg-white dark:bg-gray-900 shadow-md p-6">
            {savedInvoices.length === 0 ? (
              <div className="opacity-70 text-center text-gray-600">No invoices yet.</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-blue-200 dark:border-gray-700">
                    <th className="font-semibold">Number</th>
                    <th className="font-semibold">Client</th>
                    <th className="font-semibold">Amount</th>
                    <th className="font-semibold">Status</th>
                    <th className="font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {savedInvoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-blue-100 dark:border-gray-800">
                      <td className="py-2">{inv.invoiceNumber}</td>
                      <td>{inv.clientName}</td>
                      <td>{formatCurrency(
                        inv.lineItems?.reduce((sum, item) => sum + (item.quantity * item.rate), 0) || 0,
                        inv.currency || "USD"
                      )}</td>
                      <td>
                        <span className={`px-2 py-1 rounded text-xs font-bold 
                          ${inv.status === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-orange-100 text-orange-700"}`}>
                          {inv.status === "paid" ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => loadInvoice(inv)}
                          >
                            View
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => toggleInvoiceStatus(inv.id)}
                          >
                            {inv.status === "paid" ? "Mark Unpaid" : "Mark Paid"}
                          </Button>
                          <Button 
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteInvoice(inv.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
