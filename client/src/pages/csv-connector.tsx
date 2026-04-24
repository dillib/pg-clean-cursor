import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Upload,
  Plus,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Loader2,
  Database,
  ArrowLeftRight,
} from "lucide-react";
import type { EnterpriseConnector, FieldMapping, IntegrationSyncLog } from "@shared/schema";

/* ------------------------------------------------------------ *
 * CSV-lite connector page
 * ------------------------------------------------------------
 * Closes Brief 2026-17 opportunity #3 by giving non-SAP prospects
 * a self-serve path: create connector → set field mappings →
 * upload CSV → see passports rendered. Backend lives in
 * server/services/csv-import-service.ts and the upload route
 * POST /api/integrations/connectors/:id/upload (route registered
 * in server/routes.ts).
 * ------------------------------------------------------------ */

const TRANSFORMATIONS = ["", "trim", "uppercase", "lowercase", "number", "boolean", "date_iso"] as const;

const STARTER_MAPPINGS: FieldMapping[] = [
  { sourceField: "Product Name", targetField: "productName", transformation: "trim" },
  { sourceField: "SKU", targetField: "sku" },
  { sourceField: "Manufacturer", targetField: "manufacturer" },
  { sourceField: "Category", targetField: "productCategory" },
  { sourceField: "Country", targetField: "countryOfOrigin" },
  { sourceField: "Materials", targetField: "materials" },
  { sourceField: "Carbon", targetField: "carbonFootprint", transformation: "number" },
];

interface UploadResponse {
  success: boolean;
  syncLogId?: string;
  parsed: number;
  mapped: number;
  created: number;
  updated: number;
  failed: number;
  fieldMappingsUsed: number;
  firstError: string | null;
  errors?: string[];
}

export default function CSVConnector() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState("CSV Import");
  const [mappings, setMappings] = useState<FieldMapping[]>(STARTER_MAPPINGS);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);

  const { data: connectors, isLoading } = useQuery<EnterpriseConnector[]>({
    queryKey: ["/api/integrations/connectors"],
  });

  const csvConnectors = connectors?.filter(c => c.connectorType === "csv") ?? [];
  const selected = csvConnectors.find(c => c.id === selectedId) ?? null;

  // When a connector becomes selected (or its server data refreshes), pull the
  // editable form fields out of it so the user edits its persisted state.
  useEffect(() => {
    if (selected) {
      setName(selected.name);
      const persisted = (selected.fieldMappings ?? []) as FieldMapping[];
      setMappings(persisted.length ? persisted : STARTER_MAPPINGS);
      setUploadResult(null);
    }
  }, [selected?.id, selected?.updatedAt]);

  // Auto-select the first CSV connector once the list loads (avoids an empty
  // "select a connector" state on first visit when one already exists).
  useEffect(() => {
    if (!selectedId && csvConnectors.length > 0) {
      setSelectedId(csvConnectors[0].id);
    }
  }, [selectedId, csvConnectors]);

  const { data: syncLogs } = useQuery<IntegrationSyncLog[]>({
    queryKey: ["/api/integrations/connectors", selectedId, "logs"],
    enabled: !!selectedId,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        connectorType: "csv" as const,
        syncDirection: "inbound" as const,
        config: {},
        fieldMappings: mappings.filter(m => m.sourceField.trim() && m.targetField.trim()),
      };
      if (selected) {
        return apiRequest("PATCH", `/api/integrations/connectors/${selected.id}`, payload);
      }
      return apiRequest("POST", "/api/integrations/connectors", payload);
    },
    onSuccess: async (response) => {
      const created = await response.json();
      await queryClient.invalidateQueries({ queryKey: ["/api/integrations/connectors"] });
      if (!selected && created?.id) setSelectedId(created.id);
      toast({ title: "Saved", description: "CSV connector configuration saved." });
    },
    onError: (err: Error) => {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!selected) throw new Error("Save the connector before uploading.");
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/integrations/connectors/${selected.id}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const json = (await res.json()) as UploadResponse | { error: string; details?: string };
      if (!res.ok) {
        throw new Error(("error" in json ? json.error : "Upload failed") + ("details" in json && json.details ? `: ${json.details}` : ""));
      }
      return json as UploadResponse;
    },
    onSuccess: async (result) => {
      setUploadResult(result);
      await queryClient.invalidateQueries({ queryKey: ["/api/integrations/connectors", selectedId, "logs"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/integrations/connectors"] });
      toast({
        title: `${result.created + result.updated} product(s) imported`,
        description: `Parsed ${result.parsed} rows · ${result.failed} failed`,
      });
    },
    onError: (err: Error) => {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    },
  });

  const updateMapping = (idx: number, patch: Partial<FieldMapping>) => {
    setMappings(prev => prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)));
  };
  const removeMapping = (idx: number) => setMappings(prev => prev.filter((_, i) => i !== idx));
  const addMapping = () => setMappings(prev => [...prev, { sourceField: "", targetField: "" }]);

  const handleNew = () => {
    setSelectedId(null);
    setName("CSV Import");
    setMappings(STARTER_MAPPINGS);
    setUploadResult(null);
  };

  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6" data-testid="page-csv-connector">
      <Helmet>
        <title>CSV import connector — PhotonicTag</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Database className="w-4 h-4" />
            <span>Integrations</span>
            <span>/</span>
            <span className="text-foreground">CSV import</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1" data-testid="text-csv-connector-title">
            CSV / spreadsheet import
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Drop a CSV or XLSX, map your columns to PhotonicTag fields, see passports rendered. The cheapest
            path to a first passport for any prospect not on SAP.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleNew} data-testid="button-new-csv-connector">
            <Plus className="w-4 h-4 mr-2" /> New connector
          </Button>
        </div>
      </div>

      {csvConnectors.length > 0 && (
        <div className="flex items-center gap-3" data-testid="select-csv-connector-container">
          <Label className="text-sm text-muted-foreground">Connector</Label>
          <Select value={selectedId ?? ""} onValueChange={setSelectedId}>
            <SelectTrigger className="w-[280px]" data-testid="select-csv-connector">
              <SelectValue placeholder="Select a connector" />
            </SelectTrigger>
            <SelectContent>
              {csvConnectors.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selected && (
            <Badge variant="outline" className="ml-auto">
              <ArrowLeftRight className="w-3 h-3 mr-1" />
              Last sync:{" "}
              {selected.lastSyncAt
                ? new Date(selected.lastSyncAt as unknown as string).toLocaleString()
                : "never"}
            </Badge>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Connector + mappings ─────────────────────────────────── */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">{selected ? "Edit connector" : "New CSV connector"}</CardTitle>
            <CardDescription>
              Map source columns from your spreadsheet to PhotonicTag product fields. The mapping is
              applied to every uploaded file and persisted with the connector.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="csv-name">Connector name</Label>
              <Input
                id="csv-name"
                className="mt-1"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. EMEA Product Catalog 2026"
                data-testid="input-csv-name"
              />
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm">Field mappings</Label>
                <Button variant="ghost" size="sm" onClick={addMapping} data-testid="button-add-mapping">
                  <Plus className="w-3 h-3 mr-1" /> Add row
                </Button>
              </div>
              <div className="grid grid-cols-[1fr_1fr_140px_40px] gap-2 text-xs text-muted-foreground mb-2 px-1">
                <span>Source column (CSV header)</span>
                <span>Target field (PhotonicTag)</span>
                <span>Transform</span>
                <span></span>
              </div>
              <div className="space-y-2">
                {mappings.map((m, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_1fr_140px_40px] gap-2"
                    data-testid={`row-mapping-${i}`}
                  >
                    <Input
                      value={m.sourceField}
                      onChange={e => updateMapping(i, { sourceField: e.target.value })}
                      placeholder="Product Name"
                      data-testid={`input-mapping-source-${i}`}
                    />
                    <Input
                      value={m.targetField}
                      onChange={e => updateMapping(i, { targetField: e.target.value })}
                      placeholder="productName"
                      data-testid={`input-mapping-target-${i}`}
                    />
                    <Select
                      value={m.transformation ?? ""}
                      onValueChange={v => updateMapping(i, { transformation: v || undefined })}
                    >
                      <SelectTrigger data-testid={`select-mapping-transform-${i}`}>
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSFORMATIONS.map(t => (
                          <SelectItem key={t || "none"} value={t}>{t || "—"}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMapping(i)}
                      data-testid={`button-remove-mapping-${i}`}
                      aria-label={`Remove mapping row ${i + 1}`}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !name.trim()}
                data-testid="button-save-csv-connector"
              >
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {selected ? "Save changes" : "Create connector"}
              </Button>
              <Button
                variant="secondary"
                disabled={!selected || uploadMutation.isPending}
                onClick={() => fileInputRef.current?.click()}
                data-testid="button-trigger-upload"
              >
                {uploadMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload CSV / XLSX
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={handleFileChosen}
                data-testid="input-file-upload"
              />
            </div>

            {!selected && (
              <Alert>
                <AlertDescription className="text-xs">
                  Save the connector first to enable upload.
                </AlertDescription>
              </Alert>
            )}

            {uploadResult && (
              <Alert
                className={uploadResult.failed > 0 && uploadResult.created + uploadResult.updated === 0 ? "border-destructive" : ""}
                data-testid="alert-upload-result"
              >
                <AlertDescription>
                  <div className="flex items-center gap-2 mb-1">
                    {uploadResult.failed > 0 && uploadResult.created + uploadResult.updated === 0 ? (
                      <XCircle className="w-4 h-4 text-destructive" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    )}
                    <span className="font-medium">
                      Parsed {uploadResult.parsed} · Mapped {uploadResult.mapped} · Created {uploadResult.created} · Updated {uploadResult.updated} · Failed {uploadResult.failed}
                    </span>
                  </div>
                  {uploadResult.firstError && (
                    <div className="text-xs text-muted-foreground">First error: {uploadResult.firstError}</div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* ── Sync history ─────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Recent uploads
            </CardTitle>
            <CardDescription>Last 10 sync attempts for this connector.</CardDescription>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <p className="text-sm text-muted-foreground">Select or create a connector to see uploads.</p>
            ) : !syncLogs || syncLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground" data-testid="text-no-sync-logs">
                No uploads yet. Drop a CSV above to import your first batch.
              </p>
            ) : (
              <ul className="space-y-2" data-testid="list-sync-logs">
                {syncLogs.slice(0, 10).map(log => (
                  <li
                    key={log.id}
                    className="text-xs border rounded p-2 space-y-1"
                    data-testid={`row-sync-log-${log.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={log.status === "completed" ? "default" : log.status === "failed" ? "destructive" : "secondary"}
                        className="text-[10px]"
                      >
                        {log.status}
                      </Badge>
                      <span className="text-muted-foreground">
                        {log.startedAt ? new Date(log.startedAt as unknown as string).toLocaleString() : "—"}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      {log.recordsCreated} created · {log.recordsUpdated} updated · {log.recordsFailed} failed (of {log.recordsProcessed})
                    </div>
                    {log.errorMessage && (
                      <div className="text-destructive text-[11px] truncate" title={log.errorMessage}>
                        {log.errorMessage}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading connectors…
        </div>
      )}
    </div>
  );
}
