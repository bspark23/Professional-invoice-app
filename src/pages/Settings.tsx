
import React, { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Bot, User, Bell, Shield } from "lucide-react";
import NewDashboardSidebar from "@/components/NewDashboardSidebar";
import DarkModeToggle from "@/components/DarkModeToggle";
import ResponsiveNavButtons from "@/components/ResponsiveNavButtons";
import SupportBubble from "@/components/SupportBubble";
import HelpCenter from "@/components/HelpCenter";
import ApiKeySettings from "@/components/ApiKeySettings";

const Settings = () => {
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <NewDashboardSidebar />
        <div className="flex-1 w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border-b bg-white gap-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <SettingsIcon className="w-6 h-6" />
                Settings
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ResponsiveNavButtons 
                onHelpClick={() => setIsHelpCenterOpen(true)}
                onChatClick={() => setIsHelpCenterOpen(true)}
              />
              <DarkModeToggle />
            </div>
          </div>

          {/* Main content */}
          <div className="p-4 sm:p-6">
            <Tabs defaultValue="ai" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="ai" className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  AI Assistant
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Security
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ai">
                <ApiKeySettings />
              </TabsContent>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Profile settings will be available soon.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Notification settings will be available soon.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Security settings will be available soon.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <SupportBubble onHelpClick={() => setIsHelpCenterOpen(true)} />
        
        <HelpCenter 
          isOpen={isHelpCenterOpen} 
          onClose={() => setIsHelpCenterOpen(false)} 
        />
      </div>
    </SidebarProvider>
  );
};

export default Settings;
