import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { Helmet } from "react-helmet-async";
import {
  Package, QrCode, Shield, Cpu, BarChart3, LogOut,
  Loader2, ArrowRight, Zap, Globe, Link as LinkIcon
} from "lucide-react";
import { Link, useLocation } from "wouter";
import type { Product } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

function usePartnerAuth() {
  const { data: partner, isLoading, error } = useQuery({
    queryKey: ["/api/team/me"],
    queryFn: async () => {
      const res = await fetch("/api/team/me", { credentials: "include" });
      if (!res.ok) throw new Error("Not authenticated");
      return res.json();
    },
    retry: false,
  });

  return { partner, isLoading, isAuthenticated: !!partner && !error };
}

export default function PartnerDashboard() {
  const { partner, isLoading: authLoading, isAuthenticated: isTeamAuth } = usePartnerAuth();
  const { user: adminUser, isLoading: adminLoading, isAuthenticated: isAdminAuth } = useAuth();
  const [, setLocation] = useLocation();

  const isAuthenticated = isTeamAuth || isAdminAuth;
  const displayName = isAdminAuth ? (adminUser?.firstName || "Admin") : partner?.firstName;
  const displayInfo = isAdminAuth
    ? "Administrator"
    : (partner?.company ? `${partner.company} - ` : "") + (partner?.role?.replace("_", " ") || "");

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: isAuthenticated,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (isTeamAuth) {
        await apiRequest("POST", "/api/team/logout");
      }
    },
    onSuccess: () => {
      if (isAdminAuth) {
        setLocation("/");
      } else {
        setLocation("/team/login");
      }
    },
  });

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/team/login");
    return null;
  }

  const categoryGroups = products.reduce((acc, p) => {
    const cat = p.productCategory || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Team Dashboard | PhotonicTag</title>
      </Helmet>
      <div className="fixed top-0 left-0 right-0 z-50">
        <PublicNav />
      </div>

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-partner-welcome">
                Welcome, {displayName}
              </h1>
              <p className="text-muted-foreground">
                {displayInfo}
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => logoutMutation.mutate()}
              data-testid="button-partner-logout"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card data-testid="stat-total-products">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{products.length}</p>
                    <p className="text-xs text-muted-foreground">Products</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="stat-categories">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{Object.keys(categoryGroups).length}</p>
                    <p className="text-xs text-muted-foreground">Categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="stat-qr-codes">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <QrCode className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{products.filter(p => p.qrCodeData).length}</p>
                    <p className="text-xs text-muted-foreground">QR Codes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="stat-compliant">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{products.filter(p => p.ceMarking).length}</p>
                    <p className="text-xs text-muted-foreground">CE Marked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="products" className="space-y-6">
            <TabsList data-testid="tabs-partner-dashboard">
              <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
              <TabsTrigger value="features" data-testid="tab-features">Platform Features</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              {productsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(categoryGroups).map(([category, categoryProducts]) => (
                    <div key={category}>
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        {category}
                        <Badge variant="secondary">{categoryProducts.length}</Badge>
                      </h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryProducts.map((product) => (
                          <Card key={product.id} className="hover-elevate" data-testid={`card-product-${product.id}`}>
                            {product.productImage && (
                              <div className="aspect-video w-full overflow-hidden bg-muted">
                                <img
                                  src={product.productImage}
                                  alt={product.productName || "Product"}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <CardContent className="p-4">
                              <h4 className="font-medium text-sm line-clamp-2 mb-1">{product.productName}</h4>
                              <p className="text-xs text-muted-foreground mb-3">{product.manufacturer}</p>
                              <div className="flex items-center gap-2 flex-wrap mb-3">
                                {product.ceMarking && (
                                  <Badge variant="outline" className="text-xs">CE</Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  Score: {product.repairabilityScore}/10
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {product.carbonFootprint} kg CO2
                                </Badge>
                              </div>
                              <Button variant="outline" size="sm" className="w-full gap-1" asChild>
                                <Link href={`/product/${product.id}`}>
                                  View DPP <ArrowRight className="h-3 w-3" />
                                </Link>
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="features">
              <div className="grid sm:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <QrCode className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">QR-Based Product Passports</CardTitle>
                        <CardDescription>Unique, tamper-proof digital identity for every product</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Each product gets a scannable QR code linking to its full Digital Product Passport with materials, sustainability data, and compliance information.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">AI-Powered Insights</CardTitle>
                        <CardDescription>Smart analysis for sustainability and compliance</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Five AI insight modules: Product Summary, Sustainability Analysis, Repair Guide, Circularity Score, and Risk Assessment.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <Cpu className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">IoT Device Management</CardTitle>
                        <CardDescription>NFC, RFID, and BLE tag tracking</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Register and monitor NFC tags, RFID sensors, and BLE beacons linked to products for real-time tracking and authentication.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <LinkIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">SAP Integration</CardTitle>
                        <CardDescription>Bidirectional ERP sync</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Bidirectional synchronization with SAP S/4HANA, ECC, and Business One. Material master data flows directly into DPP fields.
                    </p>
                    <Button variant="outline" size="sm" className="mt-3 gap-1" asChild>
                      <Link href="/integrations">
                        Learn More <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">EU DPP Compliance</CardTitle>
                        <CardDescription>ESPR 2024/1781 ready</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Pre-configured for batteries (Feb 2027), textiles, electronics, and all upcoming EU DPP product categories.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Supply Chain Traceability</CardTitle>
                        <CardDescription>End-to-end product journey tracking</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Track every step from manufacturing to end-of-life. Audit logs, ownership transfers, and full supply chain visibility.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
