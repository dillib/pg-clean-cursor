import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowLeft,
  Database,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Package,
  Loader2,
  Zap,
  History,
  AlertCircle,
  Check,
  X,
  FileText,
  Layers,
  Activity,
  Server,
} from "lucide-react";
import type { Product } from "@shared/schema";

interface SAPMaterial {
  MARA: {
    MATNR: string;
    MAKTX: string;
    MTART: string;
    MATKL: string;
    ERSDA: string;
    LAEDA: string;
  };
  MARC: {
    WERKS: string;
  };
  syncStatus: "pending" | "synced" | "conflict" | "error";
  photonicTagId?: string;
  lastSyncedAt?: string;
}

interface SAPSyncEvent {
  id: string;
  timestamp: string;
  direction: "sap_to_pt" | "pt_to_sap" | "bidirectional";
  status: "success" | "partial" | "failed" | "conflict";
  materialsProcessed: number;
  materialsCreated: number;
  materialsUpdated: number;
  materialsFailed: number;
  conflicts: SAPConflict[];
  details: string;
}

interface SAPConflict {
  id: string;
  matnr: string;
  productName: string;
  field: string;
  sapValue: string;
  photonicTagValue: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

interface SAPStats {
  sap: {
    totalMaterials: number;
    synced: number;
    pending: number;
    conflicts: number;
    errors: number;
    linked: number;
  };
  photonicTag: {
    totalProducts: number;
  };
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "synced":
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Synced</Badge>;
    case "pending":
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    case "conflict":
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20"><AlertTriangle className="h-3 w-3 mr-1" />Conflict</Badge>;
    case "error":
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function SyncEventBadge({ status }: { status: string }) {
  switch (status) {
    case "success":
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><Check className="h-3 w-3 mr-1" />Success</Badge>;
    case "partial":
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20"><AlertCircle className="h-3 w-3 mr-1" />Partial</Badge>;
    case "failed":
      return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Failed</Badge>;
    case "conflict":
      return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20"><AlertTriangle className="h-3 w-3 mr-1" />Conflict</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function DirectionIcon({ direction }: { direction: string }) {
  switch (direction) {
    case "sap_to_pt":
      return <ArrowRight className="h-4 w-4 text-amber-500" />;
    case "pt_to_sap":
      return <ArrowLeft className="h-4 w-4 text-purple-500" />;
    case "bidirectional":
      return <ArrowLeftRight className="h-4 w-4 text-green-500" />;
    default:
      return <ArrowLeftRight className="h-4 w-4" />;
  }
}

function MaterialCard({ material, showDetails = false }: { material: SAPMaterial; showDetails?: boolean }) {
  return (
    <div className="p-3 rounded-lg border hover-elevate transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">{material.MARA.MAKTX}</p>
          <p className="text-xs text-muted-foreground font-mono">{material.MARA.MATNR}</p>
        </div>
        <StatusBadge status={material.syncStatus} />
      </div>
      {showDetails && (
        <div className="mt-2 pt-2 border-t grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>Plant: {material.MARC.WERKS}</div>
          <div>Type: {material.MARA.MTART}</div>
          <div>Created: {material.MARA.ERSDA}</div>
          <div>Modified: {material.MARA.LAEDA}</div>
        </div>
      )}
    </div>
  );
}

function SyncAnimation({ isActive, direction }: { isActive: boolean; direction: "left" | "right" | "both" }) {
  if (!isActive) return null;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-background/50 rounded-lg">
      <div className="flex items-center gap-4 p-4 rounded-full bg-background border shadow-lg">
        {(direction === "left" || direction === "both") && (
          <div className="flex items-center">
            <ArrowLeft className="h-8 w-8 text-purple-500 animate-pulse" />
          </div>
        )}
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        {(direction === "right" || direction === "both") && (
          <div className="flex items-center">
            <ArrowRight className="h-8 w-8 text-amber-500 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function SAPDemoPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDirection, setSyncDirection] = useState<"left" | "right" | "both" | null>(null);
  const [selectedConflict, setSelectedConflict] = useState<SAPConflict | null>(null);

  const { data: materials = [], isLoading: materialsLoading } = useQuery<SAPMaterial[]>({
    queryKey: ["/api/sap/materials"],
    refetchInterval: isSyncing ? 2000 : false,
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    refetchInterval: isSyncing ? 2000 : false,
  });

  const { data: stats } = useQuery<SAPStats>({
    queryKey: ["/api/sap/stats"],
    refetchInterval: 5000,
  });

  const { data: syncEvents = [] } = useQuery<SAPSyncEvent[]>({
    queryKey: ["/api/sap/sync-events"],
    refetchInterval: isSyncing ? 2000 : 10000,
  });

  const { data: conflicts = [] } = useQuery<SAPConflict[]>({
    queryKey: ["/api/sap/conflicts"],
    refetchInterval: 5000,
  });

  const invalidateAllSAPQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/sap/materials"] });
    queryClient.invalidateQueries({ queryKey: ["/api/sap/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/sap/sync-events"] });
    queryClient.invalidateQueries({ queryKey: ["/api/sap/conflicts"] });
    queryClient.invalidateQueries({ queryKey: ["/api/products"] });
  };

  const syncFromSAP = useMutation({
    mutationFn: async (limit: number) => {
      const response = await apiRequest("POST", "/api/sap/sync/from-sap", { limit });
      return response.json();
    },
    onSuccess: (data) => {
      invalidateAllSAPQueries();
      toast({
        title: "Sync from SAP Complete",
        description: `Created ${data.created} products, updated ${data.updated}`,
      });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Failed to sync from SAP",
        variant: "destructive",
      });
    },
  });

  const syncToSAP = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/sap/sync/to-sap", {});
      return response.json();
    },
    onSuccess: (data) => {
      invalidateAllSAPQueries();
      toast({
        title: "Sync to SAP Complete",
        description: `Updated ${data.updated} materials in SAP`,
      });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Failed to sync to SAP",
        variant: "destructive",
      });
    },
  });

  const bidirectionalSync = useMutation({
    mutationFn: async (limit: number) => {
      const response = await apiRequest("POST", "/api/sap/sync/bidirectional", { limit });
      return response.json();
    },
    onSuccess: (data) => {
      invalidateAllSAPQueries();
      toast({
        title: "Bidirectional Sync Complete",
        description: data.syncEvent.details,
      });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Failed to perform bidirectional sync",
        variant: "destructive",
      });
    },
  });

  const resolveConflict = useMutation({
    mutationFn: async ({ id, resolvedBy }: { id: string; resolvedBy: string }) => {
      const response = await apiRequest("POST", `/api/sap/conflicts/${id}/resolve`, { resolvedBy });
      return response.json();
    },
    onSuccess: () => {
      invalidateAllSAPQueries();
      setSelectedConflict(null);
      toast({
        title: "Conflict Resolved",
        description: "The conflict has been resolved successfully",
      });
    },
  });

  const handleSyncFromSAP = async () => {
    setIsSyncing(true);
    setSyncDirection("right");
    setSyncProgress(0);
    
    const interval = setInterval(() => {
      setSyncProgress(p => Math.min(p + 10, 90));
    }, 200);
    
    try {
      await syncFromSAP.mutateAsync(20);
      setSyncProgress(100);
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setIsSyncing(false);
        setSyncDirection(null);
        setSyncProgress(0);
      }, 500);
    }
  };

  const handleSyncToSAP = async () => {
    setIsSyncing(true);
    setSyncDirection("left");
    setSyncProgress(0);
    
    const interval = setInterval(() => {
      setSyncProgress(p => Math.min(p + 10, 90));
    }, 200);
    
    try {
      await syncToSAP.mutateAsync();
      setSyncProgress(100);
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setIsSyncing(false);
        setSyncDirection(null);
        setSyncProgress(0);
      }, 500);
    }
  };

  const handleBidirectionalSync = async () => {
    setIsSyncing(true);
    setSyncDirection("both");
    setSyncProgress(0);
    
    const interval = setInterval(() => {
      setSyncProgress(p => Math.min(p + 5, 90));
    }, 200);
    
    try {
      await bidirectionalSync.mutateAsync(20);
      setSyncProgress(100);
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setIsSyncing(false);
        setSyncDirection(null);
        setSyncProgress(0);
      }, 500);
    }
  };

  const pendingMaterials = materials.filter(m => m.syncStatus === "pending");
  const syncedMaterials = materials.filter(m => m.syncStatus === "synced");
  const conflictMaterials = materials.filter(m => m.syncStatus === "conflict");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Server className="h-6 w-6" />
            SAP Integration Demo
          </h1>
          <p className="text-muted-foreground mt-1">
            Bidirectional sync between SAP S/4HANA and PhotonicTag DPP
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Database className="h-3 w-3" />
          Mock SAP System
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="truncate">SAP Materials</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.sap.totalMaterials || 100}</div>
            <p className="text-xs text-muted-foreground truncate">Total in mock SAP</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">Products</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.photonicTag.totalProducts || products.length}</div>
            <p className="text-xs text-muted-foreground truncate">In PhotonicTag DPP</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <span className="truncate">Synced</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.sap.synced || syncedMaterials.length}</div>
            <p className="text-xs text-muted-foreground truncate">Linked & synchronized</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="truncate">Conflicts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conflicts.length}</div>
            <p className="text-xs text-muted-foreground truncate">Need resolution</p>
          </CardContent>
        </Card>
      </div>

      {isSyncing && (
        <Card className="border-primary">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {syncDirection === "right" ? "Importing from SAP..." : 
                   syncDirection === "left" ? "Exporting to SAP..." : 
                   "Synchronizing..."}
                </p>
                <Progress value={syncProgress} className="mt-2 h-2" />
              </div>
              <span className="text-sm text-muted-foreground">{syncProgress}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 relative overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5 text-amber-500" />
                SAP S/4HANA
              </CardTitle>
              <Badge variant="outline" className="text-xs">Mock System</Badge>
            </div>
            <CardDescription>100 Material Master Records (MARA/MARC)</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending" className="text-xs" data-testid="tab-sap-pending">
                  Pending ({pendingMaterials.length})
                </TabsTrigger>
                <TabsTrigger value="synced" className="text-xs" data-testid="tab-sap-synced">
                  Synced ({syncedMaterials.length})
                </TabsTrigger>
                <TabsTrigger value="conflict" className="text-xs" data-testid="tab-sap-conflict">
                  Conflict ({conflictMaterials.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="pending">
                <ScrollArea className="h-[350px] pr-4">
                  <div className="space-y-2">
                    {materialsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : pendingMaterials.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p className="text-sm">All materials are synced!</p>
                      </div>
                    ) : (
                      <>
                        {pendingMaterials.slice(0, 15).map(material => (
                          <MaterialCard key={material.MARA.MATNR} material={material} />
                        ))}
                        {pendingMaterials.length > 15 && (
                          <p className="text-center text-sm text-muted-foreground py-2">
                            +{pendingMaterials.length - 15} more materials
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="synced">
                <ScrollArea className="h-[350px] pr-4">
                  <div className="space-y-2">
                    {syncedMaterials.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">No synced materials yet</p>
                        <p className="text-xs">Click "Sync from SAP" to start</p>
                      </div>
                    ) : (
                      <>
                        {syncedMaterials.slice(0, 15).map(material => (
                          <MaterialCard key={material.MARA.MATNR} material={material} />
                        ))}
                        {syncedMaterials.length > 15 && (
                          <p className="text-center text-sm text-muted-foreground py-2">
                            +{syncedMaterials.length - 15} more synced
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="conflict">
                <ScrollArea className="h-[350px] pr-4">
                  <div className="space-y-2">
                    {conflictMaterials.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p className="text-sm">No conflicts detected</p>
                      </div>
                    ) : (
                      conflictMaterials.map(material => (
                        <MaterialCard key={material.MARA.MATNR} material={material} showDetails />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
          <SyncAnimation isActive={isSyncing && syncDirection === "left"} direction="left" />
        </Card>

        <Card className="lg:col-span-1 flex flex-col relative overflow-hidden">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg">Sync Controls</CardTitle>
            <CardDescription>Transfer data between systems</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 items-center flex-1 justify-center p-4">
            <Button
              onClick={handleSyncFromSAP}
              disabled={isSyncing || pendingMaterials.length === 0}
              className="w-full gap-2 px-2"
              size="lg"
              data-testid="button-sync-from-sap"
            >
              {syncFromSAP.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              ) : (
                <ArrowRight className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate">Sync from SAP</span>
              <Badge variant="secondary" className="ml-auto shrink-0">{Math.min(20, pendingMaterials.length)}</Badge>
            </Button>

            <div className="flex items-center gap-2 w-full">
              <Separator className="flex-1" />
              <span className="text-[10px] text-muted-foreground font-medium shrink-0">OR</span>
              <Separator className="flex-1" />
            </div>

            <Button
              onClick={handleSyncToSAP}
              disabled={isSyncing || syncedMaterials.length === 0}
              variant="outline"
              className="w-full gap-2 px-2"
              size="lg"
              data-testid="button-sync-to-sap"
            >
              {syncToSAP.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              ) : (
                <ArrowLeft className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate">Sync to SAP</span>
              <Badge variant="secondary" className="ml-auto shrink-0">{syncedMaterials.length}</Badge>
            </Button>

            <div className="flex items-center gap-2 w-full">
              <Separator className="flex-1" />
              <span className="text-[10px] text-muted-foreground font-medium shrink-0">OR</span>
              <Separator className="flex-1" />
            </div>

            <Button
              onClick={handleBidirectionalSync}
              disabled={isSyncing}
              variant="secondary"
              className="w-full gap-2 px-2"
              size="lg"
              data-testid="button-bidirectional-sync"
            >
              {bidirectionalSync.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              ) : (
                <ArrowLeftRight className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate">Full Sync</span>
            </Button>

            {conflicts.length > 0 && (
              <>
                <Separator className="w-full" />
                <div className="w-full p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-amber-600 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium text-sm">{conflicts.length} Conflicts Detected</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedConflict(conflicts[0])}
                    data-testid="button-resolve-conflicts"
                  >
                    Resolve Conflicts
                  </Button>
                </div>
              </>
            )}
          </CardContent>
          <SyncAnimation isActive={isSyncing && syncDirection === "both"} direction="both" />
        </Card>

        <Card className="lg:col-span-1 relative overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                PhotonicTag DPP
              </CardTitle>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {products.length} Products
              </Badge>
            </div>
            <CardDescription>Digital Product Passports with sustainability data</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[420px] pr-4">
              <div className="space-y-2">
                {products.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm font-medium">No products yet</p>
                    <p className="text-xs mt-1">Sync from SAP to create Digital Product Passports</p>
                  </div>
                ) : (
                  <>
                    {products.slice(0, 20).map(product => (
                      <div key={product.id} className="p-3 rounded-lg border hover-elevate">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{product.productName}</p>
                            <p className="text-xs text-muted-foreground">{product.manufacturer}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {product.productCategory}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="font-mono truncate">{product.modelNumber || "—"}</span>
                          {product.recyclabilityPercent && (
                            <Badge variant="outline" className="text-xs shrink-0">
                              {product.recyclabilityPercent}% recyclable
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {products.length > 20 && (
                      <p className="text-center text-sm text-muted-foreground py-2">
                        +{products.length - 20} more products
                      </p>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <SyncAnimation isActive={isSyncing && syncDirection === "right"} direction="right" />
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Sync Audit Trail
          </CardTitle>
          <CardDescription>Complete history of all synchronization events</CardDescription>
        </CardHeader>
        <CardContent>
          {syncEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm font-medium">No sync events yet</p>
              <p className="text-xs mt-1">Click a sync button above to start transferring data</p>
            </div>
          ) : (
            <ScrollArea className="h-[250px]">
              <div className="space-y-3">
                {syncEvents.map(event => (
                  <div key={event.id} className="flex items-start gap-4 p-3 rounded-lg border" data-testid={`sync-event-${event.id}`}>
                    <div className="pt-1">
                      <DirectionIcon direction={event.direction} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {event.direction === "sap_to_pt" ? "SAP → PhotonicTag" :
                           event.direction === "pt_to_sap" ? "PhotonicTag → SAP" :
                           "Bidirectional Sync"}
                        </span>
                        <SyncEventBadge status={event.status} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{event.details}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span>Processed: {event.materialsProcessed}</span>
                        <span>Created: {event.materialsCreated}</span>
                        <span>Updated: {event.materialsUpdated}</span>
                        {event.materialsFailed > 0 && (
                          <span className="text-destructive">Failed: {event.materialsFailed}</span>
                        )}
                        {event.conflicts.length > 0 && (
                          <span className="text-amber-600">Conflicts: {event.conflicts.length}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedConflict} onOpenChange={() => setSelectedConflict(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Resolve Data Conflict
            </DialogTitle>
            <DialogDescription>
              Data differs between SAP and PhotonicTag. Choose which value to keep.
            </DialogDescription>
          </DialogHeader>
          
          {selectedConflict && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">{selectedConflict.productName}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Material: <span className="font-mono">{selectedConflict.matnr}</span> • 
                  Field: <span className="font-medium">{selectedConflict.field}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border-2 border-blue-500/30 bg-amber-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-sm">SAP Value</span>
                  </div>
                  <div className="p-3 rounded bg-background border">
                    <p className="font-mono text-sm break-all">{selectedConflict.sapValue || "(empty)"}</p>
                  </div>
                  <Button
                    className="w-full mt-4"
                    variant="outline"
                    onClick={() => resolveConflict.mutate({ id: selectedConflict.id, resolvedBy: "sap" })}
                    disabled={resolveConflict.isPending}
                    data-testid="button-use-sap-value"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Use SAP Value
                  </Button>
                </div>
                
                <div className="p-4 rounded-lg border-2 border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">PhotonicTag Value</span>
                  </div>
                  <div className="p-3 rounded bg-background border">
                    <p className="font-mono text-sm break-all">{selectedConflict.photonicTagValue || "(empty)"}</p>
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => resolveConflict.mutate({ id: selectedConflict.id, resolvedBy: "photonictag" })}
                    disabled={resolveConflict.isPending}
                    data-testid="button-use-photonictag-value"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Use PhotonicTag Value
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedConflict(null)}>
              Skip for Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
