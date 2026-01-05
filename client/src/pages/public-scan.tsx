import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
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
  Clock,
  MapPin,
  Truck,
  Box,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Product, TraceEvent, QRCode as QRCodeType } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const eventTypeIcons: Record<string, typeof Truck> = {
  manufactured: Factory,
  shipped: Truck,
  received: Box,
  transferred: ArrowRight,
  inspected: CheckCircle2,
  repaired: Wrench,
  recycled: Recycle,
  disposed: Package,
  custom: Sparkles,
};

const eventTypeLabels: Record<string, string> = {
  manufactured: "Manufactured",
  shipped: "Shipped",
  received: "Received",
  transferred: "Transferred",
  inspected: "Quality Inspected",
  repaired: "Repaired",
  recycled: "Recycled",
  disposed: "End of Life",
  custom: "Event",
};

export default function PublicScan() {
  const params = useParams<{ id: string }>();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", params.id],
  });

  const { data: traceEvents } = useQuery<TraceEvent[]>({
    queryKey: ["/api/products", params.id, "trace"],
    enabled: !!params.id,
  });

  const { data: qrCode } = useQuery<QRCodeType>({
    queryKey: ["/api/products", params.id, "qr"],
    enabled: !!params.id,
  });

  const scanMutation = useMutation({
    mutationFn: async (qrId: string) => {
      await apiRequest("POST", `/api/qr/${qrId}/scan`);
    },
  });

  useEffect(() => {
    if (qrCode?.id) {
      scanMutation.mutate(qrCode.id);
    }
  }, [qrCode?.id]);

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
          <Link href="/">
            <Badge variant="secondary" className="cursor-pointer">
              Return Home
            </Badge>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">PhotonicTag</span>
                <span className="text-xs text-muted-foreground hidden sm:block">Digital Product Passport</span>
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {product.productImage ? (
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
                <img
                  src={product.productImage}
                  alt={product.productName}
                  className="w-full h-full object-cover"
                  data-testid="img-product-hero"
                />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center">
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
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" className="font-mono gap-1">
                <Hash className="h-3 w-3" />
                {product.batchNumber}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" />
                Tamper-Proof Identity
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            {(product.qrCodeData || qrCode?.qrImageUrl) && (
              <Card>
                <CardContent className="p-4 flex flex-col items-center">
                  <img
                    src={product.qrCodeData || qrCode?.qrImageUrl || ""}
                    alt="Product QR Code"
                    className="w-40 h-40 rounded"
                    data-testid="img-qr-code"
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Scan to verify authenticity
                  </p>
                  {qrCode?.scanCount !== undefined && qrCode.scanCount > 0 && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      Scanned {qrCode.scanCount} times
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Leaf className="h-4 w-4" />
                Carbon Footprint
              </div>
              <div className="text-2xl font-bold" data-testid="text-public-carbon">
                {product.carbonFootprint}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  kg CO2e
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Wrench className="h-4 w-4" />
                Repairability
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold" data-testid="text-public-repairability">
                  {product.repairabilityScore}
                </span>
                <span className="text-sm text-muted-foreground mb-1">/10</span>
              </div>
              <Progress value={product.repairabilityScore * 10} className="h-1.5 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Shield className="h-4 w-4" />
                Warranty
              </div>
              <p className="text-sm font-medium line-clamp-2" data-testid="text-public-warranty-brief">
                {product.warrantyInfo.slice(0, 50)}{product.warrantyInfo.length > 50 ? "..." : ""}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Truck className="h-4 w-4" />
                Journey
              </div>
              <div className="text-2xl font-bold">
                {traceEvents?.length || 0}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  events
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {traceEvents && traceEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Product Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-6">
                  {traceEvents.map((event) => {
                    const Icon = eventTypeIcons[event.eventType] || Sparkles;
                    return (
                      <div
                        key={event.id}
                        className="relative pl-10"
                        data-testid={`public-trace-event-${event.id}`}
                      >
                        <div className="absolute left-0 w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">
                              {eventTypeLabels[event.eventType] || event.eventType}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {event.actor}
                            </Badge>
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground">
                              {event.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(event.timestamp).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {typeof event.location === "object" && event.location.name
                                  ? event.location.name
                                  : String(event.location)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
              End of Life Guidance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed whitespace-pre-line" data-testid="text-public-recycling">
              {product.recyclingInstructions}
            </p>
          </CardContent>
        </Card>

        <footer className="text-center py-8 border-t">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-medium">PhotonicTag</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Identity, at the speed of light.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
