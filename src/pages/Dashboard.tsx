
import React from "react";
import NewDashboardSidebar from "@/components/NewDashboardSidebar";
import NewDashboardContent from "@/components/NewDashboardContent";

const Dashboard: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <NewDashboardSidebar />
      <NewDashboardContent />
    </div>
  );
};

export default Dashboard;
