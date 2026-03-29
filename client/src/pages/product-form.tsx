import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams, Link } from "wouter";
import { usePrefixedLink } from "@/hooks/use-route-prefix";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Package, ShieldCheck, Zap, AlertTriangle, Recycle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Product, DppRegionalExtension } from "@shared/schema";

const productFormSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  batchNumber: z.string().min(1, "Batch number is required"),
  materials: z.string().min(1, "Materials are required"),
  carbonFootprint: z.number().min(0, "Carbon footprint must be positive"),
  repairabilityScore: z.number().min(1).max(10),
  warrantyInfo: z.string().min(1, "Warranty info is required"),
  recyclingInstructions: z.string().min(1, "Recycling instructions are required"),
  productImage: z.string().optional(),
  ownershipHistory: z.array(z.object({
    owner: z.string(),
    date: z.string(),
    action: z.string(),
  })).optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface EUFormState {
  espr: {
    productCategory: string;
    complianceStatus: "compliant" | "pending" | "non_compliant";
    dppVersion: string;
    validFrom: string;
    validUntil: string;
  };
  ceMarking: boolean;
  eprRegistrationId: string;
  repairabilityIndex: string;
  hasBattery: boolean;
  battery: {
    batteryType: "ev" | "industrial" | "portable" | "light_means_of_transport";
    stateOfHealth: string;
    carbonFootprintClass: string;
    recycledContentCobalt: string;
    recycledContentLithium: string;
    recycledContentNickel: string;
    cobaltSourcingDueDiligence: boolean;
  };
  hasReach: boolean;
  reach: {
    scipId: string;
    svhcPresent: boolean;
    svhcSubstances: string;
  };
}

const defaultEUState: EUFormState = {
  espr: { productCategory: "", complianceStatus: "pending", dppVersion: "1.0", validFrom: "", validUntil: "" },
  ceMarking: false,
  eprRegistrationId: "",
  repairabilityIndex: "",
  hasBattery: false,
  battery: {
    batteryType: "industrial",
    stateOfHealth: "",
    carbonFootprintClass: "",
    recycledContentCobalt: "",
    recycledContentLithium: "",
    recycledContentNickel: "",
    cobaltSourcingDueDiligence: false,
  },
  hasReach: false,
  reach: { scipId: "", svhcPresent: false, svhcSubstances: "" },
};

export default function ProductForm() {
  const link = usePrefixedLink();
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isEditing = Boolean(params.id);
  const [activeTab, setActiveTab] = useState("basic");
  const [eu, setEU] = useState<EUFormState>(defaultEUState);

  const setEUField = <K extends keyof EUFormState>(key: K, value: EUFormState[K]) =>
    setEU(prev => ({ ...prev, [key]: value }));

  const { data: product, isLoading: isLoadingProduct } = useQuery<Product>({
    queryKey: ["/api/products", params.id],
    enabled: isEditing,
  });

  const { data: euExt } = useQuery<DppRegionalExtension | null>({
    queryKey: ["/api/products", params.id, "regional-extensions", "EU"],
    enabled: isEditing,
    queryFn: async () => {
      const res = await fetch(`/api/products/${params.id}/regional-extensions/EU`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to load EU extension");
      return res.json();
    },
    retry: false,
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      productName: "",
      manufacturer: "",
      batchNumber: "",
      materials: "",
      carbonFootprint: 0,
      repairabilityScore: 5,
      warrantyInfo: "",
      recyclingInstructions: "",
      productImage: "",
      ownershipHistory: [],
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        productName: product.productName,
        manufacturer: product.manufacturer,
        batchNumber: product.batchNumber,
        materials: product.materials,
        carbonFootprint: product.carbonFootprint,
        repairabilityScore: product.repairabilityScore,
        warrantyInfo: product.warrantyInfo,
        recyclingInstructions: product.recyclingInstructions,
        productImage: product.productImage || "",
        ownershipHistory: product.ownershipHistory || [],
      });
    }
  }, [product, form]);

  useEffect(() => {
    if (euExt?.payload && (euExt.payload as any).EU) {
      const e = (euExt.payload as any).EU;
      setEU({
        espr: {
          productCategory: e.espr?.productCategory ?? "",
          complianceStatus: e.espr?.complianceStatus ?? "pending",
          dppVersion: e.espr?.dppVersion ?? "1.0",
          validFrom: e.espr?.validFrom ?? "",
          validUntil: e.espr?.validUntil ?? "",
        },
        ceMarking: e.ceMarking ?? false,
        eprRegistrationId: e.eprRegistrationId ?? "",
        repairabilityIndex: e.repairabilityIndex != null ? String(e.repairabilityIndex) : "",
        hasBattery: !!e.batteryRegulation,
        battery: {
          batteryType: e.batteryRegulation?.batteryType ?? "industrial",
          stateOfHealth: e.batteryRegulation?.stateOfHealth != null ? String(e.batteryRegulation.stateOfHealth) : "",
          carbonFootprintClass: e.batteryRegulation?.carbonFootprintClass ?? "",
          recycledContentCobalt: e.batteryRegulation?.recycledContentCobalt != null ? String(e.batteryRegulation.recycledContentCobalt) : "",
          recycledContentLithium: e.batteryRegulation?.recycledContentLithium != null ? String(e.batteryRegulation.recycledContentLithium) : "",
          recycledContentNickel: e.batteryRegulation?.recycledContentNickel != null ? String(e.batteryRegulation.recycledContentNickel) : "",
          cobaltSourcingDueDiligence: e.batteryRegulation?.cobaltSourcingDueDiligence ?? false,
        },
        hasReach: !!e.reach,
        reach: {
          scipId: e.reach?.scipId ?? "",
          svhcPresent: e.reach?.svhcPresent ?? false,
          svhcSubstances: e.reach?.svhcSubstances?.join(", ") ?? "",
        },
      });
    }
  }, [euExt]);

  const saveEUExtension = async (productId: string) => {
    if (!eu.espr.productCategory) return;
    const payload = {
      EU: {
        espr: {
          productCategory: eu.espr.productCategory,
          complianceStatus: eu.espr.complianceStatus,
          dppVersion: eu.espr.dppVersion || "1.0",
          ...(eu.espr.validFrom && { validFrom: eu.espr.validFrom }),
          ...(eu.espr.validUntil && { validUntil: eu.espr.validUntil }),
        },
        ceMarking: eu.ceMarking,
        ...(eu.eprRegistrationId && { eprRegistrationId: eu.eprRegistrationId }),
        ...(eu.repairabilityIndex && { repairabilityIndex: parseFloat(eu.repairabilityIndex) }),
        ...(eu.hasBattery && {
          batteryRegulation: {
            batteryType: eu.battery.batteryType,
            ...(eu.battery.stateOfHealth && { stateOfHealth: parseFloat(eu.battery.stateOfHealth) }),
            ...(eu.battery.carbonFootprintClass && { carbonFootprintClass: eu.battery.carbonFootprintClass }),
            ...(eu.battery.recycledContentCobalt && { recycledContentCobalt: parseFloat(eu.battery.recycledContentCobalt) }),
            ...(eu.battery.recycledContentLithium && { recycledContentLithium: parseFloat(eu.battery.recycledContentLithium) }),
            ...(eu.battery.recycledContentNickel && { recycledContentNickel: parseFloat(eu.battery.recycledContentNickel) }),
            cobaltSourcingDueDiligence: eu.battery.cobaltSourcingDueDiligence,
          },
        }),
        ...(eu.hasReach && {
          reach: {
            svhcPresent: eu.reach.svhcPresent,
            ...(eu.reach.scipId && { scipId: eu.reach.scipId }),
            ...(eu.reach.svhcSubstances && { svhcSubstances: eu.reach.svhcSubstances.split(",").map(s => s.trim()).filter(Boolean) }),
          },
        }),
      },
    };

    const body = {
      regionCode: "EU",
      schemaVersion: "1.0",
      complianceStatus: eu.espr.complianceStatus === "compliant" ? "compliant" : "pending",
      payload,
    };

    if (euExt?.id) {
      await apiRequest("PATCH", `/api/regional-extensions/${euExt.id}`, body);
    } else {
      await apiRequest("POST", `/api/products/${productId}/regional-extensions`, body);
    }
    queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "regional-extensions"] });
  };

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const response = await apiRequest("PUT", `/api/products/${params.id}`, data);
      return response.json();
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      let productId = params.id;
      if (isEditing) {
        await updateMutation.mutateAsync(data);
      } else {
        const created = await createMutation.mutateAsync(data);
        productId = created.id;
      }
      await saveEUExtension(productId!);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      if (params.id) queryClient.invalidateQueries({ queryKey: ["/api/products", params.id] });
      toast({
        title: isEditing ? "Product updated" : "Product created",
        description: "Your Digital Product Passport has been saved successfully.",
      });
      setLocation(link(`/products/${productId}`));
    } catch {
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEditing && isLoadingProduct) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const euComplete = !!eu.espr.productCategory;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={link(isEditing ? `/products/${params.id}` : "/products")}>
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" data-testid="text-form-title">
            {isEditing ? "Edit Product" : "Create Product"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update your Digital Product Passport" : "Create a new Digital Product Passport"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full sm:w-auto" data-testid="tabs-product-form">
              <TabsTrigger value="basic" className="gap-2" data-testid="tab-basic-info">
                <Package className="h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="eu" className="gap-2" data-testid="tab-eu-espr">
                <ShieldCheck className="h-4 w-4" />
                EU ESPR
                {euComplete && <Badge variant="default" className="bg-green-600 text-white text-xs ml-1 px-1.5 py-0">✓</Badge>}
              </TabsTrigger>
            </TabsList>

            {/* ─── Basic Info Tab ─────────────────────────────────── */}
            <TabsContent value="basic" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>Enter the core product details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Premium Wireless Headphones" {...field} data-testid="input-product-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="manufacturer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Manufacturer *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., TechCorp Inc." {...field} data-testid="input-manufacturer" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="batchNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Batch Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., BATCH-2024-001" className="font-mono" {...field} data-testid="input-batch-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="productImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} data-testid="input-product-image" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Materials & Sustainability</CardTitle>
                  <CardDescription>Environmental impact and composition details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="materials"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Materials *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., Recycled aluminum, sustainable bamboo, organic cotton..." className="min-h-24" {...field} data-testid="input-materials" />
                        </FormControl>
                        <FormDescription>List all materials used in this product</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="carbonFootprint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Carbon Footprint (kg CO2e) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                              data-testid="input-carbon-footprint"
                            />
                          </FormControl>
                          <FormDescription>Total lifecycle carbon emissions</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="repairabilityScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Repairability Score: {field.value}/10</FormLabel>
                          <FormControl>
                            <Slider
                              min={1}
                              max={10}
                              step={1}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="mt-2"
                              data-testid="slider-repairability"
                            />
                          </FormControl>
                          <FormDescription>How easy is this product to repair?</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lifecycle Data</CardTitle>
                  <CardDescription>Warranty, recycling, and ownership information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="warrantyInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warranty Information *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., 2-year manufacturer warranty covering defects..." className="min-h-24" {...field} data-testid="input-warranty-info" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="recyclingInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recycling Instructions *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., 1. Remove battery before disposal. 2. Separate plastic components..." className="min-h-24" {...field} data-testid="input-recycling" />
                        </FormControl>
                        <FormDescription>Step-by-step recycling guidance for end-of-life</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── EU ESPR Tab ─────────────────────────────────────── */}
            <TabsContent value="eu" className="space-y-6 mt-6">
              {/* ESPR Core */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                    ESPR — Regulation (EU) 2024/1781
                  </CardTitle>
                  <CardDescription>
                    Mandatory Digital Product Passport data under the EU Ecodesign for Sustainable Products Regulation.
                    <Badge variant="outline" className="ml-2 text-xs">Reg. (EU) 2024/1781</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="espr-category">Product Category *</Label>
                      <Input
                        id="espr-category"
                        placeholder="e.g., Batteries, Textiles, Electronics"
                        value={eu.espr.productCategory}
                        onChange={e => setEUField("espr", { ...eu.espr, productCategory: e.target.value })}
                        data-testid="input-espr-category"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="espr-status">Compliance Status</Label>
                      <Select
                        value={eu.espr.complianceStatus}
                        onValueChange={(v) => setEUField("espr", { ...eu.espr, complianceStatus: v as any })}
                      >
                        <SelectTrigger id="espr-status" data-testid="select-espr-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="compliant">Compliant</SelectItem>
                          <SelectItem value="non_compliant">Non-compliant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="espr-version">DPP Version</Label>
                      <Input
                        id="espr-version"
                        placeholder="1.0"
                        value={eu.espr.dppVersion}
                        onChange={e => setEUField("espr", { ...eu.espr, dppVersion: e.target.value })}
                        data-testid="input-espr-version"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="espr-valid-from">Valid From</Label>
                      <Input
                        id="espr-valid-from"
                        type="date"
                        value={eu.espr.validFrom}
                        onChange={e => setEUField("espr", { ...eu.espr, validFrom: e.target.value })}
                        data-testid="input-espr-valid-from"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="espr-valid-until">Valid Until</Label>
                      <Input
                        id="espr-valid-until"
                        type="date"
                        value={eu.espr.validUntil}
                        onChange={e => setEUField("espr", { ...eu.espr, validUntil: e.target.value })}
                        data-testid="input-espr-valid-until"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CE Marking + EPR + Repairability */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-green-600" />
                    CE Marking, EPR &amp; Repairability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/20">
                    <Switch
                      id="ce-marking"
                      checked={eu.ceMarking}
                      onCheckedChange={v => setEUField("ceMarking", v)}
                      data-testid="switch-ce-marking"
                    />
                    <div>
                      <Label htmlFor="ce-marking" className="cursor-pointer font-medium">CE Marking</Label>
                      <p className="text-xs text-muted-foreground">Product bears the CE conformity mark</p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="epr-id">EPR Registration ID</Label>
                      <Input
                        id="epr-id"
                        placeholder="e.g., DE-EPR-BAT-2025-0842"
                        value={eu.eprRegistrationId}
                        onChange={e => setEUField("eprRegistrationId", e.target.value)}
                        className="font-mono"
                        data-testid="input-epr-id"
                      />
                      <p className="text-xs text-muted-foreground">Extended Producer Responsibility registration number</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="repairability-index">Repairability Index (1–10)</Label>
                      <Input
                        id="repairability-index"
                        type="number"
                        min="1"
                        max="10"
                        step="0.1"
                        placeholder="e.g., 7.5"
                        value={eu.repairabilityIndex}
                        onChange={e => setEUField("repairabilityIndex", e.target.value)}
                        data-testid="input-repairability-index"
                      />
                      <p className="text-xs text-muted-foreground">EU repairability score under ESPR framework</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Battery Regulation */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-500" />
                      Battery Regulation 2023/1542
                    </CardTitle>
                    <Switch
                      checked={eu.hasBattery}
                      onCheckedChange={v => setEUField("hasBattery", v)}
                      data-testid="switch-battery-reg"
                    />
                  </div>
                  <CardDescription>
                    EU Battery Regulation — required for EV, industrial, and portable batteries above 2 kWh.
                    Toggle on if applicable.
                  </CardDescription>
                </CardHeader>
                {eu.hasBattery && (
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Battery Type</Label>
                        <Select
                          value={eu.battery.batteryType}
                          onValueChange={v => setEUField("battery", { ...eu.battery, batteryType: v as any })}
                        >
                          <SelectTrigger data-testid="select-battery-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ev">EV Battery</SelectItem>
                            <SelectItem value="industrial">Industrial</SelectItem>
                            <SelectItem value="portable">Portable</SelectItem>
                            <SelectItem value="light_means_of_transport">Light Means of Transport</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>State of Health (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="e.g., 95"
                          value={eu.battery.stateOfHealth}
                          onChange={e => setEUField("battery", { ...eu.battery, stateOfHealth: e.target.value })}
                          data-testid="input-battery-soh"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Carbon Footprint Class</Label>
                        <Input
                          placeholder="e.g., A, B, C"
                          value={eu.battery.carbonFootprintClass}
                          onChange={e => setEUField("battery", { ...eu.battery, carbonFootprintClass: e.target.value })}
                          data-testid="input-battery-carbon-class"
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-6">
                        <Switch
                          id="cobalt-due-diligence"
                          checked={eu.battery.cobaltSourcingDueDiligence}
                          onCheckedChange={v => setEUField("battery", { ...eu.battery, cobaltSourcingDueDiligence: v })}
                          data-testid="switch-cobalt-due-diligence"
                        />
                        <Label htmlFor="cobalt-due-diligence" className="cursor-pointer text-sm">
                          Cobalt sourcing due diligence completed
                        </Label>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-2 block">Recycled Content (%)</Label>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Cobalt</Label>
                          <Input type="number" min="0" max="100" placeholder="%" value={eu.battery.recycledContentCobalt} onChange={e => setEUField("battery", { ...eu.battery, recycledContentCobalt: e.target.value })} data-testid="input-recycled-cobalt" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Lithium</Label>
                          <Input type="number" min="0" max="100" placeholder="%" value={eu.battery.recycledContentLithium} onChange={e => setEUField("battery", { ...eu.battery, recycledContentLithium: e.target.value })} data-testid="input-recycled-lithium" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Nickel</Label>
                          <Input type="number" min="0" max="100" placeholder="%" value={eu.battery.recycledContentNickel} onChange={e => setEUField("battery", { ...eu.battery, recycledContentNickel: e.target.value })} data-testid="input-recycled-nickel" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* REACH */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      REACH — Chemical Compliance
                    </CardTitle>
                    <Switch
                      checked={eu.hasReach}
                      onCheckedChange={v => setEUField("hasReach", v)}
                      data-testid="switch-reach"
                    />
                  </div>
                  <CardDescription>
                    REACH Regulation (EC) 1907/2006 — required if the product contains substances of very high concern (SVHC).
                  </CardDescription>
                </CardHeader>
                {eu.hasReach && (
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="scip-id">SCIP ID</Label>
                        <Input
                          id="scip-id"
                          placeholder="ECHA SCIP database ID"
                          value={eu.reach.scipId}
                          onChange={e => setEUField("reach", { ...eu.reach, scipId: e.target.value })}
                          className="font-mono"
                          data-testid="input-scip-id"
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-6">
                        <Switch
                          id="svhc-present"
                          checked={eu.reach.svhcPresent}
                          onCheckedChange={v => setEUField("reach", { ...eu.reach, svhcPresent: v })}
                          data-testid="switch-svhc"
                        />
                        <div>
                          <Label htmlFor="svhc-present" className="cursor-pointer font-medium text-sm">SVHC Present</Label>
                          <p className="text-xs text-muted-foreground">Contains substances of very high concern (&gt;0.1% by weight)</p>
                        </div>
                      </div>
                    </div>
                    {eu.reach.svhcPresent && (
                      <div className="space-y-2">
                        <Label htmlFor="svhc-substances">SVHC Substances</Label>
                        <Input
                          id="svhc-substances"
                          placeholder="e.g., Lead, Cadmium, Hexavalent chromium (comma-separated)"
                          value={eu.reach.svhcSubstances}
                          onChange={e => setEUField("reach", { ...eu.reach, svhcSubstances: e.target.value })}
                          data-testid="input-svhc-substances"
                        />
                        <p className="text-xs text-muted-foreground">Comma-separated list of SVHC substances present</p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>

              {!euComplete && (
                <div className="flex items-center gap-2 p-3 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 rounded-md text-sm text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  Fill in the Product Category under ESPR above to save EU compliance data.
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
            <Link href={link(isEditing ? `/products/${params.id}` : "/products")}>
              <Button type="button" variant="outline" data-testid="button-cancel">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isPending} data-testid="button-submit">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
