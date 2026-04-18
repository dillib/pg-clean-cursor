import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Shield, Users, PlayCircle, ArrowRight } from "lucide-react";

export default function Login() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav hideSignIn />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-3xl space-y-10">
          <div className="text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Sign in to PhotonicTag</h1>
            <p className="text-muted-foreground">
              Choose how you&rsquo;d like to continue. Most customers use their organization&rsquo;s
              single sign-on.
            </p>
          </div>

          <Card className="border-primary/40 shadow-md">
            <CardHeader className="flex flex-row items-start gap-4">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">Organization single sign-on</CardTitle>
                <CardDescription>
                  Recommended for customers. Sign in with WorkOS AuthKit using your corporate identity
                  provider (Okta, Entra ID, Google Workspace, SAML).
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="w-full gap-2" data-testid="button-login-sso">
                <a href="/api/login">
                  Continue with SSO
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/internal/login"
              data-testid="link-login-team"
              className="group rounded-lg border bg-card p-4 hover:border-primary/60 transition-colors"
            >
              <Users className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold text-sm">Team / Partner</div>
              <div className="text-xs text-muted-foreground mt-1">
                Internal staff and integration partners with password credentials.
              </div>
            </Link>

            <Link
              href="/admin/login"
              data-testid="link-login-admin"
              className="group rounded-lg border bg-card p-4 hover:border-primary/60 transition-colors"
            >
              <Shield className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold text-sm">Platform admin</div>
              <div className="text-xs text-muted-foreground mt-1">
                PhotonicTag operations and support team.
              </div>
            </Link>

            <Link
              href="/demo/login"
              data-testid="link-login-demo"
              className="group rounded-lg border bg-card p-4 hover:border-primary/60 transition-colors"
            >
              <PlayCircle className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold text-sm">Sales demo</div>
              <div className="text-xs text-muted-foreground mt-1">
                Trial a sandbox tenant pre-loaded with sample DPPs.
              </div>
            </Link>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            New to PhotonicTag?{" "}
            <Link href="/book-demo" className="text-primary hover:underline" data-testid="link-book-demo">
              Book a demo
            </Link>
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
