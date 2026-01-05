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
import type { Product, AISummary, SustainabilityInsight, RepairSummary, TraceEvent, IoTDevice } from "@shared/schema";

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
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Factory className="h-4 w-4" />
                        Manufacturer
                      </div>
                      <p className="font-medium" data-testid="text-manufacturer">
                        {product.manufacturer}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Hash className="h-4 w-4" />
                        Batch Number
                      </div>
                      <p className="font-mono font-medium" data-testid="text-batch">
                        {product.batchNumber}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Materials
                    </h3>
                    <p className="text-muted-foreground leading-relaxed" data-testid="text-materials">
                      {product.materials}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="sustainability" className="p-6 space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Leaf className="h-4 w-4" />
                        Carbon Footprint
                      </div>
                      <div className="text-3xl font-bold" data-testid="text-carbon">
                        {product.carbonFootprint}
                        <span className="text-lg font-normal text-muted-foreground ml-1">
                          kg CO2e
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Total lifecycle carbon emissions
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Wrench className="h-4 w-4" />
                        Repairability Score
                      </div>
                      <div className="text-3xl font-bold" data-testid="text-repairability">
                        {product.repairabilityScore}
                        <span className="text-lg font-normal text-muted-foreground">/10</span>
                      </div>
                      <Progress
                        value={product.repairabilityScore * 10}
                        className="h-2"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="lifecycle" className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Warranty Information
                      </h3>
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <p className="leading-relaxed" data-testid="text-warranty">
                            {product.warrantyInfo}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Recycle className="h-4 w-4" />
                        Recycling Instructions
                      </h3>
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <p className="leading-relaxed whitespace-pre-line" data-testid="text-recycling">
                            {product.recyclingInstructions}
                          </p>
                        </CardContent>
                      </Card>
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
                        {summarizeMutation.data ? (
                          <div className="space-y-3">
                            <p className="leading-relaxed" data-testid="text-ai-summary">
                              {summarizeMutation.data.summary}
                            </p>
                            {summarizeMutation.data.keyFeatures?.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Key Features:</p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                  {summarizeMutation.data.keyFeatures.map((feature, i) => (
                                    <li key={i}>{feature}</li>
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
                        {sustainabilityMutation.data ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl font-bold">
                                {sustainabilityMutation.data.overallScore}/100
                              </div>
                              <Progress
                                value={sustainabilityMutation.data.overallScore}
                                className="flex-1 h-2"
                              />
                            </div>
                            <p className="text-sm text-muted-foreground" data-testid="text-ai-sustainability">
                              {sustainabilityMutation.data.carbonAnalysis}
                            </p>
                            {sustainabilityMutation.data.improvements?.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Improvement Suggestions:</p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                  {sustainabilityMutation.data.improvements.map((item, i) => (
                                    <li key={i}>{item}</li>
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
                        {repairMutation.data ? (
                          <div className="space-y-4">
                            <Badge variant="secondary" className="text-sm">
                              {repairMutation.data.repairabilityRating}
                            </Badge>
                            {repairMutation.data.repairInstructions?.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Repair Steps:</p>
                                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                                  {repairMutation.data.repairInstructions.map((step, i) => (
                                    <li key={i}>{step}</li>
                                  ))}
                                </ol>
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground" data-testid="text-ai-repair">
                              Parts availability: {repairMutation.data.partsAvailability}
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
