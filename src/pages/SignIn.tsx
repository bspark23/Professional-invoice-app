
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Label } from "@/components/ui/label";
import { useProfiles } from "@/hooks/useProfiles";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { profiles, setActiveProfile } = useProfiles();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    const res = await signIn(email, password);
    
    if (!res.success) {
      setError(res.error!);
      setLoading(false);
    } else {
      // After sign in, find and set the profile whose 'name' matches logged in profileName
      const stored = localStorage.getItem("invoicecraft-auth-user");
      let profileName: string | null = null;
      if (stored) {
        try {
          profileName = JSON.parse(stored).profileName;
        } catch { /* ignore */ }
      }
      if (profileName) {
        // Find the business profile with the matching name
        const profile = profiles.find((p) => p.name === profileName);
        if (profile) {
          setActiveProfile(profile.id);
        }
      }
      // Navigate to dashboard
      navigate("/dashboard");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tl from-blue-200 via-white to-purple-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          <div className="text-xs mt-2">
            No account? <Link className="underline" to="/signup">Sign Up</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
