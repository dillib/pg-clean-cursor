import { lazy, Suspense } from "react";
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
import { RoutePrefixProvider } from "@/hooks/use-route-prefix";
import { Loader2, QrCode, LogOut, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Lazy-load route components so each page ships as its own chunk.
// Initial page load only parses what's needed to render the current route.
const Landing = lazy(() => import("@/pages/landing-validation"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Products = lazy(() => import("@/pages/products"));
const ProductForm = lazy(() => import("@/pages/product-form"));
const ProductDetail = lazy(() => import("@/pages/product-detail"));
const IoTDevices = lazy(() => import("@/pages/iot-devices"));
const SAPConnector = lazy(() => import("@/pages/sap-connector"));
const SAPOperations = lazy(() => import("@/pages/sap-operations"));
const SAPDemo = lazy(() => import("@/pages/sap-demo"));
const PublicScan = lazy(() => import("@/pages/public-scan"));
const Pricing = lazy(() => import("@/pages/pricing"));
const Integrations = lazy(() => import("@/pages/integrations"));
const Contact = lazy(() => import("@/pages/contact"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const DemoGallery = lazy(() => import("@/pages/demo-gallery"));
const CRM = lazy(() => import("@/pages/crm"));
const PartnerLogin = lazy(() => import("@/pages/partner-login"));
const DemoLogin = lazy(() => import("@/pages/demo-login"));
const AdminLogin = lazy(() => import("@/pages/admin-login"));
const Login = lazy(() => import("@/pages/login"));
const AdminInternal = lazy(() => import("@/pages/admin-internal"));
const Docs = lazy(() => import("@/pages/docs"));
const Presentation = lazy(() => import("@/pages/presentation"));
const FAQs = lazy(() => import("@/pages/faqs"));
const BookDemo = lazy(() => import("@/pages/book-demo"));
const NotFound = lazy(() => import("@/pages/not-found"));

function RouteFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <RoutePrefixProvider prefix="">
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
    </RoutePrefixProvider>
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
    window.location.href = "/api/login?returnTo=/admin/internal";
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Redirecting to login...</span>
      </div>
    );
  }

  if ((user as any)?.isAdmin !== true) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-2xl font-semibold">Forbidden</h1>
          <p className="text-muted-foreground">
            This area is restricted to PhotonicTag staff.
          </p>
          <Button variant="outline" onClick={() => setLocation("/")} data-testid="button-forbidden-home">
            Go to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex h-14 items-center justify-between gap-4 border-b px-4 shrink-0">
        <div className="flex items-center gap-2">
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
          <Button variant="outline" size="sm" onClick={() => { window.location.href = "/api/logout"; }} data-testid="button-admin-signout">
            <LogOut className="h-4 w-4 mr-1" />
            Sign Out
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <AdminInternal mode="full" />
      </main>
    </div>
  );
}

function InternalProtectedRoute({ children }: { children: React.ReactNode }) {
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

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <RoutePrefixProvider prefix="/internal">
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar mode="internal" teamUser={teamUser} onLogout={() => logoutMutation.mutate()} />
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
    </RoutePrefixProvider>
  );
}

function DemoProtectedRoute({ children }: { children: React.ReactNode }) {
  const { teamUser, isAuthenticated: isTeamAuth, isLoading: teamLoading } = useTeamAuth();
  const [, setLocation] = useLocation();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/team/logout", { method: "POST", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/me"] });
      setLocation("/demo/login");
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
    return <Redirect to="/demo/login" />;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <RoutePrefixProvider prefix="/demo">
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar mode="demo" teamUser={teamUser} onLogout={() => logoutMutation.mutate()} />
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
    </RoutePrefixProvider>
  );
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
      <Route path="/integrations/sap-operations">
        <ProtectedRoute>
          <SAPOperations />
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
      <Route path="/login" component={Login} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/internal/login" component={PartnerLogin} />
      <Route path="/demo/login" component={DemoLogin} />
      <Route path="/internal/dashboard">
        <InternalProtectedRoute>
          <AdminInternal mode="internal" />
        </InternalProtectedRoute>
      </Route>
      <Route path="/internal/admin">
        <InternalProtectedRoute>
          <AdminInternal mode="internal" />
        </InternalProtectedRoute>
      </Route>
      <Route path="/demo/dashboard">
        <DemoProtectedRoute>
          <Dashboard />
        </DemoProtectedRoute>
      </Route>
      <Route path="/demo/products/new">
        <DemoProtectedRoute>
          <ProductForm />
        </DemoProtectedRoute>
      </Route>
      <Route path="/demo/products/:id/edit">
        <DemoProtectedRoute>
          <ProductForm />
        </DemoProtectedRoute>
      </Route>
      <Route path="/demo/products/:id">
        <DemoProtectedRoute>
          <ProductDetail />
        </DemoProtectedRoute>
      </Route>
      <Route path="/demo/products">
        <DemoProtectedRoute>
          <Products />
        </DemoProtectedRoute>
      </Route>
      <Route path="/demo/iot-devices">
        <DemoProtectedRoute>
          <IoTDevices />
        </DemoProtectedRoute>
      </Route>
      <Route path="/demo/integrations/sap">
        <DemoProtectedRoute>
          <SAPConnector />
        </DemoProtectedRoute>
      </Route>
      <Route path="/demo/integrations/sap-operations">
        <DemoProtectedRoute>
          <SAPOperations />
        </DemoProtectedRoute>
      </Route>
      <Route path="/demo/integrations/sap-demo">
        <DemoProtectedRoute>
          <SAPDemo />
        </DemoProtectedRoute>
      </Route>
      <Route path="/team/login">
        <Redirect to="/internal/login" />
      </Route>
      <Route path="/team/dashboard">
        <Redirect to="/demo/dashboard" />
      </Route>
      <Route path="/presentation" component={Presentation} />
      <Route path="/docs" component={Docs} />
      <Route path="/faqs" component={FAQs} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/book-demo" component={BookDemo} />
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
            <Suspense fallback={<RouteFallback />}>
              <Router />
            </Suspense>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
