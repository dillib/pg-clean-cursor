import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { QrCode, Shield, Leaf, ArrowRight, Clock, Calendar } from "lucide-react";
import type { Product } from "@shared/schema";

const categoryDeadlinePriority: Record<string, number> = {
  "Batteries": 1,
  "EV Accessories": 2,
  "Apparel": 3,
  "Fashion Accessories": 3,
  "Consumer Electronics": 4,
  "IoT Devices": 4,
  "Smart Home": 4,
  "Industrial Packaging": 5,
  "Industrial Belting": 6,
  "Industrial Rollers": 6,
};

const categoryDeadlineInfo: Record<string, { date: string; urgent: boolean }> = {
  "Batteries": { date: "Feb 18, 2027", urgent: true },
  "EV Accessories": { date: "Feb 2027", urgent: true },
  "Apparel": { date: "Late 2027", urgent: false },
  "Fashion Accessories": { date: "Late 2027", urgent: false },
  "Consumer Electronics": { date: "Late 2027", urgent: false },
  "IoT Devices": { date: "Late 2027", urgent: false },
  "Smart Home": { date: "Late 2027", urgent: false },
  "Industrial Packaging": { date: "2028-2029", urgent: false },
  "Industrial Belting": { date: "By 2030", urgent: false },
  "Industrial Rollers": { date: "By 2030", urgent: false },
};

function getCategoryPriority(category: string | null): number {
  if (!category) return 99;
  return categoryDeadlinePriority[category] ?? 99;
}

function getCategoryDeadline(category: string | null): { date: string; urgent: boolean } {
  if (!category) return { date: "By 2030", urgent: false };
  return categoryDeadlineInfo[category] ?? { date: "By 2030", urgent: false };
}

function ProductCard({ product }: { product: Product }) {
  const deadline = getCategoryDeadline(product.productCategory);
  
  return (
    <Card className="hover-elevate transition-all duration-200 overflow-hidden">
      <div className="aspect-video w-full overflow-hidden bg-muted relative">
        {product.productImage ? (
          <img 
            src={product.productImage} 
            alt={product.productName || "Product image"}
            className="w-full h-full object-cover"
            data-testid={`img-product-${product.id}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <QrCode className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div 
          className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
            deadline.urgent 
              ? 'bg-destructive text-destructive-foreground' 
              : 'bg-amber-500 text-white'
          }`}
          data-testid={`badge-deadline-${product.id}`}
        >
          <Clock className="h-3 w-3" />
          DPP Deadline: {deadline.date}
        </div>
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-2" data-testid={`text-product-name-${product.id}`}>
              {product.productName}
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              {product.manufacturer}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {product.productCategory}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Leaf className="h-3.5 w-3.5 text-green-600" />
            <span>{product.recyclabilityPercent || 0}% recyclable</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-blue-600" />
            <span>Score: {product.repairabilityScore || 0}/10</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <QrCode className="h-3.5 w-3.5" />
          <span className="truncate">ID: {product.id.slice(0, 8)}...</span>
        </div>

        <Link href={`/product/${product.id}`}>
          <Button className="w-full" variant="default" size="sm" data-testid={`button-view-dpp-${product.id}`}>
            View Product Passport
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function DemoGallery() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const sortedProducts = [...products].sort((a, b) => 
    getCategoryPriority(a.productCategory) - getCategoryPriority(b.productCategory)
  );

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Examples - PhotonicTag | Digital Product Passport Demos</title>
        <meta name="description" content="Explore real Digital Product Passport examples. See how products display sustainability data, repair guides, and traceability information through scannable QR codes." />
        <meta property="og:title" content="Digital Product Passport Examples - PhotonicTag" />
        <meta property="og:description" content="See real DPP examples. Sustainability scores, repair guides, full traceability." />
      </Helmet>
      <PublicNav />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-3">
              Digital Product Passport Examples
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Click any product to see its complete Digital Product Passport — the same experience your customers will have when they scan your products.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-16 p-8 rounded-lg border bg-card text-center">
            <h2 className="text-xl font-semibold mb-2">Ready for your products?</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Let's discuss how Digital Product Passports can help your business meet EU compliance and build customer trust.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild data-testid="button-book-demo">
                <a href="https://calendar.app.google/Aa9nfUnJiZvcjXi28" target="_blank" rel="noopener noreferrer" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Book a Demo
                </a>
              </Button>
              <Link href="/contact">
                <Button variant="outline" data-testid="button-contact">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
