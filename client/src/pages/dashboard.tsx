import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Package,
  QrCode,
  Recycle,
  Sparkles,
  ArrowRight,
  Plus,
  ShieldCheck,
  ListChecks,
  Upload,
} from "lucide-react";
import { usePrefixedLink } from "@/hooks/use-route-prefix";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Product } from "@shared/schema";

// Fields the EU ESPR regulation treats as core for a compliant DPP.
// "Readiness" = % of products with every one of these filled.
const REQUIRED_FIELDS = [
  "manufacturer",
  "materials",
  "carbonFootprint",
  "warrantyInfo",
  "recyclingInstructions",
] as const;

function isFieldFilled(product: Product, field: string): boolean {
  const v = (product as any)[field];
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "number") return v > 0;
  return true;
}

function computeReadiness(products: Product[]) {
  if (!products.length) return { score: 0, complete: 0, incomplete: 0 };
  const complete = products.filter((p) =>
    REQUIRED_FIELDS.every((f) => isFieldFilled(p, f)),
  ).length;
  return {
    score: Math.round((complete / products.length) * 100),
    complete,
    incomplete: products.length - complete,
  };
}

export default function Dashboard() {
  const link = usePrefixedLink();
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const stats = useMemo(() => {
    if (!products) return null;
    const readiness = computeReadiness(products);
    const avgRepair = products.length
      ? Math.round(
          products.reduce((a, p) => a + (p.repairabilityScore || 0), 0) /
            products.length,
        )
      : 0;
    const totalCarbon = products.reduce(
      (a, p) => a + (p.carbonFootprint || 0),
      0,
    );
    return {
      total: products.length,
      readiness,
      avgRepair,
      totalCarbon,
    };
  }, [products]);

  const readinessTone: "success" | "warning" | "danger" =
    !stats || stats.readiness.score >= 80
      ? "success"
      : stats.readiness.score >= 50
        ? "warning"
        : "danger";

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Your Digital Product Passports, compliance progress, and activity."
        actions={
          <>
            <Link href={link("/products")}>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Bulk import</span>
                <span className="sm:hidden">Import</span>
              </Button>
            </Link>
            <Link href={link("/products/new")}>
              <Button size="sm" data-testid="button-create-product-hero">
                <Plus className="mr-2 h-4 w-4" />
                New product
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Compliance readiness"
          value={stats ? `${stats.readiness.score}%` : "—"}
          icon={ShieldCheck}
          hint={
            stats
              ? `${stats.readiness.complete}/${stats.total} ESPR-ready`
              : undefined
          }
          loading={isLoading}
          tone={readinessTone}
          testId="stat-readiness"
        />
        <StatCard
          label="Total products"
          value={stats?.total ?? 0}
          icon={Package}
          hint="Digital passports"
          loading={isLoading}
          testId="stat-total-products"
        />
        <StatCard
          label="Avg repairability"
          value={
            stats ? (
              <>
                {stats.avgRepair}
                <span className="text-lg text-muted-foreground">/10</span>
              </>
            ) : (
              "—"
            )
          }
          icon={Sparkles}
          hint="Product average"
          loading={isLoading}
          testId="stat-avg-repairability"
        />
        <StatCard
          label="Carbon footprint"
          value={
            stats ? (
              <>
                {stats.totalCarbon.toLocaleString()}
                <span className="text-lg text-muted-foreground">kg</span>
              </>
            ) : (
              "—"
            )
          }
          icon={Recycle}
          hint="Total CO₂ eq."
          loading={isLoading}
          testId="stat-carbon-footprint"
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg">
              ESPR readiness
            </CardTitle>
            <CardDescription>
              Products with every EU-required field filled.
            </CardDescription>
          </div>
          {stats && stats.readiness.incomplete > 0 && (
            <Link href={link("/products?filter=incomplete")}>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <ListChecks className="mr-2 h-4 w-4" />
                Review {stats.readiness.incomplete} incomplete
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <Skeleton className="h-3 w-full" />
          ) : (
            <>
              <Progress
                value={stats?.readiness.score ?? 0}
                aria-label="ESPR readiness"
                className="h-2"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>
                  {stats?.readiness.complete ?? 0} complete ·{" "}
                  {stats?.readiness.incomplete ?? 0} need fields
                </span>
                <span className="tabular-nums">
                  Required: {REQUIRED_FIELDS.join(", ")}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base sm:text-lg">
                  Recent products
                </CardTitle>
                <CardDescription>
                  Your latest Digital Product Passports.
                </CardDescription>
              </div>
              {!!products?.length && (
                <Link href={link("/products")}>
                  <Button variant="ghost" size="sm" className="gap-1">
                    View all
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !products?.length ? (
              <EmptyState
                icon={Package}
                title="No products yet"
                description="Create your first Digital Product Passport or bulk-import from SAP."
                action={
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Link href={link("/products/new")}>
                      <Button
                        variant="default"
                        size="sm"
                        data-testid="button-create-first-product"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create product
                      </Button>
                    </Link>
                    <Link href={link("/integrations/sap")}>
                      <Button variant="outline" size="sm">
                        Connect SAP
                      </Button>
                    </Link>
                  </div>
                }
              />
            ) : (
              <ul className="divide-y">
                {products.slice(0, 6).map((product) => {
                  const ready = REQUIRED_FIELDS.every((f) =>
                    isFieldFilled(product, f),
                  );
                  return (
                    <li key={product.id}>
                      <Link href={link(`/products/${product.id}`)}>
                        <div
                          className="flex items-center gap-3 py-3 hover-elevate active-elevate-2 -mx-2 px-2 rounded-md"
                          data-testid={`card-product-${product.id}`}
                        >
                          <div className="h-11 w-11 shrink-0 rounded-md bg-muted flex items-center justify-center overflow-hidden ring-1 ring-border">
                            {product.productImage ? (
                              <img
                                src={product.productImage}
                                alt=""
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {product.productName}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {product.manufacturer || "Manufacturer missing"}
                            </p>
                          </div>
                          <span
                            className={`hidden sm:inline text-xs font-medium tabular-nums ${
                              ready
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-amber-600 dark:text-amber-400"
                            }`}
                            aria-label={ready ? "ESPR ready" : "Needs fields"}
                          >
                            {ready ? "Ready" : "Incomplete"}
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Quick actions</CardTitle>
            <CardDescription>Common tasks.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href={link("/products/new")}>
              <Button
                variant="outline"
                className="w-full justify-start"
                data-testid="button-quick-create"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create new product
              </Button>
            </Link>
            <Link href={link("/products")}>
              <Button
                variant="outline"
                className="w-full justify-start"
                data-testid="button-quick-view-all"
              >
                <Package className="mr-2 h-4 w-4" />
                View all products
              </Button>
            </Link>
            <Link href={link("/integrations/sap")}>
              <Button variant="outline" className="w-full justify-start">
                <QrCode className="mr-2 h-4 w-4" />
                SAP connector
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
