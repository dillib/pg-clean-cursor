import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { LogIn, QrCode } from "lucide-react";

export default function AdminLogin() {
  return (
    <>
      <Helmet>
        <title>Admin Login | PhotonicTag</title>
        <meta name="description" content="Admin login for PhotonicTag platform management" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <PublicNav />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md" data-testid="card-admin-login">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-md bg-primary flex items-center justify-center mb-2" data-testid="img-admin-logo">
                <QrCode className="w-7 h-7 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl" data-testid="text-admin-title">Admin Access</CardTitle>
              <CardDescription data-testid="text-admin-description">
                Sign in with your organization account (WorkOS) to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full gap-2" data-testid="button-admin-login">
                <a href="/api/login">
                  <LogIn className="w-4 h-4" />
                  Sign in
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <PublicFooter />
      </div>
    </>
  );
}
