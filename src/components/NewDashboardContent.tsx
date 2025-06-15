
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, DollarSign, FileText, Users, Clock } from "lucide-react";
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { useAuthLocal } from "@/hooks/useAuthLocal";
import { formatCurrency, calculateTotal } from "@/utils/invoiceUtils";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { useInvoiceActivity } from "@/hooks/useInvoiceActivity";

const NewDashboardContent: React.FC = () => {
  const { user } = useAuthLocal();
  const { savedInvoices } = useInvoiceData(null, user?.email || user?.profileName);
  const { events } = useInvoiceActivity();

  // Calculate dynamic stats
  const totalInvoiced = savedInvoices.reduce((sum, invoice) => {
    return sum + calculateTotal(invoice);
  }, 0);

  const totalPayments = savedInvoices
    .filter(invoice => invoice.status === "paid")
    .reduce((sum, invoice) => sum + calculateTotal(invoice), 0);

  // For now, expenses will be 0 (can be extended later with expense tracking)
  const totalExpenses = 0;
  const profit = totalPayments - totalExpenses;

  const paidInvoices = savedInvoices.filter(invoice => invoice.status === "paid").length;
  const unpaidInvoices = savedInvoices.filter(invoice => invoice.status === "unpaid").length;

  // Top paying clients calculation
  const clientPayments = savedInvoices
    .filter(invoice => invoice.status === "paid")
    .reduce((acc, invoice) => {
      const client = invoice.clientName;
      acc[client] = (acc[client] || 0) + calculateTotal(invoice);
      return acc;
    }, {} as Record<string, number>);

  const topPayingClients = Object.entries(clientPayments)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, amount]) => ({ name, amount }));

  // Top selling products/services
  const productCounts = savedInvoices.reduce((acc, invoice) => {
    invoice.lineItems.forEach(item => {
      if (item.description) {
        acc[item.description] = (acc[item.description] || 0) + item.quantity;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  const topProducts = Object.entries(productCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const stats = [
    {
      title: "Invoiced",
      value: formatCurrency(totalInvoiced),
      change: `${savedInvoices.length} invoices total`,
      icon: DollarSign,
      trend: "up"
    },
    {
      title: "Payments",
      value: formatCurrency(totalPayments),
      change: `${paidInvoices} invoices paid`,
      icon: FileText,
      trend: "up"
    },
    {
      title: "Expenses",
      value: formatCurrency(totalExpenses),
      change: "Manual tracking",
      icon: Clock,
      trend: "neutral"
    },
    {
      title: "Profit",
      value: formatCurrency(profit),
      change: profit >= 0 ? "Positive" : "Negative",
      icon: TrendingUp,
      trend: profit >= 0 ? "up" : "down"
    }
  ];

  const quickActions = [
    { title: "Create Invoice", description: "Generate a new invoice", color: "bg-blue-500" },
    { title: "Add Client", description: "Add a new client", color: "bg-green-500" },
    { title: "View Reports", description: "Check analytics", color: "bg-purple-500" },
    { title: "Send Reminder", description: "Follow up payments", color: "bg-orange-500" },
  ];

  return (
    <div className="p-6 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your business today.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${
                  stat.trend === 'up' ? 'bg-green-100' : 
                  stat.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  <stat.icon className={`w-6 h-6 ${
                    stat.trend === 'up' ? 'text-green-600' : 
                    stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`} />
                </div>
              </div>
              <div className="flex items-center mt-2">
                {stat.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500 mr-1" />}
                {stat.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500 mr-1" />}
                <span className={`text-xs ${
                  stat.trend === 'up' ? 'text-green-600' : 
                  stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Dashboard with Charts */}
      <AnalyticsDashboard savedInvoices={savedInvoices} formatCurrency={formatCurrency} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Quick Actions */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{action.title}</p>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Paying Clients */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Top Paying Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPayingClients.length > 0 ? topPayingClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-500">Client</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(client.amount)}</p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-4">No paid invoices yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Products/Services */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Top Products/Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.length > 0 ? topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">Product/Service</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{product.count} sold</p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-4">No products/services tracked yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.length > 0 ? events.slice(0, 10).map((event, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border-b border-gray-100 last:border-b-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  event.type === 'created' ? 'bg-blue-100' :
                  event.type === 'edited' ? 'bg-yellow-100' :
                  'bg-green-100'
                }`}>
                  <FileText className={`w-4 h-4 ${
                    event.type === 'created' ? 'text-blue-600' :
                    event.type === 'edited' ? 'text-yellow-600' :
                    'text-green-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleDateString()} at {new Date(event.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewDashboardContent;
