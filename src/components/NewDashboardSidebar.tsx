
import React from "react";
import { Home, FileText, Users, CreditCard, BarChart3, Settings, HelpCircle, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthLocal } from "@/hooks/useAuthLocal";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const NewDashboardSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthLocal();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: FileText, label: "Invoices", path: "/invoices" },
    { icon: FileText, label: "Estimates", path: "/estimates" },
    { icon: Users, label: "Clients", path: "/clients" },
    { icon: CreditCard, label: "Payments", path: "/payments" },
    { icon: BarChart3, label: "Expenses", path: "/expenses" },
    { icon: Users, label: "Projects", path: "/projects" },
    { icon: BarChart3, label: "Time Tracking", path: "/time-tracking" },
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: HelpCircle, label: "Help", path: "/help" },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const getUserInitials = () => {
    if (!user?.profileName) return "U";
    return user.profileName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">InvoiceApp</h1>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton
                      onClick={() => handleMenuClick(item.path)}
                      isActive={isActive}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                        isActive
                          ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer group">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {getUserInitials()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.profileName || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || "user@example.com"}
            </p>
          </div>
          <LogOut 
            className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" 
            onClick={handleSignOut}
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default NewDashboardSidebar;
