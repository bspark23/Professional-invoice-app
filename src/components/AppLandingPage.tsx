
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Users, BarChart3, Shield } from "lucide-react";

interface AppLandingPageProps {
  onGetStarted: () => void;
}

const AppLandingPage = ({ onGetStarted }: AppLandingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Invoicer <span className="text-blue-600">Pro</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Create professional invoices in minutes. Manage clients, track payments, and grow your business with our powerful invoicing solution.
          </p>
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Professional Invoices</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Create stunning, professional invoices with customizable templates
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Client Management</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Save and manage client profiles for quick invoice creation
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Track your business performance with detailed analytics
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Shield className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Your data is stored securely with optional password protection
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Why Choose Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose Invoicer Pro?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create and send invoices in under 2 minutes
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-semibold mb-2">Professional</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Impress clients with beautiful, professional invoices
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Works Everywhere</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Access your invoices from any device, anywhere
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLandingPage;
