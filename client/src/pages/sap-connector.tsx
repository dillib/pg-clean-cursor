import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, Server, RefreshCw, CheckCircle2, XCircle, Clock, ArrowLeftRight, Database, Settings2, ShieldCheck, KeyRound, Wifi, WifiOff } from "lucide-react";
import { SiSap } from "react-icons/si";
import type { EnterpriseConnector, SAPConfig, FieldMapping } from "@shared/schema";

const sapConfigSchema = z.object({
  name: z.string().min(1, "Connection name is required"),
  systemType: z.enum(["S4HANA", "ECC", "Business_One"]),
  hostname: z.string().min(1, "Hostname is required"),
  port: z.coerce.number().min(1).max(65535),
  client: z.string().min(1, "Client is required"),
  systemId: z.string().min(1, "System ID is required"),
  apiType: z.enum(["OData", "RFC", "IDoc"]),
  sslVerify: z.boolean().default(true),
  // Authentication
  authMethod: z.enum(["basic", "oauth2", "saml"]).default("basic"),
  username: z.string().optional(),
  password: z.string().optional(),
  oauthClientId: z.string().optional(),
  oauthClientSecret: z.string().optional(),
  oauthTokenUrl: z.string().optional(),
  oauthScope: z.string().optional(),
  // Sync
  oauthEnabled: z.boolean().default(false),
  syncDirection: z.enum(["inbound", "outbound", "bidirectional"]),
  syncFrequency: z.enum(["realtime", "hourly", "daily", "manual"]),
  scheduledSyncEnabled: z.boolean().default(false),
  scheduledSyncIntervalMinutes: z.coerce.number().min(5).max(1440).default(60),
});

type SAPConfigForm = z.infer<typeof sapConfigSchema>;

interface ConnectionTestResult {
  success: boolean;
  usedMock: boolean;
  latencyMs?: number;
  systemInfo?: { systemId: string; systemType: string; release?: string; description?: string };
  error?: string;
}

const defaultFieldMappings: FieldMapping[] = [
  { sourceField: "MATNR", targetField: "productName", transformation: "trim" },
  { sourceField: "MAKTX", targetField: "productCategory" },
  { sourceField: "WERKS", targetField: "manufacturer" },
  { sourceField: "CHARG", targetField: "batchNumber" },
  { sourceField: "MATNR_EXT", targetField: "sku" },
  { sourceField: "MATKL", targetField: "materials" },
  { sourceField: "MEINS", targetField: "modelNumber" },
];

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>;
    case "error":
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
    case "pending":
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    default:
      return <Badge variant="outline">Inactive</Badge>;
  }
}

export default function SAPConnector() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("config");
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);

  const { data: connectors, isLoading } = useQuery<EnterpriseConnector[]>({
    queryKey: ["/api/integrations/connectors"],
  });

  const sapConnector = connectors?.find(c => c.connectorType === "sap");

  const form = useForm<SAPConfigForm>({
    resolver: zodResolver(sapConfigSchema),
    defaultValues: {
      name: "SAP Production",
      systemType: "S4HANA",
      hostname: "",
      port: 443,
      client: "100",
      systemId: "",
      apiType: "OData",
      sslVerify: true,
      authMethod: "basic",
      username: "",
      password: "",
      oauthClientId: "",
      oauthClientSecret: "",
      oauthTokenUrl: "",
      oauthScope: "",
      oauthEnabled: false,
      syncDirection: "inbound",
      syncFrequency: "daily",
      scheduledSyncEnabled: false,
      scheduledSyncIntervalMinutes: 60,
    },
  });

  const watchedAuthMethod = form.watch("authMethod");
  const watchedScheduled = form.watch("scheduledSyncEnabled");

  useEffect(() => {
    if (sapConnector) {
      const config = sapConnector.config as SAPConfig;
      form.reset({
        name: sapConnector.name,
        systemType: config?.systemType ?? "S4HANA",
        hostname: config?.hostname ?? "",
        port: config?.port ?? 443,
        client: config?.client ?? "100",
        systemId: config?.systemId ?? "",
        apiType: config?.apiType ?? "OData",
        sslVerify: config?.sslVerify !== false,
        authMethod: config?.authMethod ?? (config?.oauthEnabled ? "oauth2" : "basic"),
        username: config?.username ?? "",
        password: config?.password ?? "",
        oauthClientId: config?.oauthClientId ?? "",
        oauthClientSecret: config?.oauthClientSecret ?? "",
        oauthTokenUrl: config?.oauthTokenUrl ?? "",
        oauthScope: config?.oauthScope ?? "",
        oauthEnabled: config?.oauthEnabled ?? false,
        syncDirection: sapConnector.syncDirection ?? "inbound",
        syncFrequency: config?.syncFrequency ?? "daily",
        scheduledSyncEnabled: config?.scheduledSyncEnabled ?? false,
        scheduledSyncIntervalMinutes: config?.scheduledSyncIntervalMinutes ?? 60,
      });
    }
  }, [sapConnector, form]);

  const saveConnector = useMutation({
    mutationFn: async (data: SAPConfigForm) => {
      const sapConfig: SAPConfig = {
        systemType: data.systemType,
        hostname: data.hostname,
        port: data.port,
        client: data.client,
        systemId: data.systemId,
        apiType: data.apiType,
        sslVerify: data.sslVerify,
        authMethod: data.authMethod,
        username: data.username,
        password: data.password,
        oauthClientId: data.oauthClientId,
        oauthClientSecret: data.oauthClientSecret,
        oauthTokenUrl: data.oauthTokenUrl,
        oauthScope: data.oauthScope,
        oauthEnabled: data.authMethod === "oauth2",
        syncFrequency: data.syncFrequency,
        scheduledSyncEnabled: data.scheduledSyncEnabled,
        scheduledSyncIntervalMinutes: data.scheduledSyncIntervalMinutes,
      };

      const payload = {
        name: data.name,
        connectorType: "sap" as const,
        status: "pending" as const,
        syncDirection: data.syncDirection,
        config: sapConfig,
        fieldMappings: sapConnector?.fieldMappings ?? defaultFieldMappings,
      };

      if (sapConnector) {
        return apiRequest("PATCH", `/api/integrations/connectors/${sapConnector.id}`, payload);
      }
      return apiRequest("POST", "/api/integrations/connectors", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/connectors"] });
      toast({ title: "Configuration saved", description: "SAP connector settings have been updated." });
    },
    onError: () => {
      toast({ title: "Save failed", description: "Failed to save connector configuration.", variant: "destructive" });
    },
  });

  const testConnection = useMutation({
    mutationFn: async (): Promise<ConnectionTestResult> => {
      const data = form.getValues();
      const sapConfig: SAPConfig = {
        systemType: data.systemType,
        hostname: data.hostname,
        port: data.port,
        client: data.client,
        systemId: data.systemId,
        apiType: data.apiType,
        sslVerify: data.sslVerify,
        authMethod: data.authMethod,
        username: data.username,
        password: data.password,
        oauthClientId: data.oauthClientId,
        oauthClientSecret: data.oauthClientSecret,
        oauthTokenUrl: data.oauthTokenUrl,
        oauthEnabled: data.authMethod === "oauth2",
        syncFrequency: data.syncFrequency,
      };
      const response = await apiRequest("POST", "/api/sap/test-connection", sapConfig);
      return response.json() as Promise<ConnectionTestResult>;
    },
    onSuccess: (result: ConnectionTestResult) => {
      setTestResult(result);
      if (result.success) {
        toast({
          title: result.usedMock ? "Demo connection verified" : "Connection successful",
          description: result.systemInfo
            ? `Connected to ${result.systemInfo.systemId} (${result.systemInfo.systemType})${result.latencyMs ? ` — ${result.latencyMs}ms` : ""}`
            : "SAP system responded successfully.",
        });
      } else {
        toast({ title: "Connection failed", description: result.error ?? "Check your hostname and credentials.", variant: "destructive" });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/connectors"] });
    },
    onError: (err) => {
      toast({ title: "Test failed", description: err instanceof Error ? err.message : "Unexpected error", variant: "destructive" });
    },
  });

  const triggerSync = useMutation({
    mutationFn: async () => {
      if (!sapConnector) throw new Error("No connector configured");
      return apiRequest("POST", `/api/integrations/connectors/${sapConnector.id}/sync`);
    },
    onSuccess: () => {
      toast({ title: "Sync started", description: "Product data synchronization has been initiated." });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/connectors"] });
    },
    onError: () => {
      toast({ title: "Sync failed", description: "Could not start synchronization.", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 rounded-lg">
            <SiSap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-sap-title">SAP Connector</h1>
            <p className="text-muted-foreground">Connect your SAP system to sync product master data</p>
          </div>
        </div>
        {sapConnector && <StatusBadge status={sapConnector.status} />}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="config" data-testid="tab-config">
            <Settings2 className="w-4 h-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="mapping" data-testid="tab-mapping">
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Field Mapping
          </TabsTrigger>
          <TabsTrigger value="sync" data-testid="tab-sync">
            <Database className="w-4 h-4 mr-2" />
            Sync Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connection Settings</CardTitle>
              <CardDescription>Configure your SAP system connection details</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => saveConnector.mutate(data))} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Connection Name</FormLabel>
                          <FormControl>
                            <Input placeholder="SAP Production" {...field} data-testid="input-connection-name" />
                          </FormControl>
                          <FormDescription>A friendly name for this connection</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="systemType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SAP System Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-system-type">
                                <SelectValue placeholder="Select system type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="S4HANA">S/4HANA</SelectItem>
                              <SelectItem value="ECC">ECC (ERP Central Component)</SelectItem>
                              <SelectItem value="Business_One">Business One</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hostname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hostname / Server URL</FormLabel>
                          <FormControl>
                            <Input placeholder="sap-prod.company.com" {...field} data-testid="input-hostname" />
                          </FormControl>
                          <FormDescription>Your SAP server hostname or IP address</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="port"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Port</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="443" {...field} data-testid="input-port" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="client"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client</FormLabel>
                          <FormControl>
                            <Input placeholder="100" {...field} data-testid="input-client" />
                          </FormControl>
                          <FormDescription>SAP client number</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="systemId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>System ID (SID)</FormLabel>
                          <FormControl>
                            <Input placeholder="PRD" {...field} data-testid="input-system-id" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="apiType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-api-type">
                                <SelectValue placeholder="Select API type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="OData">OData (Recommended)</SelectItem>
                              <SelectItem value="RFC">RFC (Remote Function Call)</SelectItem>
                              <SelectItem value="IDoc">IDoc (Intermediate Document)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>How to communicate with SAP</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="syncDirection"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sync Direction</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-sync-direction">
                                <SelectValue placeholder="Select direction" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="inbound">Inbound (SAP to PhotonicTag)</SelectItem>
                              <SelectItem value="outbound">Outbound (PhotonicTag to SAP)</SelectItem>
                              <SelectItem value="bidirectional">Bidirectional</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="syncFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sync Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-sync-frequency">
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="realtime">Real-time (Webhooks)</SelectItem>
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="manual">Manual Only</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField control={form.control} name="sslVerify" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 col-span-2">
                        <div className="space-y-0.5">
                          <FormLabel>Verify SSL Certificate</FormLabel>
                          <FormDescription>Disable only for self-signed certs in dev environments</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-ssl" />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>

                  <Separator />

                  {/* ── Authentication ── */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <KeyRound className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-sm">Authentication</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="authMethod" render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Authentication Method</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-auth-method">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="basic">Basic Auth (Username / Password)</SelectItem>
                              <SelectItem value="oauth2">OAuth 2.0 Client Credentials</SelectItem>
                              <SelectItem value="saml">SAML 2.0</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {watchedAuthMethod === "basic" && (
                        <>
                          <FormField control={form.control} name="username" render={({ field }) => (
                            <FormItem>
                              <FormLabel>SAP Username</FormLabel>
                              <FormControl><Input placeholder="PT_USER" autoComplete="off" {...field} data-testid="input-sap-username" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem>
                              <FormLabel>SAP Password</FormLabel>
                              <FormControl><Input type="password" placeholder="••••••••" autoComplete="new-password" {...field} data-testid="input-sap-password" /></FormControl>
                              <FormDescription>Stored encrypted. Rotate regularly.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </>
                      )}

                      {watchedAuthMethod === "oauth2" && (
                        <>
                          <FormField control={form.control} name="oauthClientId" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Client ID</FormLabel>
                              <FormControl><Input placeholder="sb-xxxxxxxx-xxxx" {...field} data-testid="input-oauth-client-id" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="oauthClientSecret" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Client Secret</FormLabel>
                              <FormControl><Input type="password" placeholder="••••••••" autoComplete="new-password" {...field} data-testid="input-oauth-client-secret" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="oauthTokenUrl" render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Token URL</FormLabel>
                              <FormControl><Input placeholder="https://your-subaccount.authentication.eu10.hana.ondemand.com/oauth/token" {...field} data-testid="input-oauth-token-url" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="oauthScope" render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>OAuth Scopes (optional)</FormLabel>
                              <FormControl><Input placeholder="API_PRODUCT_SRV" {...field} data-testid="input-oauth-scope" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </>
                      )}

                      {watchedAuthMethod === "saml" && (
                        <div className="col-span-2 p-3 bg-muted/40 rounded-lg text-sm text-muted-foreground">
                          SAML 2.0 authentication is configured at the SAP Identity Provider level.
                          Contact your SAP Basis team to configure the service provider settings.
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* ── Sync scheduling ── */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <RefreshCw className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-sm">Sync Scheduling</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="syncDirection" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sync Direction</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-sync-direction"><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="inbound">Inbound (SAP → PhotonicTag)</SelectItem>
                              <SelectItem value="outbound">Outbound (PhotonicTag → SAP)</SelectItem>
                              <SelectItem value="bidirectional">Bidirectional</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="syncFrequency" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sync Frequency</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-sync-frequency"><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="realtime">Real-time (Webhooks)</SelectItem>
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="manual">Manual Only</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="scheduledSyncEnabled" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 col-span-2">
                          <div className="space-y-0.5">
                            <FormLabel>Automatic Scheduled Sync</FormLabel>
                            <FormDescription>Run sync automatically at the configured interval</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-scheduled-sync" />
                          </FormControl>
                        </FormItem>
                      )} />

                      {watchedScheduled && (
                        <FormField control={form.control} name="scheduledSyncIntervalMinutes" render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Sync Interval (minutes)</FormLabel>
                            <FormControl><Input type="number" min={5} max={1440} {...field} data-testid="input-sync-interval" /></FormControl>
                            <FormDescription>Minimum 5 minutes, maximum 1440 (24h)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Test result alert */}
                  {testResult && (
                    <Alert className={testResult.success ? "border-green-600/30 bg-green-50 dark:bg-green-950/20" : "border-destructive/30 bg-destructive/5"}>
                      {testResult.success
                        ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                        : <XCircle className="h-4 w-4 text-destructive" />
                      }
                      <AlertDescription>
                        {testResult.success ? (
                          <span>
                            {testResult.usedMock ? "Demo mode — " : ""}
                            Connected to <strong>{testResult.systemInfo?.systemId}</strong> ({testResult.systemInfo?.systemType})
                            {testResult.systemInfo?.release && ` · Release ${testResult.systemInfo.release}`}
                            {testResult.latencyMs && ` · ${testResult.latencyMs}ms latency`}
                            {testResult.usedMock && " · Using mock data (configure real hostname for live connection)"}
                          </span>
                        ) : (
                          <span>Connection failed: {testResult.error}</span>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-3 flex-wrap">
                    <Button type="submit" disabled={saveConnector.isPending} data-testid="button-save-config">
                      {saveConnector.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Save Configuration
                    </Button>
                    <Button type="button" variant="outline" onClick={() => testConnection.mutate()} disabled={testConnection.isPending} data-testid="button-test-connection">
                      {testConnection.isPending
                        ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        : testResult?.success ? <Wifi className="w-4 h-4 mr-2 text-green-600" /> : <Server className="w-4 h-4 mr-2" />
                      }
                      {testConnection.isPending ? "Testing..." : "Test Connection"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Field Mapping</CardTitle>
              <CardDescription>Map SAP material master fields to PhotonicTag DPP fields</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 font-medium text-sm text-muted-foreground border-b pb-2">
                  <div>SAP Field</div>
                  <div>PhotonicTag Field</div>
                  <div>Transformation</div>
                </div>
                {defaultFieldMappings.map((mapping, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 items-center" data-testid={`row-mapping-${index}`}>
                    <Input value={mapping.sourceField} readOnly className="bg-muted font-mono text-sm" />
                    <Input value={mapping.targetField} readOnly className="bg-muted font-mono text-sm" />
                    <Input value={mapping.transformation || "none"} readOnly className="bg-muted text-sm" />
                  </div>
                ))}
                <p className="text-sm text-muted-foreground mt-4">
                  Field mappings define how SAP material master data maps to PhotonicTag product fields.
                  Contact support for custom mapping configurations.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products Synced</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-products-synced">{sapConnector?.productsSynced || 0}</div>
                <p className="text-xs text-muted-foreground">Total products imported from SAP</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-last-sync">
                  {sapConnector?.lastSyncAt ? new Date(sapConnector.lastSyncAt).toLocaleDateString() : "Never"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {sapConnector?.lastSyncStatus || "No sync history"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-sync-status">
                  {sapConnector?.status === "active" ? "Ready" : "Not Connected"}
                </div>
                <p className="text-xs text-muted-foreground">Connection health</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Manual Sync</CardTitle>
              <CardDescription>Trigger a manual synchronization of product data from SAP</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button
                onClick={() => triggerSync.mutate()}
                disabled={!sapConnector || sapConnector.status !== "active" || triggerSync.isPending}
                data-testid="button-trigger-sync"
              >
                {triggerSync.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Now
              </Button>
              <p className="text-sm text-muted-foreground self-center">
                {sapConnector?.status === "active"
                  ? "Pull latest product data from your SAP system"
                  : "Configure and test connection first"}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
