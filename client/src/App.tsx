import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { HelmetProvider } from "react-helmet-async";
import { ThemeToggle } from "@/components/theme-toggle";
import { ScrollToTop } from "@/components/scroll-to-top";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, QrCode, LogOut, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Landing from "@/pages/landing-validation";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import ProductForm from "@/pages/product-form";
import ProductDetail from "@/pages/product-detail";
import IoTDevices from "@/pages/iot-devices";
import SAPConnector from "@/pages/sap-connector";
import SAPDemo from "@/pages/sap-demo";
import PublicScan from "@/pages/public-scan";
import Pricing from "@/pages/pricing";
import Integrations from "@/pages/integrations";
import Contact from "@/pages/contact";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import DemoGallery from "@/pages/demo-gallery";
import CRM from "@/pages/crm";
import PartnerLogin from "@/pages/partner-login";
import PartnerDashboard from "@/pages/partner-dashboard";
import DemoLogin from "@/pages/demo-login";
import AdminLogin from "@/pages/admin-login";
import AdminInternal from "@/pages/admin-internal";
import NotFound from "@/pages/not-found";

function AdminLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex h-14 items-center justify-between gap-4 border-b px-4 shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (location !== "/") {
      return <Redirect to="/" />;
    }
    return <Landing />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

function useTeamAuth() {
  const { data: teamUser, isLoading, error } = useQuery({
    queryKey: ["/api/team/me"],
    queryFn: async () => {
      const res = await fetch("/api/team/me", { credentials: "include" });
      if (!res.ok) throw new Error("Not authenticated");
      return res.json();
    },
    retry: false,
  });
  return { teamUser, isLoading, isAuthenticated: !!teamUser && !error };
}

function TeamLayout({ children }: { children: React.ReactNode }) {
  const { teamUser } = useTeamAuth();
  const [, setLocation] = useLocation();
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/team/logout", { method: "POST", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/me"] });
      setLocation("/internal/login");
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex h-14 items-center justify-between gap-4 border-b px-4 shrink-0">
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          <span className="font-semibold">PhotonicTag CRM</span>
        </div>
        <div className="flex items-center gap-3">
          {teamUser && (
            <span className="text-sm text-muted-foreground" data-testid="text-team-user">
              {teamUser.firstName} {teamUser.lastName}
            </span>
          )}
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logoutMutation.mutate()}
            data-testid="button-team-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function CRMLayout({ children, userName, isAdmin }: { children: React.ReactNode; userName: string; isAdmin: boolean }) {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex h-14 items-center justify-between gap-4 border-b px-4 shrink-0">
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          <span className="font-semibold">PhotonicTag CRM</span>
          {isAdmin && (
            <Badge variant="secondary" className="text-xs">Super Admin</Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground" data-testid="text-crm-user">
            {userName}
          </span>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            data-testid="button-crm-back"
            title="Back to Admin Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function DualAuthCRM() {
  const { isAuthenticated: isAdminAuth, isLoading: adminLoading, user: adminUser } = useAuth();
  const { isAuthenticated: isTeamAuth, isLoading: teamLoading } = useTeamAuth();

  if (adminLoading || teamLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isAdminAuth) {
    return <CRMLayout userName={adminUser?.firstName || "Admin"} isAdmin={true}><CRM isAdmin={true} /></CRMLayout>;
  }

  if (isTeamAuth) {
    return <TeamLayout><CRM isAdmin={false} /></TeamLayout>;
  }

  return <Redirect to="/internal/login" />;
}

function InternalOpsProtected() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex h-14 items-center justify-between gap-4 border-b px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-back-dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <QrCode className="h-5 w-5 text-primary" />
          <span className="font-semibold">PhotonicTag</span>
          <Badge variant="secondary" className="text-xs">Super Admin</Badge>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-muted-foreground" data-testid="text-ops-user">
              {user.firstName || user.email}
            </span>
          )}
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <AdminInternal mode="full" />
      </main>
    </div>
  );
}

function InternalDashboardProtected() {
  const { isAuthenticated: isTeamAuth, isLoading: teamLoading, teamUser } = useTeamAuth();
  const [, setLocation] = useLocation();
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/team/logout", { method: "POST", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/me"] });
      setLocation("/internal/login");
    },
  });

  if (teamLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isTeamAuth) {
    return <Redirect to="/internal/login" />;
  }

  if (teamUser?.role === "demo_viewer") {
    return <Redirect to="/demo/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex h-14 items-center justify-between gap-4 border-b px-4 shrink-0">
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          <span className="font-semibold">PhotonicTag</span>
          <Badge variant="secondary" className="text-xs">Internal</Badge>
        </div>
        <div className="flex items-center gap-3">
          {teamUser && (
            <span className="text-sm text-muted-foreground" data-testid="text-internal-user">
              {teamUser.firstName} {teamUser.lastName}
            </span>
          )}
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logoutMutation.mutate()}
            data-testid="button-internal-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <AdminInternal mode="internal" />
      </main>
    </div>
  );
}

function DemoDashboardProtected() {
  const { isAuthenticated: isTeamAuth, isLoading: teamLoading } = useTeamAuth();

  if (teamLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isTeamAuth) {
    return <Redirect to="/demo/login" />;
  }

  return <PartnerDashboard />;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/products">
        <ProtectedRoute>
          <Products />
        </ProtectedRoute>
      </Route>
      <Route path="/products/new">
        <ProtectedRoute>
          <ProductForm />
        </ProtectedRoute>
      </Route>
      <Route path="/products/:id/edit">
        <ProtectedRoute>
          <ProductForm />
        </ProtectedRoute>
      </Route>
      <Route path="/products/:id">
        <ProtectedRoute>
          <ProductDetail />
        </ProtectedRoute>
      </Route>
      <Route path="/iot-devices">
        <ProtectedRoute>
          <IoTDevices />
        </ProtectedRoute>
      </Route>
      <Route path="/integrations/sap">
        <ProtectedRoute>
          <SAPConnector />
        </ProtectedRoute>
      </Route>
      <Route path="/integrations/sap-demo">
        <ProtectedRoute>
          <SAPDemo />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/internal">
        <InternalOpsProtected />
      </Route>
      <Route path="/crm">
        <DualAuthCRM />
      </Route>
      <Route path="/product/:id">
        <PublicScan />
      </Route>
      <Route path="/scan/demo" component={DemoGallery} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/contact" component={Contact} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/internal/login" component={PartnerLogin} />
      <Route path="/demo/login" component={DemoLogin} />
      <Route path="/internal/dashboard">
        <InternalDashboardProtected />
      </Route>
      <Route path="/demo/dashboard">
        <DemoDashboardProtected />
      </Route>
      <Route path="/team/login">
        <Redirect to="/internal/login" />
      </Route>
      <Route path="/team/dashboard">
        <Redirect to="/demo/dashboard" />
      </Route>
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme="light" storageKey="photonictag-theme">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <ScrollToTop />
            <Router />
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
