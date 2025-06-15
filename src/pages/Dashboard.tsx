
import React, { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import NewDashboardSidebar from "@/components/NewDashboardSidebar";
import NewDashboardContent from "@/components/NewDashboardContent";
import DarkModeToggle from "@/components/DarkModeToggle";
import SupportBubble from "@/components/SupportBubble";
import HelpCenter from "@/components/HelpCenter";

const Dashboard: React.FC = () => {
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);

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
        
        {/* Support Bubble */}
        <SupportBubble onHelpClick={() => setIsHelpCenterOpen(true)} />
        
        {/* Help Center Modal */}
        <HelpCenter 
          isOpen={isHelpCenterOpen} 
          onClose={() => setIsHelpCenterOpen(false)} 
        />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
