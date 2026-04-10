import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { usePrefixedLink } from "@/hooks/use-route-prefix";
import {
  Package,
  Plus,
  Search,
  Grid3X3,
  List,
  QrCode,
  Recycle,
  Sparkles,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  Building2,
  Loader2,
  PrinterCheck,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

// ─── Import Dialog ─────────────────────────────────────────────────────────
type ImportStep = "upload" | "preview" | "importing" | "done";

interface ImportPreview {
  totalRows: number;
  headers: string[];
  mapping: Record<string, string>;
  preview: Record<string, any>[];
}

interface ImportResult {
  created: number;
  skipped: number;
  failed: number;
  errors: string[];
  importBatchId: string;
  productIds: string[];
}

function ImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<ImportStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [businessUnit, setBusinessUnit] = useState("");
  const [dragging, setDragging] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  const reset = () => {
    setStep("upload");
    setFile(null);
    setPreview(null);
    setResult(null);
    setBusinessUnit("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const processFile = async (f: File) => {
    setFile(f);
    setPreviewLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const resp = await fetch("/api/products/bulk-import?preview=true", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Failed to parse file");
      }
      const data: ImportPreview = await resp.json();
      setPreview(data);
      setStep("preview");
    } catch (e: any) {
      toast({ title: "Preview failed", description: e.message, variant: "destructive" });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  }, []);

  const handleImport = async () => {
    if (!file) return;
    setStep("importing");
    setImportLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (businessUnit) fd.append("businessUnit", businessUnit);
      const resp = await fetch("/api/products/bulk-import", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Import failed");
      }
      const data: ImportResult = await resp.json();
      setResult(data);
      setStep("done");
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: `Import complete`, description: `${data.created} products created` });
    } catch (e: any) {
      toast({ title: "Import failed", description: e.message, variant: "destructive" });
      setStep("preview");
    } finally {
      setImportLoading(false);
    }
  };

  const downloadTemplate = () => {
    window.open("/api/products/import-template", "_blank");
  };

  const mappedCount = preview ? Object.keys(preview.mapping).length : 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-bulk-import">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Bulk Import Products
          </DialogTitle>
          <DialogDescription>
            Upload an Excel or CSV file to create multiple Digital Product Passports at once.
          </DialogDescription>
        </DialogHeader>

        {/* Step: Upload */}
        {step === "upload" && (
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${dragging ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              data-testid="dropzone-file"
            >
              {previewLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Analyzing file…</p>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium mb-1">Drop your file here or click to browse</p>
                  <p className="text-sm text-muted-foreground">Supports .xlsx, .xls, .csv — up to 25 MB</p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
              data-testid="input-import-file"
            />
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
              <FileSpreadsheet className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Need a template?</p>
                <p className="text-xs text-muted-foreground">Download our pre-formatted Excel template with all supported columns and an example row.</p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadTemplate} data-testid="button-download-template">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Template
              </Button>
            </div>
          </div>
        )}

        {/* Step: Preview */}
        {step === "preview" && preview && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <div className="flex-1 text-sm">
                <p className="font-medium">{preview.totalRows} rows detected in <span className="font-mono">{file?.name}</span></p>
                <p className="text-muted-foreground mt-0.5">
                  {mappedCount} of {preview.headers.length} columns auto-matched to DPP fields.
                  {mappedCount < preview.headers.length && ` Unmatched columns will be skipped.`}
                </p>
              </div>
            </div>

            {/* Column mapping summary */}
            <div>
              <p className="text-sm font-medium mb-2">Detected column mapping</p>
              <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto">
                {Object.entries(preview.mapping).map(([orig, target]) => (
                  <div key={orig} className="flex items-center gap-1.5 text-xs bg-muted/40 rounded px-2 py-1">
                    <span className="font-mono truncate text-muted-foreground">{orig}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium truncate">{target}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data preview */}
            <div>
              <p className="text-sm font-medium mb-2">Data preview (first {preview.preview.length} rows)</p>
              <div className="rounded-lg border overflow-auto max-h-48">
                <table className="text-xs w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      {Object.keys(preview.preview[0] || {}).map(k => (
                        <th key={k} className="px-3 py-2 text-left font-medium whitespace-nowrap">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.preview.map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        {Object.values(row).map((v, j) => (
                          <td key={j} className="px-3 py-1.5 text-muted-foreground whitespace-nowrap max-w-[140px] truncate">
                            {String(v ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Business unit override */}
            <div>
              <label className="text-sm font-medium block mb-1.5">Business Unit (optional)</label>
              <Input
                placeholder="e.g. Fluid Systems, Automotive, North Europe"
                value={businessUnit}
                onChange={(e) => setBusinessUnit(e.target.value)}
                data-testid="input-business-unit"
              />
              <p className="text-xs text-muted-foreground mt-1">Tag all imported products with this business unit. Overrides any BU column in the file.</p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={reset} data-testid="button-import-back">Change file</Button>
              <Button onClick={handleImport} data-testid="button-confirm-import">
                <Upload className="h-4 w-4 mr-2" />
                Import {preview.totalRows} products
              </Button>
            </div>
          </div>
        )}

        {/* Step: Importing */}
        {step === "importing" && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-medium">Importing products…</p>
              <p className="text-sm text-muted-foreground mt-1">Generating DPP records and QR codes — please wait</p>
            </div>
          </div>
        )}

        {/* Step: Done */}
        {step === "done" && result && (
          <div className="space-y-4">
            <div className={`flex items-start gap-3 p-4 rounded-lg border ${result.failed === 0 ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900" : "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900"}`}>
              {result.failed === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
              )}
              <div>
                <p className="font-medium">Import complete</p>
                <div className="flex flex-wrap gap-3 mt-2 text-sm">
                  <span className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {result.created} created
                  </span>
                  {result.skipped > 0 && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <AlertCircle className="h-3.5 w-3.5" /> {result.skipped} skipped
                    </span>
                  )}
                  {result.failed > 0 && (
                    <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                      <XCircle className="h-3.5 w-3.5" /> {result.failed} failed
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2 font-mono">Batch ID: {result.importBatchId}</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 text-red-600">Errors</p>
                <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-3 max-h-32 overflow-y-auto space-y-1">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-700 dark:text-red-400 font-mono">{err}</p>
                  ))}
                </div>
              </div>
            )}

            {result.created > 0 && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    const form = document.createElement("form");
                    form.method = "POST";
                    form.action = "/api/products/qr-export";
                    form.target = "_blank";
                    const input = document.createElement("input");
                    input.type = "hidden";
                    input.name = "importBatchId";
                    input.value = result.importBatchId;
                    form.appendChild(input);
                    // Use JSON body via fetch instead
                    fetch("/api/products/qr-export", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      credentials: "include",
                      body: JSON.stringify({ importBatchId: result.importBatchId }),
                    }).then(r => r.text()).then(html => {
                      const w = window.open("", "_blank");
                      if (w) { w.document.write(html); w.document.close(); }
                    });
                  }}
                  data-testid="button-export-qr-after-import"
                >
                  <PrinterCheck className="h-4 w-4 mr-2" />
                  Print QR Codes
                </Button>
                <Button onClick={handleClose} data-testid="button-import-done">Done</Button>
              </div>
            )}

            {result.created === 0 && (
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={reset}>Try again</Button>
                <Button onClick={handleClose}>Close</Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Products Page ────────────────────────────────────────────────────
export default function Products() {
  const link = usePrefixedLink();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [buFilter, setBuFilter] = useState<string>("all");
  const [showImport, setShowImport] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Derive unique business units for filter
  const businessUnits = Array.from(
    new Set((products || []).map(p => (p as any).businessUnit).filter(Boolean))
  ) as string[];

  const filteredProducts = (products || []).filter((product) => {
    const matchesSearch =
      product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((product as any).businessUnit || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBU = buFilter === "all" || (product as any).businessUnit === buFilter;
    return matchesSearch && matchesBU;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exportQR = async (ids: string[]) => {
    if (ids.length === 0) return;
    try {
      const resp = await fetch("/api/products/qr-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productIds: ids }),
      });
      if (!resp.ok) throw new Error("Export failed");
      const html = await resp.text();
      const w = window.open("", "_blank");
      if (w) { w.document.write(html); w.document.close(); }
    } catch (e: any) {
      toast({ title: "QR export failed", description: e.message, variant: "destructive" });
    }
  };

  const exportAllQR = () => exportQR((products || []).map(p => p.id));
  const exportSelectedQR = () => exportQR(Array.from(selectedIds));

  return (
    <div className="space-y-6">
      <ImportDialog open={showImport} onClose={() => { setShowImport(false); setSelectedIds(new Set()); }} />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" data-testid="text-products-title">
            Products
          </h1>
          <p className="text-muted-foreground">
            Manage your Digital Product Passports
            {products && <span className="ml-2 text-xs font-mono text-muted-foreground/70">({products.length} total)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* QR Export dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" data-testid="button-export-qr">
                <QrCode className="h-4 w-4 mr-2" />
                Export QR
                <ChevronDown className="h-3.5 w-3.5 ml-1.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={exportAllQR}
                disabled={!products?.length}
                data-testid="menu-export-all-qr"
              >
                <PrinterCheck className="h-4 w-4 mr-2" />
                All products ({products?.length || 0})
              </DropdownMenuItem>
              {selectedIds.size > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportSelectedQR} data-testid="menu-export-selected-qr">
                    <QrCode className="h-4 w-4 mr-2" />
                    Selected ({selectedIds.size})
                  </DropdownMenuItem>
                </>
              )}
              {filteredProducts.length > 0 && filteredProducts.length !== products?.length && (
                <DropdownMenuItem onClick={() => exportQR(filteredProducts.map(p => p.id))} data-testid="menu-export-filtered-qr">
                  <Search className="h-4 w-4 mr-2" />
                  Filtered ({filteredProducts.length})
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Import button */}
          <Button variant="outline" onClick={() => setShowImport(true)} data-testid="button-import-excel">
            <Upload className="h-4 w-4 mr-2" />
            Import Excel
          </Button>

          {/* Create button */}
          <Link href={link("/products/new")}>
            <Button data-testid="button-create-product">
              <Plus className="mr-2 h-4 w-4" />
              Create Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-products"
          />
        </div>

        {/* Business Unit filter */}
        {businessUnits.length > 0 && (
          <Select value={buFilter} onValueChange={setBuFilter}>
            <SelectTrigger className="w-44" data-testid="select-business-unit">
              <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Business Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Units</SelectItem>
              {businessUnits.map(bu => (
                <SelectItem key={bu} value={bu}>{bu}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* View mode toggles */}
        <div className="flex items-center gap-1 ml-auto">
          {selectedIds.size > 0 && (
            <Badge variant="secondary" className="mr-2 font-mono">
              {selectedIds.size} selected
            </Badge>
          )}
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            data-testid="button-view-grid"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
            data-testid="button-view-list"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        viewMode === "grid" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="aspect-square w-full rounded-md mb-4" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Business Unit</TableHead>
                  <TableHead>Repairability</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground text-center mb-6">
              {searchQuery || buFilter !== "all"
                ? "No products match your filters"
                : "Get started by creating your first product or importing from Excel"}
            </p>
            {!searchQuery && buFilter === "all" && (
              <div className="flex gap-3 flex-wrap justify-center">
                <Button variant="outline" onClick={() => setShowImport(true)} data-testid="button-import-first">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Excel
                </Button>
                <Link href={link("/products/new")}>
                  <Button data-testid="button-create-first">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Product
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <div key={product.id} className="relative group">
              {/* Selection checkbox overlay */}
              <button
                className={`absolute top-2 right-2 z-10 h-5 w-5 rounded border-2 transition-all ${
                  selectedIds.has(product.id)
                    ? "bg-primary border-primary opacity-100"
                    : "bg-white/80 dark:bg-black/50 border-muted-foreground/40 opacity-0 group-hover:opacity-100"
                }`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSelect(product.id); }}
                data-testid={`checkbox-product-${product.id}`}
              >
                {selectedIds.has(product.id) && (
                  <svg viewBox="0 0 10 10" className="w-full h-full p-0.5 text-primary-foreground" fill="currentColor">
                    <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              <Link href={link(`/products/${product.id}`)}>
                <Card
                  className={`overflow-visible hover-elevate active-elevate-2 transition-all ${selectedIds.has(product.id) ? "ring-2 ring-primary" : ""}`}
                  data-testid={`card-product-grid-${product.id}`}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square w-full rounded-md bg-muted mb-4 overflow-hidden flex items-center justify-center">
                      {product.productImage ? (
                        <img
                          src={product.productImage}
                          alt={product.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="font-semibold text-lg truncate mb-1">{product.productName}</h3>
                    <p className="text-sm text-muted-foreground truncate mb-1">{product.manufacturer}</p>
                    {(product as any).businessUnit && (
                      <Badge variant="outline" className="text-xs mb-2">
                        <Building2 className="h-3 w-3 mr-1" />
                        {(product as any).businessUnit}
                      </Badge>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                      <div className="flex items-center gap-1.5">
                        <QrCode className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-mono text-xs truncate">{product.batchNumber}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{product.repairabilityScore}/10</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Recycle className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{product.carbonFootprint}kg CO2</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <div className="w-full">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">Repairability</span>
                        <span className="font-medium">{product.repairabilityScore * 10}%</span>
                      </div>
                      <Progress value={product.repairabilityScore * 10} className="h-1.5" />
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(new Set(filteredProducts.map(p => p.id)));
                      else setSelectedIds(new Set());
                    }}
                    data-testid="checkbox-select-all"
                  />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Batch Number</TableHead>
                <TableHead>Business Unit</TableHead>
                <TableHead>Repairability</TableHead>
                <TableHead>Carbon</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow
                  key={product.id}
                  data-testid={`row-product-${product.id}`}
                  className={selectedIds.has(product.id) ? "bg-primary/5" : ""}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      data-testid={`checkbox-row-${product.id}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {product.productImage ? (
                          <img src={product.productImage} alt={product.productName} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <span className="font-medium truncate max-w-[180px]">{product.productName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.manufacturer}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">{product.batchNumber}</Badge>
                  </TableCell>
                  <TableCell>
                    {(product as any).businessUnit ? (
                      <Badge variant="outline" className="text-xs">
                        <Building2 className="h-3 w-3 mr-1" />
                        {(product as any).businessUnit}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={product.repairabilityScore * 10} className="h-1.5 w-16" />
                      <span className="text-sm">{product.repairabilityScore}/10</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.carbonFootprint}kg</TableCell>
                  <TableCell className="text-right">
                    <Link href={link(`/products/${product.id}`)}>
                      <Button variant="ghost" size="sm" data-testid={`button-view-${product.id}`}>View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
