
import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import NewDashboardSidebar from "@/components/NewDashboardSidebar";
import NewDashboardContent from "@/components/NewDashboardContent";
import DarkModeToggle from "@/components/DarkModeToggle";

const Dashboard: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <NewDashboardSidebar />
        <div className="flex-1">
          <div className="flex justify-between items-center p-4 border-b bg-white">
            <SidebarTrigger />
            <DarkModeToggle />
          </div>
          <NewDashboardContent />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
