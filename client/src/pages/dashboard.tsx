import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Package, QrCode, Recycle, Sparkles, ArrowRight, Plus } from "lucide-react";
import { usePrefixedLink } from "@/hooks/use-route-prefix";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@shared/schema";

export default function Dashboard() {
  const link = usePrefixedLink();
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const totalProducts = products?.length || 0;
  const avgRepairability = products?.length
    ? Math.round(products.reduce((acc, p) => acc + p.repairabilityScore, 0) / products.length)
    : 0;
  const totalCarbonFootprint = products?.reduce((acc, p) => acc + p.carbonFootprint, 0) || 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" data-testid="text-dashboard-title">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your Digital Product Passports and track sustainability.
          </p>
        </div>
        <Link href={link("/products/new")}>
          <Button data-testid="button-create-product-hero">
            <Plus className="mr-2 h-4 w-4" />
            Create Product
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl sm:text-3xl font-bold" data-testid="text-total-products">
                {totalProducts}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1 truncate">Digital Passports</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate">QR Active</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl sm:text-3xl font-bold" data-testid="text-qr-codes">
                {totalProducts}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1 truncate">Scannable identities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate">Avg Repair</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl sm:text-3xl font-bold" data-testid="text-avg-repairability">
                {avgRepairability}<span className="text-lg text-muted-foreground">/10</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1 truncate">Product average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate">Carbon</CardTitle>
            <Recycle className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl sm:text-3xl font-bold" data-testid="text-carbon-footprint">
                {totalCarbonFootprint}<span className="text-lg text-muted-foreground">kg</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1 truncate">Total CO2 eq.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
            <CardDescription>Your latest Digital Product Passports</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No products yet</p>
                <Link href={link("/products/new")}>
                  <Button variant="outline" size="sm" data-testid="button-create-first-product">
                    Create your first product
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {products?.slice(0, 5).map((product) => (
                  <Link key={product.id} href={link(`/products/${product.id}`)}>
                    <div
                      className="flex items-center gap-4 p-2 rounded-md hover-elevate active-elevate-2"
                      data-testid={`card-product-${product.id}`}
                    >
                      <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                        {product.productImage ? (
                          <img
                            src={product.productImage}
                            alt={product.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.productName}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {product.manufacturer}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href={link("/products/new")}>
              <Button variant="outline" className="w-full justify-start" data-testid="button-quick-create">
                <Plus className="mr-2 h-4 w-4" />
                Create New Product
              </Button>
            </Link>
            <Link href={link("/products")}>
              <Button variant="outline" className="w-full justify-start" data-testid="button-quick-view-all">
                <Package className="mr-2 h-4 w-4" />
                View All Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
