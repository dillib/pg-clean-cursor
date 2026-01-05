import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import ProductForm from "@/pages/product-form";
import ProductDetail from "@/pages/product-detail";
import PublicScan from "@/pages/public-scan";
import Pricing from "@/pages/pricing";
import Integrations from "@/pages/integrations";
import Docs from "@/pages/docs";
import Blog from "@/pages/blog";
import CaseStudies from "@/pages/case-studies";
import EuDppGuide from "@/pages/eu-dpp-guide";
import Careers from "@/pages/careers";
import Contact from "@/pages/contact";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
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
      <Route path="/product/:id">
        <PublicScan />
      </Route>
      <Route path="/scan/demo">
        <PublicScan isDemo />
      </Route>
      <Route path="/pricing" component={Pricing} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/docs" component={Docs} />
      <Route path="/blog" component={Blog} />
      <Route path="/case-studies" component={CaseStudies} />
      <Route path="/eu-dpp-guide" component={EuDppGuide} />
      <Route path="/careers" component={Careers} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="photonictag-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
