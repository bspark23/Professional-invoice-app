
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/signin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tl from-blue-200 via-white to-purple-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90">
        <CardHeader>
          <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <User className="w-6 h-6" /> Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-lg">
            <div><span className="font-semibold">Profile Name:</span> {user?.profileName || "(not set)"}</div>
            <div><span className="font-semibold">Email:</span> {user?.email || "(not set)"}</div>
          </div>
          <Button
            variant="destructive"
            className="w-full flex gap-2 items-center"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" /> Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
