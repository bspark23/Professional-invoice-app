
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

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalAmount),
      change: "+12.5%",
      changeType: "positive" as const,
      icon: <DollarSign className="w-5 h-5" />,
      bgColor: "bg-gradient-to-r from-green-500 to-emerald-600"
    },
    {
      title: "Total Invoices",
      value: totalInvoices.toString(),
      change: "+3 this month",
      changeType: "positive" as const,
      icon: <FileText className="w-5 h-5" />,
      bgColor: "bg-gradient-to-r from-blue-500 to-blue-600"
    },
    {
      title: "Paid Invoices",
      value: paidInvoices.toString(),
      change: `${Math.round((paidInvoices / Math.max(totalInvoices, 1)) * 100)}% rate`,
      changeType: "neutral" as const,
      icon: <CheckCircle className="w-5 h-5" />,
      bgColor: "bg-gradient-to-r from-purple-500 to-purple-600"
    },
    {
      title: "Pending",
      value: pendingInvoices.toString(),
      change: "Needs attention",
      changeType: pendingInvoices > 0 ? "negative" : "positive" as const,
      icon: <Clock className="w-5 h-5" />,
      bgColor: "bg-gradient-to-r from-orange-500 to-orange-600"
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
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {stat.title}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
