import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import {
  ArrowLeft,
  Edit,
  Trash2,
  QrCode,
  Package,
  Factory,
  Hash,
  Recycle,
  Sparkles,
  Shield,
  Leaf,
  Wrench,
  Download,
  ExternalLink,
  Loader2,
  MapPin,
  Clock,
  Truck,
  CheckCircle,
  RefreshCw,
  Plus,
  Wifi,
  Radio,
  Bluetooth,
  Signal,
  AlertTriangle,
  Droplets,
  Zap,
  Calendar,
  Award,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Product, AISummary, SustainabilityInsight, RepairSummary, CircularityScore, RiskAssessment, TraceEvent, IoTDevice, AIInsight } from "@shared/schema";

const eventTypes = [
  { value: "manufactured", label: "Manufactured" },
  { value: "shipped", label: "Shipped" },
  { value: "received", label: "Received" },
  { value: "transferred", label: "Transferred" },
  { value: "inspected", label: "Inspected" },
  { value: "repaired", label: "Repaired" },
  { value: "recycled", label: "Recycled" },
  { value: "disposed", label: "Disposed" },
  { value: "custom", label: "Custom Event" },
];

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [traceDialogOpen, setTraceDialogOpen] = useState(false);
  const [traceForm, setTraceForm] = useState({
    eventType: "shipped",
    actor: "",
    location: "",
    description: "",
  });

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", params.id],
  });

  const { data: traceEvents, isLoading: isLoadingTrace } = useQuery<TraceEvent[]>({
    queryKey: ["/api/products", params.id, "trace"],
    enabled: !!params.id,
  });

  const { data: iotDevices, isLoading: isLoadingIoT } = useQuery<IoTDevice[]>({
    queryKey: ["/api/iot/devices", "product", params.id],
    queryFn: async () => {
      const response = await fetch(`/api/iot/devices?productId=${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch IoT devices");
      return response.json();
    },
    enabled: !!params.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/products/${params.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product deleted",
        description: "The product has been permanently removed.",
      });
      setLocation("/products");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const summarizeMutation = useMutation<AISummary>({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/summarize", { productId: params.id });
      return response.json();
    },
  });

  const sustainabilityMutation = useMutation<SustainabilityInsight>({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/sustainability", { productId: params.id });
      return response.json();
    },
  });

  const repairMutation = useMutation<RepairSummary>({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/repair-summary", { productId: params.id });
      return response.json();
    },
  });

  const circularityMutation = useMutation<CircularityScore>({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/circularity", { productId: params.id });
      return response.json();
    },
  });

  const riskMutation = useMutation<RiskAssessment>({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/risk-assessment", { productId: params.id });
      return response.json();
    },
  });

  const { data: existingInsights } = useQuery<AIInsight[]>({
    queryKey: ["/api/products", params.id, "insights"],
    enabled: !!params.id,
  });

  const getStoredInsight = <T,>(type: string): T | undefined => {
    if (!existingInsights) return undefined;
    const insight = existingInsights.find(i => i.insightType === type);
    return insight?.content as T | undefined;
  };

  const storedSummary = summarizeMutation.data || getStoredInsight<AISummary>("summary");
  const storedSustainability = sustainabilityMutation.data || getStoredInsight<SustainabilityInsight>("sustainability");
  const storedRepair = repairMutation.data || getStoredInsight<RepairSummary>("repair");
  const storedCircularity = circularityMutation.data || getStoredInsight<CircularityScore>("circularity");
  const storedRisk = riskMutation.data || getStoredInsight<RiskAssessment>("risk_assessment");

  const addTraceMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/products/${params.id}/trace`, {
        eventType: traceForm.eventType,
        actor: traceForm.actor,
        location: traceForm.location ? { name: traceForm.location } : undefined,
        description: traceForm.description || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products", params.id, "trace"] });
      setTraceDialogOpen(false);
      setTraceForm({ eventType: "shipped", actor: "", location: "", description: "" });
      toast({
        title: "Event recorded",
        description: "Supply chain event has been added to the timeline.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const downloadQrCode = () => {
    if (!product?.qrCodeData) return;
    const link = document.createElement("a");
    link.href = product.qrCodeData;
    link.download = `qr-${product.batchNumber}.png`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Product not found</h2>
        <p className="text-muted-foreground mb-6">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/products">
          <Button data-testid="button-back-to-products">Back to Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" data-testid="text-product-name">
              {product.productName}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 flex-wrap">
              <span>{product.manufacturer}</span>
              <Badge variant="secondary" className="font-mono text-xs">
                {product.batchNumber}
              </Badge>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/product/${params.id}`} target="_blank">
            <Button variant="outline" data-testid="button-public-view">
              <ExternalLink className="mr-2 h-4 w-4" />
              Public View
            </Button>
          </Link>
          <Link href={`/products/${params.id}/edit`}>
            <Button variant="outline" data-testid="button-edit">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" data-testid="button-delete">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{product.productName}"? This action
                  cannot be undone and will permanently remove the Digital Product
                  Passport.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate()}
                  className="bg-destructive text-destructive-foreground"
                  data-testid="button-confirm-delete"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="border-b px-4">
                  <TabsList className="h-12 bg-transparent p-0">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                      data-testid="tab-overview"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="sustainability"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                      data-testid="tab-sustainability"
                    >
                      Sustainability
                    </TabsTrigger>
                    <TabsTrigger
                      value="lifecycle"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                      data-testid="tab-lifecycle"
                    >
                      Lifecycle
                    </TabsTrigger>
                    <TabsTrigger
                      value="ai-insights"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                      data-testid="tab-ai-insights"
                    >
                      AI Insights
                    </TabsTrigger>
                    <TabsTrigger
                      value="traceability"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                      data-testid="tab-traceability"
                    >
                      Traceability
                    </TabsTrigger>
                    <TabsTrigger
                      value="iot-devices"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                      data-testid="tab-iot-devices"
                    >
                      IoT Devices
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="overview" className="p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Factory className="h-4 w-4" />
                      Product Identification
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Manufacturer</div>
                        <p className="font-medium" data-testid="text-manufacturer">{product.manufacturer}</p>
                        {product.manufacturerAddress && (
                          <p className="text-xs text-muted-foreground" data-testid="text-manufacturer-address">{product.manufacturerAddress}</p>
                        )}
                      </div>
                      {product.countryOfOrigin && (
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Country of Origin</div>
                          <p className="font-medium" data-testid="text-country">{product.countryOfOrigin}</p>
                        </div>
                      )}
                      {product.productCategory && (
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Category</div>
                          <Badge variant="outline" data-testid="badge-category">{product.productCategory}</Badge>
                        </div>
                      )}
                      {product.modelNumber && (
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Model Number</div>
                          <p className="font-mono font-medium" data-testid="text-model">{product.modelNumber}</p>
                        </div>
                      )}
                      {product.sku && (
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">SKU</div>
                          <p className="font-mono font-medium" data-testid="text-sku">{product.sku}</p>
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Batch Number</div>
                        <p className="font-mono font-medium" data-testid="text-batch">{product.batchNumber}</p>
                      </div>
                      {product.lotNumber && (
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Lot Number</div>
                          <p className="font-mono font-medium" data-testid="text-lot">{product.lotNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Materials & Composition
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-4" data-testid="text-materials">
                      {product.materials}
                    </p>
                    {product.materialBreakdown && product.materialBreakdown.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <div className="text-sm font-medium">Material Breakdown</div>
                        <div className="space-y-2">
                          {product.materialBreakdown.map((mat, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span>{mat.material}</span>
                                  <span className="text-muted-foreground">{mat.percentage}%</span>
                                </div>
                                <Progress value={mat.percentage} className="h-1.5" />
                              </div>
                              {mat.recyclable && (
                                <Badge variant="outline" className="text-xs">
                                  <Recycle className="h-3 w-3 mr-1" />
                                  Recyclable
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="grid gap-4 sm:grid-cols-3">
                      {product.recycledContentPercent !== null && product.recycledContentPercent !== undefined && (
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Recycled Content</div>
                          <p className="text-2xl font-bold text-green-600" data-testid="text-recycled-content">
                            {product.recycledContentPercent}%
                          </p>
                        </div>
                      )}
                      {product.recyclabilityPercent !== null && product.recyclabilityPercent !== undefined && (
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Recyclability</div>
                          <p className="text-2xl font-bold text-green-600" data-testid="text-recyclability">
                            {product.recyclabilityPercent}%
                          </p>
                        </div>
                      )}
                    </div>
                    {product.hazardousMaterials && (
                      <Card className="mt-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-amber-800 dark:text-amber-200">Hazardous Materials</div>
                              <p className="text-sm text-amber-700 dark:text-amber-300" data-testid="text-hazardous">
                                {product.hazardousMaterials}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="sustainability" className="p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Leaf className="h-4 w-4" />
                      Environmental Impact
                    </h3>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Leaf className="h-4 w-4" />
                          Carbon Footprint
                        </div>
                        <div className="text-3xl font-bold" data-testid="text-carbon">
                          {product.carbonFootprint}
                          <span className="text-lg font-normal text-muted-foreground ml-1">kg CO2e</span>
                        </div>
                      </div>
                      {product.waterUsage !== null && product.waterUsage !== undefined && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Droplets className="h-4 w-4" />
                            Water Usage
                          </div>
                          <div className="text-3xl font-bold" data-testid="text-water">
                            {product.waterUsage}
                            <span className="text-lg font-normal text-muted-foreground ml-1">L</span>
                          </div>
                        </div>
                      )}
                      {product.energyConsumption !== null && product.energyConsumption !== undefined && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Zap className="h-4 w-4" />
                            Energy Consumption
                          </div>
                          <div className="text-3xl font-bold" data-testid="text-energy">
                            {product.energyConsumption}
                            <span className="text-lg font-normal text-muted-foreground ml-1">kWh</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {product.environmentalCertifications && product.environmentalCertifications.length > 0 && (
                      <div className="mt-6">
                        <div className="text-sm text-muted-foreground mb-2">Environmental Certifications</div>
                        <div className="flex flex-wrap gap-2">
                          {product.environmentalCertifications.map((cert, i) => (
                            <Badge key={i} variant="outline" data-testid={`badge-env-cert-${i}`}>
                              <Award className="h-3 w-3 mr-1" />
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Durability & Repairability
                    </h3>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Repairability Score</div>
                        <div className="text-3xl font-bold" data-testid="text-repairability">
                          {product.repairabilityScore}
                          <span className="text-lg font-normal text-muted-foreground">/10</span>
                        </div>
                        <Progress value={product.repairabilityScore * 10} className="h-2" />
                      </div>
                      {product.expectedLifespanYears !== null && product.expectedLifespanYears !== undefined && (
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Expected Lifespan</div>
                          <div className="text-3xl font-bold" data-testid="text-lifespan">
                            {product.expectedLifespanYears}
                            <span className="text-lg font-normal text-muted-foreground ml-1">years</span>
                          </div>
                        </div>
                      )}
                      {product.sparePartsAvailable !== null && product.sparePartsAvailable !== undefined && (
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Spare Parts</div>
                          <Badge variant={product.sparePartsAvailable ? "default" : "secondary"} data-testid="badge-spare-parts">
                            {product.sparePartsAvailable ? "Available" : "Not Available"}
                          </Badge>
                        </div>
                      )}
                    </div>
                    {product.repairInstructions && (
                      <Card className="mt-4 bg-muted/50">
                        <CardContent className="p-4">
                          <div className="text-sm font-medium mb-1">Repair Instructions</div>
                          <p className="text-sm text-muted-foreground" data-testid="text-repair-instructions">
                            {product.repairInstructions}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                    {product.serviceCenters && product.serviceCenters.length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm font-medium mb-2">Service Centers</div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {product.serviceCenters.map((center, i) => (
                            <Card key={i} className="bg-muted/50">
                              <CardContent className="p-3">
                                <div className="font-medium text-sm">{center.name}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {center.location}
                                </div>
                                {center.contact && (
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {center.contact}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="lifecycle" className="p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Ownership & Lifecycle
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
                      {product.dateOfManufacture && (
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Date of Manufacture</div>
                          <p className="font-medium" data-testid="text-manufacture-date">
                            {new Date(product.dateOfManufacture).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {product.dateOfFirstSale && (
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Date of First Sale</div>
                          <p className="font-medium" data-testid="text-first-sale-date">
                            {new Date(product.dateOfFirstSale).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Warranty Information
                      </h4>
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <p className="leading-relaxed" data-testid="text-warranty">
                            {product.warrantyInfo}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Compliance & Certifications
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.ceMarking && (
                        <Badge variant="default" data-testid="badge-ce">CE Marked</Badge>
                      )}
                      {product.safetyCertifications && product.safetyCertifications.map((cert, i) => (
                        <Badge key={i} variant="outline" data-testid={`badge-safety-cert-${i}`}>
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Recycle className="h-4 w-4" />
                      End-of-Life & Recycling
                    </h3>
                    <div className="space-y-4">
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="text-sm font-medium mb-1">Recycling Instructions</div>
                          <p className="text-sm text-muted-foreground whitespace-pre-line" data-testid="text-recycling">
                            {product.recyclingInstructions}
                          </p>
                        </CardContent>
                      </Card>
                      {product.disassemblyInstructions && (
                        <Card className="bg-muted/50">
                          <CardContent className="p-4">
                            <div className="text-sm font-medium mb-1">Disassembly Instructions</div>
                            <p className="text-sm text-muted-foreground" data-testid="text-disassembly">
                              {product.disassemblyInstructions}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                      {product.hazardWarnings && (
                        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                              <div>
                                <div className="text-sm font-medium text-amber-800 dark:text-amber-200">Hazard Warnings</div>
                                <p className="text-sm text-amber-700 dark:text-amber-300" data-testid="text-hazard-warnings">
                                  {product.hazardWarnings}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      {product.takeBackPrograms && product.takeBackPrograms.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">Take-Back Programs</div>
                          <div className="flex flex-wrap gap-2">
                            {product.takeBackPrograms.map((program, i) => (
                              <Badge key={i} variant="outline" data-testid={`badge-takeback-${i}`}>
                                <Recycle className="h-3 w-3 mr-1" />
                                {program}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ai-insights" className="p-6 space-y-6">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Product Summary
                        </CardTitle>
                        <CardDescription>
                          AI-generated overview of this product
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {storedSummary ? (
                          <div className="space-y-3">
                            <p className="leading-relaxed" data-testid="text-ai-summary">
                              {storedSummary.summary}
                            </p>
                            {storedSummary.keyFeatures?.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Key Features:</p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                  {storedSummary.keyFeatures.map((feature, i) => (
                                    <li key={i} data-testid={`text-feature-${i}`}>{feature}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => summarizeMutation.mutate()}
                            disabled={summarizeMutation.isPending}
                            data-testid="button-generate-summary"
                          >
                            {summarizeMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Summary
                          </Button>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Leaf className="h-4 w-4" />
                          Sustainability Insights
                        </CardTitle>
                        <CardDescription>
                          AI-powered environmental analysis
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {storedSustainability ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl font-bold" data-testid="text-sustainability-score">
                                {storedSustainability.overallScore}/100
                              </div>
                              <Progress
                                value={storedSustainability.overallScore}
                                className="flex-1 h-2"
                              />
                            </div>
                            <p className="text-sm text-muted-foreground" data-testid="text-ai-sustainability">
                              {storedSustainability.carbonAnalysis}
                            </p>
                            {storedSustainability.improvements?.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Improvement Suggestions:</p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                  {storedSustainability.improvements.map((item, i) => (
                                    <li key={i} data-testid={`text-improvement-${i}`}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => sustainabilityMutation.mutate()}
                            disabled={sustainabilityMutation.isPending}
                            data-testid="button-generate-sustainability"
                          >
                            {sustainabilityMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            <Leaf className="mr-2 h-4 w-4" />
                            Analyze Sustainability
                          </Button>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Wrench className="h-4 w-4" />
                          Repair Guide
                        </CardTitle>
                        <CardDescription>
                          AI-generated repair recommendations
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {storedRepair ? (
                          <div className="space-y-4">
                            <Badge variant="secondary" className="text-sm" data-testid="badge-repair-rating">
                              {storedRepair.repairabilityRating}
                            </Badge>
                            {storedRepair.repairInstructions?.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Repair Steps:</p>
                                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                                  {storedRepair.repairInstructions.map((step, i) => (
                                    <li key={i} data-testid={`text-repair-step-${i}`}>{step}</li>
                                  ))}
                                </ol>
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground" data-testid="text-ai-repair">
                              Parts availability: {storedRepair.partsAvailability}
                            </p>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => repairMutation.mutate()}
                            disabled={repairMutation.isPending}
                            data-testid="button-generate-repair"
                          >
                            {repairMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            <Wrench className="mr-2 h-4 w-4" />
                            Generate Repair Guide
                          </Button>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Recycle className="h-4 w-4" />
                          Circularity Score
                        </CardTitle>
                        <CardDescription>
                          AI-powered material efficiency and recyclability analysis
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {storedCircularity ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="text-3xl font-bold" data-testid="text-circularity-score">
                                {storedCircularity.score}
                              </div>
                              <Badge 
                                variant={storedCircularity.grade === "A+" || storedCircularity.grade === "A" ? "default" : "secondary"} 
                                className="text-lg"
                                data-testid="badge-circularity-grade"
                              >
                                Grade: {storedCircularity.grade}
                              </Badge>
                            </div>
                            <Progress value={storedCircularity.score} className="h-2" />
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <p className="text-sm font-medium mb-1">Recyclability Analysis</p>
                                <p className="text-sm text-muted-foreground" data-testid="text-recyclability-analysis">
                                  {storedCircularity.recyclabilityAnalysis}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Material Efficiency</p>
                                <p className="text-sm text-muted-foreground" data-testid="text-material-efficiency">
                                  {storedCircularity.materialEfficiency}
                                </p>
                              </div>
                            </div>
                            {storedCircularity.endOfLifeOptions?.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">End-of-Life Options:</p>
                                <div className="flex flex-wrap gap-2">
                                  {storedCircularity.endOfLifeOptions.map((option, i) => (
                                    <Badge key={i} variant="outline" data-testid={`badge-eol-${i}`}>
                                      {option}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => circularityMutation.mutate()}
                            disabled={circularityMutation.isPending}
                            data-testid="button-generate-circularity"
                          >
                            {circularityMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            <Recycle className="mr-2 h-4 w-4" />
                            Analyze Circularity
                          </Button>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Risk Assessment
                        </CardTitle>
                        <CardDescription>
                          AI-powered risk flags and compliance analysis
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {storedRisk ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge 
                                variant={storedRisk.overallRisk === "Low" ? "default" : storedRisk.overallRisk === "Medium" ? "secondary" : "destructive"}
                                className="text-sm"
                                data-testid="badge-risk-level"
                              >
                                Risk Level: {storedRisk.overallRisk}
                              </Badge>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Data Completeness:</span>
                                <span className="font-medium" data-testid="text-data-completeness">{storedRisk.dataCompleteness}%</span>
                              </div>
                            </div>
                            <Progress value={storedRisk.dataCompleteness} className="h-2" />
                            
                            <div>
                              <p className="text-sm font-medium mb-1">Counterfeit Risk</p>
                              <p className="text-sm text-muted-foreground" data-testid="text-counterfeit-risk">
                                {storedRisk.counterfeitRisk}
                              </p>
                            </div>

                            {storedRisk.riskFlags?.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Risk Flags:</p>
                                <div className="space-y-2">
                                  {storedRisk.riskFlags.map((flag, i) => (
                                    <div 
                                      key={i} 
                                      className="flex items-start gap-2 p-2 rounded-md bg-muted/50"
                                      data-testid={`risk-flag-${i}`}
                                    >
                                      <Badge 
                                        variant={flag.severity === "Low" ? "outline" : flag.severity === "Medium" ? "secondary" : "destructive"}
                                        className="text-xs shrink-0"
                                      >
                                        {flag.severity}
                                      </Badge>
                                      <div>
                                        <p className="text-sm font-medium">{flag.type}</p>
                                        <p className="text-xs text-muted-foreground">{flag.description}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {storedRisk.complianceIssues?.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Compliance Issues:</p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                  {storedRisk.complianceIssues.map((issue, i) => (
                                    <li key={i} data-testid={`text-compliance-issue-${i}`}>{issue}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => riskMutation.mutate()}
                            disabled={riskMutation.isPending}
                            data-testid="button-generate-risk"
                          >
                            {riskMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Analyze Risks
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="traceability" className="p-6 space-y-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Supply Chain Timeline
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Track this product's journey through the supply chain
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog open={traceDialogOpen} onOpenChange={setTraceDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" data-testid="button-add-trace-event">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Event
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Record Supply Chain Event</DialogTitle>
                            <DialogDescription>
                              Add a new event to track this product's journey
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="eventType">Event Type</Label>
                              <Select
                                value={traceForm.eventType}
                                onValueChange={(value) => setTraceForm({ ...traceForm, eventType: value })}
                              >
                                <SelectTrigger data-testid="select-event-type">
                                  <SelectValue placeholder="Select event type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {eventTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="actor">Performed By</Label>
                              <Input
                                id="actor"
                                placeholder="e.g., Warehouse Team, Quality Control"
                                value={traceForm.actor}
                                onChange={(e) => setTraceForm({ ...traceForm, actor: e.target.value })}
                                data-testid="input-trace-actor"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="location">Location (optional)</Label>
                              <Input
                                id="location"
                                placeholder="e.g., Berlin Distribution Center"
                                value={traceForm.location}
                                onChange={(e) => setTraceForm({ ...traceForm, location: e.target.value })}
                                data-testid="input-trace-location"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="description">Description (optional)</Label>
                              <Textarea
                                id="description"
                                placeholder="Additional details about this event..."
                                value={traceForm.description}
                                onChange={(e) => setTraceForm({ ...traceForm, description: e.target.value })}
                                data-testid="input-trace-description"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setTraceDialogOpen(false)}
                              data-testid="button-cancel-trace"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => addTraceMutation.mutate()}
                              disabled={!traceForm.actor || addTraceMutation.isPending}
                              data-testid="button-save-trace"
                            >
                              {addTraceMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Record Event
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/products", params.id, "trace"] })}
                        data-testid="button-refresh-trace"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                      </Button>
                    </div>
                  </div>

                  {isLoadingTrace ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : traceEvents && traceEvents.length > 0 ? (
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                      <div className="space-y-6">
                        {traceEvents.map((event, index) => (
                          <div
                            key={event.id}
                            className="relative pl-10"
                            data-testid={`trace-event-${event.id}`}
                          >
                            <div className="absolute left-2 w-5 h-5 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                              {event.eventType === "manufactured" && <Factory className="h-3 w-3 text-primary" />}
                              {event.eventType === "shipped" && <Truck className="h-3 w-3 text-primary" />}
                              {event.eventType === "received" && <CheckCircle className="h-3 w-3 text-primary" />}
                              {event.eventType === "transferred" && <RefreshCw className="h-3 w-3 text-primary" />}
                              {!["manufactured", "shipped", "received", "transferred"].includes(event.eventType) && (
                                <Clock className="h-3 w-3 text-primary" />
                              )}
                            </div>
                            <Card>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="secondary" className="capitalize">
                                        {event.eventType.replace("_", " ")}
                                      </Badge>
                                      <span className="text-sm text-muted-foreground">
                                        by {event.actor}
                                      </span>
                                    </div>
                                    {event.description && (
                                      <p className="text-sm">{event.description}</p>
                                    )}
                                    {event.location && (
                                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                        <MapPin className="h-3 w-3" />
                                        {event.location.name}
                                        {event.location.address && `, ${event.location.address}`}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {new Date(event.timestamp).toLocaleDateString()}
                                    </div>
                                    <div>
                                      {new Date(event.timestamp).toLocaleTimeString()}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Card className="bg-muted/50">
                      <CardContent className="p-8 text-center">
                        <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          No trace events recorded yet. Events will appear here as the product
                          moves through the supply chain.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="iot-devices" className="p-6 space-y-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Wifi className="h-5 w-5" />
                        Connected IoT Devices
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        NFC, RFID, and BLE tags linked to this product
                      </p>
                    </div>
                  </div>

                  {isLoadingIoT ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : iotDevices && iotDevices.length > 0 ? (
                    <div className="space-y-3">
                      {iotDevices.map((device) => {
                        const DeviceIcon = device.deviceType === "nfc" ? Radio
                          : device.deviceType === "rfid" ? Signal
                          : device.deviceType === "ble" ? Bluetooth
                          : Wifi;
                        return (
                          <Card key={device.id} data-testid={`iot-device-card-${device.id}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                                  <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium font-mono text-sm" data-testid={`text-iot-device-id-${device.id}`}>
                                      {device.deviceId}
                                    </span>
                                    <Badge variant="outline" className="uppercase text-xs" data-testid={`badge-iot-type-${device.id}`}>
                                      {device.deviceType}
                                    </Badge>
                                    <Badge variant={device.status === "active" ? "default" : "secondary"} data-testid={`badge-iot-status-${device.id}`}>
                                      {device.status}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {device.manufacturer} {device.model}
                                  </p>
                                </div>
                                <div className="text-right text-sm text-muted-foreground">
                                  {device.lastSeenAt ? (
                                    <>
                                      Last seen
                                      <br />
                                      {new Date(device.lastSeenAt).toLocaleDateString()}
                                    </>
                                  ) : (
                                    "Never scanned"
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Card className="bg-muted/50">
                      <CardContent className="p-8 text-center">
                        <Wifi className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          No IoT devices linked to this product yet. Register NFC, RFID, or BLE tags to enable physical-digital tracking.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code
              </CardTitle>
              <CardDescription>Scan to view product passport</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center bg-white rounded-lg p-4">
                {product.qrCodeData ? (
                  <img
                    src={product.qrCodeData}
                    alt="Product QR Code"
                    className="w-48 h-48"
                    data-testid="img-qr-code"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                )}
              </div>
              <p className="text-center font-mono text-sm text-muted-foreground">
                {product.batchNumber}
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={downloadQrCode}
                disabled={!product.qrCodeData}
                data-testid="button-download-qr"
              >
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
            </CardContent>
          </Card>

          {product.productImage && (
            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square w-full rounded-lg overflow-hidden bg-muted">
                  <img
                    src={product.productImage}
                    alt={product.productName}
                    className="w-full h-full object-cover"
                    data-testid="img-product"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
