import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Factory, Tag, Store, Recycle, QrCode, Shield, Leaf, ArrowRight, ExternalLink } from "lucide-react";
import type { Product } from "@shared/schema";

interface DemoCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
  productCategories: string[];
}

const demoCategories: DemoCategory[] = [
  {
    id: "manufacturers",
    title: "For Manufacturers",
    description: "Showcase product authenticity, compliance, and supply chain transparency",
    icon: <Factory className="h-6 w-6" />,
    benefits: [
      "EU DPP compliance ready",
      "Real-time production tracking",
      "Quality certifications display",
      "Supply chain visibility"
    ],
    productCategories: ["Industrial Belting", "Industrial Rollers", "Industrial Packaging", "Batteries"]
  },
  {
    id: "brands",
    title: "For Brands",
    description: "Build consumer trust with transparent product stories and sustainability data",
    icon: <Tag className="h-6 w-6" />,
    benefits: [
      "Brand authenticity verification",
      "Sustainability storytelling",
      "Consumer engagement",
      "Anti-counterfeiting protection"
    ],
    productCategories: ["Apparel", "Fashion Accessories", "Consumer Electronics", "Smart Home"]
  },
  {
    id: "marketplaces",
    title: "For Marketplaces",
    description: "Verify product authenticity and provide buyers with complete product information",
    icon: <Store className="h-6 w-6" />,
    benefits: [
      "Product authentication",
      "Seller verification",
      "Complete product data",
      "Trust & transparency"
    ],
    productCategories: ["Consumer Electronics", "Fashion Accessories", "EV Accessories", "Smart Home"]
  },
  {
    id: "recyclers",
    title: "For Recyclers",
    description: "Access material composition and end-of-life instructions for circular economy",
    icon: <Recycle className="h-6 w-6" />,
    benefits: [
      "Material composition data",
      "Disassembly instructions",
      "Recyclability scores",
      "Take-back program info"
    ],
    productCategories: ["Batteries", "Industrial Packaging", "Consumer Electronics", "Industrial Belting"]
  }
];

function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="hover-elevate transition-all duration-200 overflow-hidden">
      {product.productImage && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img 
            src={product.productImage} 
            alt={product.productName || "Product image"}
            className="w-full h-full object-cover"
            data-testid={`img-product-${product.id}`}
          />
        </div>
      )}
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
            View Digital Product Passport
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function CategorySection({ category, products }: { category: DemoCategory; products: Product[] }) {
  const filteredProducts = products.filter(p => 
    category.productCategories.includes(p.productCategory || "")
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
        <div className="p-3 rounded-lg bg-primary/10 text-primary">
          {category.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{category.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {category.benefits.map((benefit, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {benefit}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No demo products available for this category yet.
        </div>
      )}
    </div>
  );
}

export default function DemoGallery() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">PhotonicTag Demo Gallery</h1>
              <p className="text-muted-foreground mt-1">
                Explore Digital Product Passports across industries
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" data-testid="button-back-home">
                <ExternalLink className="mr-2 h-4 w-4" />
                Main Site
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how PhotonicTag transforms product identity with secure, intelligent Digital Product Passports. 
              Click any product to view its complete DPP.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Tabs defaultValue="manufacturers" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-2 bg-transparent p-0">
                {demoCategories.map(category => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
                    data-testid={`tab-${category.id}`}
                  >
                    {category.icon}
                    <span className="hidden sm:inline">{category.title.replace("For ", "")}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {demoCategories.map(category => (
                <TabsContent key={category.id} value={category.id} className="mt-6">
                  <CategorySection category={category} products={products} />
                </TabsContent>
              ))}
            </Tabs>
          )}

          <div className="mt-12 p-6 rounded-lg border bg-card text-center">
            <h3 className="text-lg font-semibold mb-2">Ready to see PhotonicTag for your products?</h3>
            <p className="text-muted-foreground mb-4">
              Contact us for a personalized demo with your product data
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/">
                <Button data-testid="button-learn-more">Learn More</Button>
              </Link>
              <Button variant="outline" data-testid="button-contact">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t mt-12 py-6 text-center text-sm text-muted-foreground">
        <p>PhotonicTag - Identity, at the speed of light.</p>
      </footer>
    </div>
  );
}
