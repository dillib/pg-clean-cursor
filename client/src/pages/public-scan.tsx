import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import {
  Package,
  Factory,
  Hash,
  Recycle,
  Sparkles,
  Shield,
  Leaf,
  Wrench,
  QrCode,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import type { Product } from "@shared/schema";

export default function PublicScan() {
  const params = useParams<{ id: string }>();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", params.id],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-12 rounded-full mx-auto" />
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-6 w-48 mx-auto" />
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <p className="text-muted-foreground max-w-md">
            The product you scanned doesn't exist or has been removed. Please check
            the QR code and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold">Photonictag</span>
          </div>
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Verified Product
          </Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          {product.productImage ? (
            <div className="aspect-video max-h-64 w-full rounded-lg overflow-hidden bg-muted mx-auto">
              <img
                src={product.productImage}
                alt={product.productName}
                className="w-full h-full object-cover"
                data-testid="img-product-hero"
              />
            </div>
          ) : (
            <div className="h-48 w-48 rounded-lg bg-muted flex items-center justify-center mx-auto">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2" data-testid="text-public-product-name">
              {product.productName}
            </h1>
            <p className="text-xl text-muted-foreground" data-testid="text-public-manufacturer">
              {product.manufacturer}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Badge variant="outline" className="font-mono gap-1">
              <Hash className="h-3 w-3" />
              {product.batchNumber}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <QrCode className="h-3 w-3" />
              Digital Product Passport
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Leaf className="h-4 w-4 text-muted-foreground" />
                Carbon Footprint
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-public-carbon">
                {product.carbonFootprint}
                <span className="text-lg font-normal text-muted-foreground ml-1">
                  kg CO2e
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Total lifecycle emissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                Repairability Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold" data-testid="text-public-repairability">
                  {product.repairabilityScore}
                </span>
                <span className="text-lg text-muted-foreground">/10</span>
              </div>
              <Progress value={product.repairabilityScore * 10} className="h-2" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Factory className="h-4 w-4" />
                  Manufacturer
                </div>
                <p className="font-medium">{product.manufacturer}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  Batch Number
                </div>
                <p className="font-mono font-medium">{product.batchNumber}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Materials
              </h3>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-public-materials">
                {product.materials}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Warranty Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed" data-testid="text-public-warranty">
              {product.warrantyInfo}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Recycle className="h-5 w-5" />
              Recycling Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed whitespace-pre-line" data-testid="text-public-recycling">
              {product.recyclingInstructions}
            </p>
          </CardContent>
        </Card>

        <footer className="text-center py-8 border-t">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span>Powered by Photonictag Digital Product Passports</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
