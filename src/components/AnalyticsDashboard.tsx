
import { useMemo } from "react";
import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartBar, ChartPie } from "lucide-react";
import { InvoiceData } from "@/types/invoice";
import { format } from "date-fns";

interface AnalyticsDashboardProps {
  savedInvoices: InvoiceData[];
  formatCurrency: (amount: number, currencyCode?: string) => string;
}

const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#a78bfa", "#f59e42", "#14b8a6"];

function getMonthYear(dateString: string) {
  const date = new Date(dateString);
  return format(date, "MMM yyyy");
}

const AnalyticsDashboard = ({ savedInvoices, formatCurrency }: AnalyticsDashboardProps) => {
  // Group invoices by month for count and revenue
  const monthMap: { [month: string]: { count: number; revenue: number } } = {};
  let paid = 0, unpaid = 0, pending = 0;

  savedInvoices.forEach(inv => {
    const month = getMonthYear(inv.invoiceDate);
    if (!monthMap[month]) monthMap[month] = { count: 0, revenue: 0 };
    monthMap[month].count += 1;
    // revenue is subtotal + tax - discount
    const subtotal = inv.lineItems?.reduce((sum, item) => sum + (item.quantity * item.rate), 0) || 0;
    const tax = subtotal * (inv.taxRate / 100);
    let total = subtotal + tax;
    if (inv.discountAmount) total -= inv.discountAmount;
    monthMap[month].revenue += total;

    // payment status breakdown
    if (inv.status === "paid") paid++;
    else if (inv.status === "pending") pending++;
    else unpaid++;
  });

  // Bar chart data: invoices per month
  const invoicesPerMonth = useMemo(() =>
    Object.entries(monthMap).map(([month, val]) => ({
      month,
      count: val.count,
    })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
  , [savedInvoices]);

  // Bar chart data: revenue per month
  const revenuePerMonth = useMemo(() =>
    Object.entries(monthMap).map(([month, val]) => ({
      month,
      revenue: val.revenue,
    })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
  , [savedInvoices]);

  // Pie chart data: payment status
  const paymentStatusData = [
    { name: "Paid", value: paid },
    { name: "Unpaid", value: unpaid },
    { name: "Pending", value: pending },
  ].filter(d => d.value > 0);

  return (
    <div className="mb-10">
      <Card className="mb-6 shadow border-0 bg-white/80 dark:bg-gray-800/80">
        <CardHeader className="pb-3 flex flex-row items-center gap-3">
          <ChartBar className="w-5 h-5 text-blue-500" />
          <CardTitle>Invoice Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Invoices per month */}
            <div>
              <h3 className="font-semibold mb-1 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <ChartBar className="w-4 h-4" /> Invoices Per Month
              </h3>
              {invoicesPerMonth.length === 0 ? (
                <div className="text-muted-foreground py-8">No data yet</div>
              ) : (
                <ChartContainer
                  config={{
                    invoices: {
                      label: "Invoices",
                      color: "#2563eb"
                    }
                  }}
                >
                  <BarChart data={invoicesPerMonth} height={180}>
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Bar dataKey="count" fill="#2563eb" name="Invoices" />
                    <ChartTooltipContent />
                  </BarChart>
                </ChartContainer>
              )}
            </div>
            {/* Revenue per month */}
            <div>
              <h3 className="font-semibold mb-1 flex items-center gap-2 text-green-700 dark:text-green-300">
                <ChartBar className="w-4 h-4" /> Revenue Per Month
              </h3>
              {revenuePerMonth.length === 0 ? (
                <div className="text-muted-foreground py-8">No data yet</div>
              ) : (
                <ChartContainer
                  config={{
                    revenue: {
                      label: "Revenue",
                      color: "#16a34a"
                    }
                  }}
                >
                  <BarChart data={revenuePerMonth} height={180}>
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false}
                      tickFormatter={v => formatCurrency(v)} />
                    <Bar dataKey="revenue" fill="#16a34a" name="Revenue"
                      label={{ position: "top", fill: "#16a34a", fontSize: 12 }}
                    />
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </div>
          </div>
          {/* Payment status breakdown */}
          <div className="pt-8">
            <h3 className="font-semibold mb-1 flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <ChartPie className="w-4 h-4" /> Payment Status Breakdown
            </h3>
            {paymentStatusData.length === 0 ? (
              <div className="text-muted-foreground py-8">No data yet</div>
            ) : (
              <ChartContainer
                config={{
                  paid: { label: "Paid", color: "#22c55e" },
                  unpaid: { label: "Unpaid", color: "#ef4444" },
                  pending: { label: "Pending", color: "#f59e42" }
                }}
              >
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie
                      data={paymentStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ""}
                    >
                      {paymentStatusData.map((entry, idx) => (
                        <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartLegendContent
                      payload={paymentStatusData.map((entry, idx) => ({
                        value: entry.name,
                        color: COLORS[idx % COLORS.length],
                        type: "square",
                      }))}
                      verticalAlign="bottom"
                    />
                    <ChartTooltipContent />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
