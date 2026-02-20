import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogIn, Eye, EyeOff, Package } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export default function DemoLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/team/login", { email, password });
      const data = await response.json();

      if (data.success) {
        toast({ title: "Welcome!", description: "Explore our Digital Product Passport demos" });
        setLocation("/team/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Demo Login | PhotonicTag</title>
        <meta name="description" content="Sign in to explore PhotonicTag Digital Product Passport demos." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="fixed top-0 left-0 right-0 z-50">
        <PublicNav />
      </div>

      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-md bg-primary flex items-center justify-center mb-2">
              <Package className="w-7 h-7 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl" data-testid="text-demo-login-title">Demo Access</CardTitle>
            <CardDescription>
              Sign in to explore Digital Product Passport demos across industries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="demo-email">Email</Label>
                <Input
                  id="demo-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-demo-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-password">Password</Label>
                <div className="relative">
                  <Input
                    id="demo-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="input-demo-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-demo-toggle-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={isLoading}
                data-testid="button-demo-submit"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                View Demos
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Demo accounts are provided by PhotonicTag administrators.
              Contact us if you need access.
            </p>
          </CardContent>
        </Card>
      </div>

      <PublicFooter />
    </div>
  );
}
