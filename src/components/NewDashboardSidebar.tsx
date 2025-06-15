
import React from "react";
import { Home, FileText, Users, CreditCard, BarChart3, Settings, HelpCircle, LogOut } from "lucide-react";

const NewDashboardSidebar: React.FC = () => {
  const menuItems = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: FileText, label: "Invoices", active: false },
    { icon: Users, label: "Clients", active: false },
    { icon: CreditCard, label: "Payments", active: false },
    { icon: BarChart3, label: "Reports", active: false },
    { icon: Settings, label: "Settings", active: false },
    { icon: HelpCircle, label: "Help", active: false },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">InvoiceApp</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <a
                href="#"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  item.active
                    ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">JD</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">John Doe</p>
            <p className="text-xs text-gray-500">john@example.com</p>
          </div>
          <LogOut className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default NewDashboardSidebar;
