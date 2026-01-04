import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Package, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
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
import type { Product } from "@shared/schema";

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

export default function ProductForm() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isEditing = Boolean(params.id);

  const { data: product, isLoading: isLoadingProduct } = useQuery<Product>({
    queryKey: ["/api/products", params.id],
    enabled: isEditing,
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

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product created",
        description: "Your Digital Product Passport has been created successfully.",
      });
      setLocation(`/products/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const response = await apiRequest("PUT", `/api/products/${params.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products", params.id] });
      toast({
        title: "Product updated",
        description: "Your Digital Product Passport has been updated successfully.",
      });
      setLocation(`/products/${params.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={isEditing ? `/products/${params.id}` : "/products"}>
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" data-testid="text-form-title">
            {isEditing ? "Edit Product" : "Create Product"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Update your Digital Product Passport"
              : "Create a new Digital Product Passport"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Enter the core product details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Premium Wireless Headphones"
                        {...field}
                        data-testid="input-product-name"
                      />
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
                        <Input
                          placeholder="e.g., TechCorp Inc."
                          {...field}
                          data-testid="input-manufacturer"
                        />
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
                        <Input
                          placeholder="e.g., BATCH-2024-001"
                          className="font-mono"
                          {...field}
                          data-testid="input-batch-number"
                        />
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
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                          data-testid="input-product-image"
                        />
                        <Button type="button" variant="outline" size="icon" disabled>
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter a URL to the product image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Materials & Sustainability</CardTitle>
              <CardDescription>
                Environmental impact and composition details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="materials"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Materials *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Recycled aluminum, sustainable bamboo, organic cotton..."
                        className="min-h-24"
                        {...field}
                        data-testid="input-materials"
                      />
                    </FormControl>
                    <FormDescription>
                      List all materials used in this product
                    </FormDescription>
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
                          onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          data-testid="input-carbon-footprint"
                        />
                      </FormControl>
                      <FormDescription>
                        Total lifecycle carbon emissions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="repairabilityScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Repairability Score: {field.value}/10
                      </FormLabel>
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
                      <FormDescription>
                        How easy is this product to repair?
                      </FormDescription>
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
              <CardDescription>
                Warranty, recycling, and ownership information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="warrantyInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warranty Information *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 2-year manufacturer warranty covering defects in materials and workmanship..."
                        className="min-h-24"
                        {...field}
                        data-testid="input-warranty-info"
                      />
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
                      <Textarea
                        placeholder="e.g., 1. Remove battery before disposal. 2. Separate plastic components. 3. Take to certified e-waste recycler..."
                        className="min-h-24"
                        {...field}
                        data-testid="input-recycling"
                      />
                    </FormControl>
                    <FormDescription>
                      Step-by-step recycling guidance for end-of-life
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href={isEditing ? `/products/${params.id}` : "/products"}>
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
