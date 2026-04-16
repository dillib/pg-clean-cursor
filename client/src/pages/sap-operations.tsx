/**
 * SAP Operations Dashboard — T004
 * Sync health, field mapping editor, alert configuration, and sync history drill-down.
 */
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  RefreshCw, CheckCircle2, XCircle, AlertTriangle, Clock, Database,
  ArrowLeftRight, Plus, Trash2, Save, Activity, TrendingUp,
  BarChart3, Settings, Loader2, ChevronDown, ChevronRight
} from "lucide-react";
import { SiSap } from "react-icons/si";
import { format } from "date-fns";
import type { EnterpriseConnector, FieldMapping } from "@shared/schema";

interface SyncLog {
  id: string;
  connectorId: string;
  syncType: "full" | "delta" | "manual";
  startedAt: string;
  completedAt?: string;
  status: "running" | "completed" | "failed";
  recordsProcessed?: number;
  recordsCreated?: number;
  recordsUpdated?: number;
  recordsFailed?: number;
  errorMessage?: string;
}

function SyncStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed": return <Badge className="bg-green-600 text-white gap-1"><CheckCircle2 className="w-3 h-3" />Completed</Badge>;
    case "failed": return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Failed</Badge>;
    case "running": return <Badge variant="outline" className="border-blue-500 text-blue-600 gap-1"><Loader2 className="w-3 h-3 animate-spin" />Running</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

function HealthGauge({ value, label, format: fmt }: { value: number; label: string; format?: string }) {
  const color = value >= 90 ? "text-green-600" : value >= 70 ? "text-amber-500" : "text-red-500";
  return (
    <div className="text-center">
      <div className={`text-3xl font-bold ${color}`} data-testid={`text-gauge-${label.toLowerCase().replace(/\s/g, "-")}`}>
        {fmt === "percent" ? `${value.toFixed(0)}%` : fmt === "ms" ? `${value}ms` : value.toFixed(1)}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

export default function SAPOperations() {
  const { toast } = useToast();
  const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [mappingsDirty, setMappingsDirty] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState(3);
  const [activeTab, setActiveTab] = useState("health");

  const { data: connectors = [] } = useQuery<EnterpriseConnector[]>({
    queryKey: ["/api/integrations/connectors"],
  });

  const sapConnectors = connectors.filter(c => c.connectorType === "sap");
  const selectedConnector = sapConnectors.find(c => c.id === selectedConnectorId) ?? sapConnectors[0];

  // Sync logs for selected connector
  const { data: syncLogs = [], isLoading: logsLoading, refetch: refetchLogs } = useQuery<SyncLog[]>({
    queryKey: ["/api/integrations/connectors", selectedConnector?.id, "logs"],
    queryFn: async () => {
      if (!selectedConnector) return [];
      const r = await fetch(`/api/integrations/connectors/${selectedConnector.id}/logs`);
      if (!r.ok) return [];
      return r.json();
    },
    enabled: !!selectedConnector,
    refetchInterval: 15000,
  });

  // Scheduler status
  const { data: schedulerStatus } = useQuery<{ activeConnectors: string[] }>({
    queryKey: ["/api/sap/scheduler/status"],
    queryFn: async () => {
      const r = await fetch("/api/sap/scheduler/status");
      if (!r.ok) return { activeConnectors: [] };
      return r.json();
    },
    refetchInterval: 10000,
  });

  // Load field mappings when connector is selected
  const loadMappings = () => {
    if (selectedConnector?.fieldMappings) {
      setMappings(selectedConnector.fieldMappings as FieldMapping[]);
      setMappingsDirty(false);
    }
  };

  const saveMappings = useMutation({
    mutationFn: async () => {
      if (!selectedConnector) throw new Error("No connector selected");
      return apiRequest("PATCH", `/api/integrations/connectors/${selectedConnector.id}`, {
        fieldMappings: mappings,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/connectors"] });
      setMappingsDirty(false);
      toast({ title: "Field mappings saved", description: "Configuration updated successfully." });
    },
    onError: () => {
      toast({ title: "Save failed", description: "Could not save field mappings.", variant: "destructive" });
    },
  });

  const triggerSync = useMutation({
    mutationFn: async () => {
      if (!selectedConnector) throw new Error("No connector");
      const r = await fetch(`/api/integrations/connectors/${selectedConnector.id}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!r.ok) throw new Error("Sync failed");
      return r.json() as Promise<{ created: number; updated: number; failed: number; fieldMappingsUsed: number }>;
    },
    onSuccess: (data) => {
      const mappingNote = data.fieldMappingsUsed > 0
        ? ` using ${data.fieldMappingsUsed} custom field mapping${data.fieldMappingsUsed !== 1 ? "s" : ""}`
        : "";
      toast({
        title: "Sync complete",
        description: `${data.created} created, ${data.updated} updated, ${data.failed} failed${mappingNote}.`,
      });
      setTimeout(() => refetchLogs(), 500);
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/connectors"] });
    },
    onError: () => {
      toast({ title: "Sync failed", description: "Could not start sync.", variant: "destructive" });
    },
  });

  // Computed health metrics
  const totalRuns = syncLogs.length;
  const successRuns = syncLogs.filter(l => l.status === "completed").length;
  const failedRuns = syncLogs.filter(l => l.status === "failed").length;
  const successRate = totalRuns > 0 ? (successRuns / totalRuns) * 100 : 100;
  const recentFailures = syncLogs.slice(0, 10).filter(l => l.status === "failed").length;
  const lastSync = syncLogs[0];
  const avgRecords = totalRuns > 0
    ? Math.round(syncLogs.reduce((s, l) => s + (l.recordsProcessed ?? 0), 0) / totalRuns)
    : 0;

  const isScheduled = schedulerStatus?.activeConnectors?.includes(selectedConnector?.id ?? "");

  const addMapping = () => {
    setMappings(prev => [...prev, { sourceField: "", targetField: "", transformation: "none" }]);
    setMappingsDirty(true);
  };

  const updateMapping = (index: number, field: keyof FieldMapping, value: string) => {
    setMappings(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
    setMappingsDirty(true);
  };

  const removeMapping = (index: number) => {
    setMappings(prev => prev.filter((_, i) => i !== index));
    setMappingsDirty(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <SiSap className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-sap-ops-title">SAP Operations</h1>
            <p className="text-muted-foreground text-sm">Sync health, field mapping, and operational monitoring</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {sapConnectors.length > 1 && (
            <Select value={selectedConnector?.id ?? ""} onValueChange={setSelectedConnectorId}>
              <SelectTrigger className="w-48" data-testid="select-connector">
                <SelectValue placeholder="Select connector" />
              </SelectTrigger>
              <SelectContent>
                {sapConnectors.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="sm" onClick={() => refetchLogs()} data-testid="button-refresh-logs">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => triggerSync.mutate()}
            disabled={!selectedConnector || triggerSync.isPending}
            data-testid="button-trigger-sync"
          >
            {triggerSync.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Sync Now
          </Button>
        </div>
      </div>

      {!selectedConnector && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No SAP connectors found. Configure one in the SAP Connector settings first.
          </AlertDescription>
        </Alert>
      )}

      {selectedConnector && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="health" data-testid="tab-ops-health">
              <Activity className="w-4 h-4 mr-2" />Health
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-ops-history">
              <BarChart3 className="w-4 h-4 mr-2" />Sync History
            </TabsTrigger>
            <TabsTrigger value="mapping" data-testid="tab-ops-mapping">
              <ArrowLeftRight className="w-4 h-4 mr-2" />Field Mapping
            </TabsTrigger>
            <TabsTrigger value="alerts" data-testid="tab-ops-alerts">
              <AlertTriangle className="w-4 h-4 mr-2" />Alerts
            </TabsTrigger>
          </TabsList>

          {/* ── Health tab ── */}
          <TabsContent value="health" className="space-y-4 pt-4">
            {/* Status bar */}
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-2">
                {selectedConnector.status === "active"
                  ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                  : <XCircle className="w-5 h-5 text-destructive" />
                }
                <span className="font-medium text-sm">{selectedConnector.name}</span>
                <Badge variant={selectedConnector.status === "active" ? "default" : "destructive"} className={selectedConnector.status === "active" ? "bg-green-600" : ""}>
                  {selectedConnector.status}
                </Badge>
              </div>
              {isScheduled && (
                <Badge variant="outline" className="border-blue-500 text-blue-600 gap-1 ml-auto">
                  <Clock className="w-3 h-3" />Scheduled sync active
                </Badge>
              )}
            </div>

            {/* Gauges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-5 text-center">
                  <HealthGauge value={successRate} label="Success Rate" format="percent" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 text-center">
                  <HealthGauge value={totalRuns} label="Total Runs" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 text-center">
                  <HealthGauge value={failedRuns} label="Failed Runs" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 text-center">
                  <HealthGauge value={avgRecords} label="Avg Records/Run" />
                </CardContent>
              </Card>
            </div>

            {/* Recent failure alert */}
            {recentFailures >= alertThreshold && (
              <Alert className="border-destructive/30 bg-destructive/5">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertDescription>
                  <strong>{recentFailures} sync failures</strong> detected in the last 10 runs.
                  Check your SAP credentials and network connectivity.
                </AlertDescription>
              </Alert>
            )}

            {/* Last sync detail */}
            {lastSync && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    Last Sync
                    <Badge variant="outline" className="text-xs capitalize">{lastSync.syncType}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <SyncStatusBadge status={lastSync.status} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Started</p>
                      <p className="font-medium text-sm">{format(new Date(lastSync.startedAt), "MMM d, HH:mm")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Processed</p>
                      <p className="font-medium text-sm">{lastSync.recordsProcessed ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Created / Updated</p>
                      <p className="font-medium text-sm text-green-600">{lastSync.recordsCreated ?? 0} / {lastSync.recordsUpdated ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Failed</p>
                      <p className={`font-medium text-sm ${(lastSync.recordsFailed ?? 0) > 0 ? "text-destructive" : ""}`}>{lastSync.recordsFailed ?? 0}</p>
                    </div>
                  </div>
                  {lastSync.errorMessage && (
                    <div className="mt-3 p-3 bg-destructive/5 rounded text-sm text-destructive font-mono">
                      {lastSync.errorMessage}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {totalRuns === 0 && !logsLoading && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Database className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No sync history yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Trigger a manual sync to see health metrics here.
                  </p>
                  <Button onClick={() => triggerSync.mutate()} disabled={triggerSync.isPending} data-testid="button-first-sync">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Run First Sync
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── Sync History tab ── */}
          <TabsContent value="history" className="space-y-4 pt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Sync Runs</CardTitle>
                <CardDescription>Most recent runs first. Click a row for details.</CardDescription>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="flex items-center gap-2 py-6 justify-center text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />Loading sync history...
                  </div>
                ) : syncLogs.length === 0 ? (
                  <p className="text-center py-8 text-sm text-muted-foreground">No sync history yet.</p>
                ) : (
                  <div className="space-y-1">
                    {/* Header */}
                    <div className="grid grid-cols-6 gap-3 text-xs font-medium text-muted-foreground px-2 pb-2 border-b">
                      <div>Status</div>
                      <div>Type</div>
                      <div>Started</div>
                      <div>Duration</div>
                      <div>Processed</div>
                      <div>Failed</div>
                    </div>
                    {syncLogs.map(log => {
                      const duration = log.completedAt
                        ? Math.round((new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime()) / 1000)
                        : null;
                      const isExpanded = expandedLogId === log.id;
                      return (
                        <div key={log.id} data-testid={`sync-log-row-${log.id}`}>
                          <button
                            className="w-full grid grid-cols-6 gap-3 text-sm px-2 py-2.5 rounded hover:bg-muted/50 transition-colors text-left items-center"
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          >
                            <div><SyncStatusBadge status={log.status} /></div>
                            <div><Badge variant="outline" className="text-xs capitalize">{log.syncType}</Badge></div>
                            <div className="font-medium">{format(new Date(log.startedAt), "MMM d, HH:mm")}</div>
                            <div className="text-muted-foreground">{duration !== null ? `${duration}s` : "—"}</div>
                            <div className="text-green-600">{log.recordsProcessed ?? 0}</div>
                            <div className={log.recordsFailed ? "text-destructive" : "text-muted-foreground"}>
                              {log.recordsFailed ?? 0}
                            </div>
                          </button>
                          {isExpanded && (
                            <div className="mx-2 mb-2 p-3 bg-muted/40 rounded-lg text-sm space-y-2">
                              <div className="grid grid-cols-3 gap-3 text-xs">
                                <div><span className="text-muted-foreground">Created: </span><span className="text-green-600 font-medium">{log.recordsCreated ?? 0}</span></div>
                                <div><span className="text-muted-foreground">Updated: </span><span className="font-medium">{log.recordsUpdated ?? 0}</span></div>
                                <div><span className="text-muted-foreground">Failed: </span><span className={`font-medium ${(log.recordsFailed ?? 0) > 0 ? "text-destructive" : ""}`}>{log.recordsFailed ?? 0}</span></div>
                              </div>
                              {log.errorMessage && (
                                <div className="p-2 bg-destructive/5 rounded font-mono text-xs text-destructive">
                                  {log.errorMessage}
                                </div>
                              )}
                              {!log.errorMessage && <p className="text-muted-foreground text-xs">Sync completed without errors.</p>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Field Mapping tab ── */}
          <TabsContent value="mapping" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Field Mapping</CardTitle>
                    <CardDescription>Map SAP material master fields to PhotonicTag DPP fields</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadMappings} data-testid="button-load-mappings">
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => saveMappings.mutate()}
                      disabled={!mappingsDirty || saveMappings.isPending}
                      data-testid="button-save-mappings"
                    >
                      {saveMappings.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {mappings.length === 0 && (
                  <div className="text-center py-8">
                    <ArrowLeftRight className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">No field mappings configured yet.</p>
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" size="sm" onClick={loadMappings}>Load from connector</Button>
                      <Button variant="outline" size="sm" onClick={addMapping} data-testid="button-add-mapping">
                        <Plus className="w-4 h-4 mr-1" />Add Mapping
                      </Button>
                    </div>
                  </div>
                )}
                {mappings.length > 0 && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-7 gap-3 text-xs font-medium text-muted-foreground pb-2">
                      <div className="col-span-2">SAP Field (Source)</div>
                      <div className="col-span-2">PhotonicTag Field (Target)</div>
                      <div className="col-span-2">Transformation</div>
                      <div />
                    </div>
                    {mappings.map((m, i) => (
                      <div key={i} className="grid grid-cols-7 gap-3 items-center" data-testid={`mapping-row-${i}`}>
                        <Input
                          className="col-span-2 font-mono text-sm h-8"
                          value={m.sourceField}
                          placeholder="e.g. MATNR"
                          onChange={e => updateMapping(i, "sourceField", e.target.value)}
                          data-testid={`input-source-field-${i}`}
                        />
                        <Input
                          className="col-span-2 font-mono text-sm h-8"
                          value={m.targetField}
                          placeholder="e.g. productName"
                          onChange={e => updateMapping(i, "targetField", e.target.value)}
                          data-testid={`input-target-field-${i}`}
                        />
                        <Select
                          value={m.transformation ?? "none"}
                          onValueChange={v => updateMapping(i, "transformation", v)}
                        >
                          <SelectTrigger className="col-span-2 h-8 text-sm" data-testid={`select-transform-${i}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="trim">Trim whitespace</SelectItem>
                            <SelectItem value="uppercase">Uppercase</SelectItem>
                            <SelectItem value="lowercase">Lowercase</SelectItem>
                            <SelectItem value="number">Parse number</SelectItem>
                            <SelectItem value="boolean">Parse boolean</SelectItem>
                            <SelectItem value="date_iso">ISO date format</SelectItem>
                          </SelectContent>
                        </Select>
                        <button
                          onClick={() => removeMapping(i)}
                          className="flex items-center justify-center w-8 h-8 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          data-testid={`button-remove-mapping-${i}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addMapping} className="mt-2" data-testid="button-add-mapping">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Field Mapping
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SAP Standard Field Reference */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Common SAP Material Master Fields</CardTitle>
                <CardDescription>Click to add a standard mapping</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {[
                    { src: "MATNR", tgt: "productName" }, { src: "MAKTX", tgt: "description" },
                    { src: "MTART", tgt: "productCategory" }, { src: "MATKL", tgt: "materials" },
                    { src: "MEINS", tgt: "modelNumber" }, { src: "BRGEW", tgt: "carbonFootprint" },
                    { src: "WERKS", tgt: "manufacturer" }, { src: "CHARG", tgt: "batchNumber" },
                    { src: "ERSDA", tgt: "dateOfManufacture" }, { src: "MATNR_EXT", tgt: "sku" },
                    { src: "NTGEW", tgt: "recycledContentPercent" }, { src: "LAEDA", tgt: "lastSyncDate" },
                  ].map(({ src, tgt }) => (
                    <button
                      key={src}
                      onClick={() => {
                        if (!mappings.find(m => m.sourceField === src)) {
                          setMappings(prev => [...prev, { sourceField: src, targetField: tgt, transformation: "none" }]);
                          setMappingsDirty(true);
                        }
                      }}
                      className="flex items-center gap-2 p-2 rounded border text-left text-xs hover:bg-muted/50 transition-colors"
                      data-testid={`button-preset-${src}`}
                    >
                      <span className="font-mono text-primary">{src}</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground truncate">{tgt}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Alerts tab ── */}
          <TabsContent value="alerts" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Alert Thresholds</CardTitle>
                <CardDescription>Configure when sync failures trigger warnings in the health dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium">Failure alert threshold</label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Alert when this many consecutive failures occur in the last 10 sync runs
                    </p>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={alertThreshold}
                        onChange={e => setAlertThreshold(parseInt(e.target.value) || 3)}
                        className="w-24"
                        data-testid="input-alert-threshold"
                      />
                      <span className="text-sm text-muted-foreground">out of 10 runs</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Current status</label>
                    <p className="text-xs text-muted-foreground mb-2">Based on recent sync history</p>
                    <div className="flex items-center gap-2">
                      {recentFailures >= alertThreshold ? (
                        <>
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                          <span className="text-sm text-destructive font-medium">{recentFailures} failures detected — alert active</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">Within threshold ({recentFailures}/{alertThreshold})</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-2">Connector Health Summary</h3>
                  <div className="space-y-2">
                    {sapConnectors.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <SiSap className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">{c.name}</span>
                          {schedulerStatus?.activeConnectors?.includes(c.id) && (
                            <Badge variant="outline" className="text-xs border-blue-500 text-blue-600 gap-1">
                              <Clock className="w-2.5 h-2.5" />auto-sync
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {c.lastSyncAt && (
                            <span className="text-xs text-muted-foreground">
                              Last: {format(new Date(c.lastSyncAt), "MMM d, HH:mm")}
                            </span>
                          )}
                          <Badge
                            variant={c.status === "active" ? "default" : "outline"}
                            className={c.status === "active" ? "bg-green-600" : ""}
                          >
                            {c.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
