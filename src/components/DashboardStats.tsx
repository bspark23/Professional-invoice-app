
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, FileText, Clock, Users, CheckCircle } from "lucide-react";

interface DashboardStatsProps {
  savedInvoices: any[];
  formatCurrency: (amount: number) => string;
}

const DashboardStats = ({ savedInvoices, formatCurrency }: DashboardStatsProps) => {
  const totalInvoices = savedInvoices.length;
  const paidInvoices = savedInvoices.filter(inv => inv.status === 'paid').length;
  const pendingInvoices = savedInvoices.filter(inv => inv.status === 'pending').length;
  const totalAmount = savedInvoices.reduce((sum, inv) => {
    const subtotal = inv.lineItems?.reduce((itemSum: number, item: any) => 
      itemSum + (item.quantity * item.rate), 0) || 0;
    const tax = subtotal * (inv.taxRate / 100);
    return sum + subtotal + tax;
  }, 0);

  // Get current year and month for context
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long' });
  const currentTime = currentDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalAmount),
      change: `${currentMonth} ${currentYear}`,
      changeType: "positive" as const,
      icon: <DollarSign className="w-5 h-5" />,
      bgColor: "bg-gradient-to-r from-green-500 to-emerald-600",
      subtitle: `Last updated: ${currentTime}`
    },
    {
      title: "Total Invoices",
      value: totalInvoices.toString(),
      change: `${currentMonth} ${currentYear}`,
      changeType: "positive" as const,
      icon: <FileText className="w-5 h-5" />,
      bgColor: "bg-gradient-to-r from-blue-500 to-blue-600",
      subtitle: `As of ${currentTime}`
    },
    {
      title: "Paid Invoices",
      value: paidInvoices.toString(),
      change: `${Math.round((paidInvoices / Math.max(totalInvoices, 1)) * 100)}% rate`,
      changeType: "neutral" as const,
      icon: <CheckCircle className="w-5 h-5" />,
      bgColor: "bg-gradient-to-r from-purple-500 to-purple-600",
      subtitle: `Success rate this ${currentMonth.toLowerCase()}`
    },
    {
      title: "Pending",
      value: pendingInvoices.toString(),
      change: pendingInvoices > 0 ? "Needs attention" : "All clear",
      changeType: pendingInvoices > 0 ? "negative" : "positive" as const,
      icon: <Clock className="w-5 h-5" />,
      bgColor: "bg-gradient-to-r from-orange-500 to-orange-600",
      subtitle: `Updated ${currentTime}`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105 border-0 shadow-md bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor} text-white shadow-lg`}>
                {stat.icon}
              </div>
              <Badge 
                variant={stat.changeType === 'positive' ? 'default' : stat.changeType === 'negative' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {stat.change}
              </Badge>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                {stat.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stat.subtitle}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
