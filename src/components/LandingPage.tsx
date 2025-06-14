
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Zap, 
  Globe, 
  Shield, 
  DollarSign, 
  Clock, 
  Check,
  Star,
  Users,
  TrendingUp
} from "lucide-react";

interface LandingPageProps {
  businessName: string;
  businessLogo?: string;
  invoiceNumber: string;
  clientName: string;
  total: string;
  status: 'paid' | 'unpaid';
  currency: string;
}

const LandingPage = ({ 
  businessName, 
  businessLogo, 
  invoiceNumber, 
  clientName, 
  total, 
  status,
  currency 
}: LandingPageProps) => {
  const features = [
    {
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      title: "Lightning Fast",
      description: "Create professional invoices in seconds with our intuitive interface"
    },
    {
      icon: <Globe className="w-6 h-6 text-blue-600" />,
      title: "Multi-Currency",
      description: "Support for multiple currencies including USD, EUR, GBP, NGN, and more"
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      title: "Secure & Reliable",
      description: "Your data is stored locally and securely with automatic backups"
    },
    {
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      title: "Professional Templates",
      description: "Beautiful, customizable invoice templates that impress clients"
    },
    {
      icon: <DollarSign className="w-6 h-6 text-blue-600" />,
      title: "Free to Use",
      description: "No subscription fees, no hidden costs. Completely free forever"
    },
    {
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      title: "Save Time",
      description: "Automated calculations, tax handling, and invoice numbering"
    }
  ];

  const stats = [
    { label: "Invoices Created", value: "10,000+", icon: <FileText className="w-5 h-5" /> },
    { label: "Happy Users", value: "2,500+", icon: <Users className="w-5 h-5" /> },
    { label: "Money Processed", value: "$50M+", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Countries Served", value: "50+", icon: <Globe className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-blue-600 p-4 rounded-full shadow-lg">
                <FileText className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Professional Invoicing
              <span className="block text-blue-600 dark:text-blue-400">Made Simple</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Create, customize, and send professional invoices in minutes. 
              Free forever with no hidden fees or limitations.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Star className="w-4 h-4 mr-2" />
                No Sign-up Required
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Shield className="w-4 h-4 mr-2" />
                100% Free
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Zap className="w-4 h-4 mr-2" />
                Instant Setup
              </Badge>
            </div>
          </div>

          {/* Invoice Preview Card */}
          <div className="max-w-4xl mx-auto mb-16">
            <Card className="shadow-2xl border-0 bg-white dark:bg-gray-800">
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    {businessLogo && (
                      <img 
                        src={businessLogo} 
                        alt="Company Logo" 
                        className="w-16 h-16 object-contain"
                      />
                    )}
                    <div>
                      <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {businessName}
                      </h2>
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">INVOICE</h3>
                    <p className="text-gray-600 dark:text-gray-300">#{invoiceNumber}</p>
                    <Badge variant={status === 'paid' ? 'default' : 'destructive'} className="mt-2">
                      {status === 'paid' ? '✅ Paid' : '❌ Unpaid'}
                    </Badge>
                  </div>
                </div>

                <Separator className="mb-8" />

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Bill To:</h4>
                    <p className="font-medium text-gray-900 dark:text-white">{clientName}</p>
                    <p className="text-gray-600 dark:text-gray-300">client@example.com</p>
                  </div>
                  <div className="text-right">
                    <div className="space-y-1 text-gray-600 dark:text-gray-300">
                      <p><span className="font-medium">Invoice Date:</span> {new Date().toLocaleDateString()}</p>
                      <p><span className="font-medium">Currency:</span> {currency}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg text-gray-700 dark:text-gray-300">Sample Service</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{total}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-2xl font-bold">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-blue-600 dark:text-blue-400">{total}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful features designed to make invoicing effortless and professional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {feature.icon}
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Why Choose Our Platform?
              </h2>
              <div className="space-y-4">
                {[
                  "No monthly subscriptions or hidden fees",
                  "Professional templates that impress clients",
                  "Multi-currency support for global business",
                  "Automatic calculations and tax handling",
                  "Instant PDF and image export options",
                  "Local data storage for maximum privacy"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="text-center">
                  <div className="text-6xl font-bold mb-4">100%</div>
                  <div className="text-xl mb-6">Free Forever</div>
                  <div className="space-y-2 text-sm opacity-90">
                    <p>✓ Unlimited invoices</p>
                    <p>✓ All features included</p>
                    <p>✓ No credit card required</p>
                    <p>✓ No account needed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
