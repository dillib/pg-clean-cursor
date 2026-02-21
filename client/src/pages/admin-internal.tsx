import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import {
  Users, Zap, HeadphonesIcon, BarChart3,
  Building, Heart, Check, X, Clock, AlertTriangle,
  Plus, Loader2, Rocket, Tag, Shield, Cpu,
  TrendingUp, ChevronRight, Search, Eye, UserPlus, Trash2, Edit, KeyRound,
} from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type {
  CustomerAccount, AccountActivity, NextBestAction,
  SupportTicket, DemoConfig,
  AccountStatus, AccountTier, TicketPriority, TicketStatus,
} from "@shared/schema";

const ACCOUNT_STATUS_COLORS: Record<string, string> = {
  prospect: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  active: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  churning: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  churned: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  paused: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
  urgent: "bg-red-100 text-red-700",
};

const TICKET_STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  waiting_on_customer: "bg-purple-100 text-purple-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

function HealthScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-green-500" : score >= 40 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 bg-muted rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-medium">{score}</span>
    </div>
  );
}

// ==========================================
// CRM TAB
// ==========================================

function CRMTab() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const { data: accounts = [], isLoading } = useQuery<CustomerAccount[]>({
    queryKey: ["/api/internal/accounts"],
  });

  const { data: pendingActions = [] } = useQuery<NextBestAction[]>({
    queryKey: ["/api/internal/actions/pending"],
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/internal/accounts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internal/accounts"] });
      setShowCreateDialog(false);
      toast({ title: "Account created" });
    },
  });

  const generateHealthMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/internal/accounts/${id}/health-score`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internal/accounts"] });
      toast({ title: "Health score updated" });
    },
    onError: () => toast({ title: "Failed to calculate health score", variant: "destructive" }),
  });

  const generateActionsMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/internal/accounts/${id}/generate-actions`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internal/actions/pending"] });
      toast({ title: "Actions generated" });
    },
    onError: () => toast({ title: "Failed to generate actions", variant: "destructive" }),
  });

  const updateActionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/internal/actions/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internal/actions/pending"] });
      toast({ title: "Action updated" });
    },
  });

  const filteredAccounts = accounts.filter(a =>
    a.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMRR = accounts.reduce((sum, a) => sum + (a.mrr || 0), 0);
  const avgHealth = accounts.length > 0 ? Math.round(accounts.reduce((sum, a) => sum + (a.healthScore || 0), 0) / accounts.length) : 0;
  const atRiskCount = accounts.filter(a => (a.healthScore || 0) < 40).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="card-total-accounts">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Accounts</p>
                <p className="text-2xl font-bold">{accounts.length}</p>
              </div>
              <Building className="w-8 h-8 text-primary/30" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-total-mrr">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total MRR</p>
                <p className="text-2xl font-bold">${totalMRR.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-avg-health">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Health Score</p>
                <p className="text-2xl font-bold">{avgHealth}/100</p>
              </div>
              <Heart className="w-8 h-8 text-red-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-at-risk">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold">{atRiskCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {pendingActions.length > 0 && (
        <Card data-testid="card-pending-actions">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              AI Next Best Actions
            </CardTitle>
            <CardDescription>{pendingActions.length} pending recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingActions.slice(0, 5).map(action => (
                <div key={action.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={PRIORITY_COLORS[action.priority]}>{action.priority}</Badge>
                      {action.category && <Badge variant="outline" className="text-xs">{action.category}</Badge>}
                    </div>
                    <p className="text-sm font-medium">{action.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">{action.reasoning}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateActionMutation.mutate({ id: action.id, status: "completed" })} data-testid={`button-action-complete-${action.id}`}>
                      <Check className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateActionMutation.mutate({ id: action.id, status: "dismissed" })} data-testid={`button-action-dismiss-${action.id}`}>
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card data-testid="card-accounts-list">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle>Customer Accounts</CardTitle>
              <CardDescription>Unified tracking for prospects and active customers</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search accounts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 w-48" data-testid="input-search-accounts" />
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-account"><Plus className="w-4 h-4 mr-1" /> Add Account</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Customer Account</DialogTitle>
                    <DialogDescription>Add a new prospect or customer account</DialogDescription>
                  </DialogHeader>
                  <CreateAccountForm onSubmit={(data) => createAccountMutation.mutate(data)} isPending={createAccountMutation.isPending} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-12">
              <Building className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No accounts yet</h3>
              <p className="text-muted-foreground text-sm">Create your first customer account to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAccounts.map(account => (
                <div key={account.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors" data-testid={`account-row-${account.id}`}>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Building className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{account.companyName}</span>
                      <Badge className={ACCOUNT_STATUS_COLORS[account.status]} variant="secondary">{account.status}</Badge>
                      <Badge variant="outline" className="text-xs capitalize">{account.tier}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                      <span>{account.contactName}</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span>{account.contactEmail}</span>
                      {account.industry && (
                        <>
                          <span className="text-muted-foreground/50">•</span>
                          <span>{account.industry}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:block"><HealthScoreBar score={account.healthScore || 0} /></div>
                  <div className="text-sm font-medium hidden md:block">${(account.mrr || 0).toLocaleString()}/mo</div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => generateHealthMutation.mutate(account.id)} disabled={generateHealthMutation.isPending} data-testid={`button-health-${account.id}`}>
                      {generateHealthMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Heart className="w-3 h-3" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => generateActionsMutation.mutate(account.id)} disabled={generateActionsMutation.isPending} data-testid={`button-actions-${account.id}`}>
                      {generateActionsMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CreateAccountForm({ onSubmit, isPending }: { onSubmit: (data: Record<string, unknown>) => void; isPending: boolean }) {
  const [form, setForm] = useState({
    companyName: "", contactName: "", contactEmail: "", contactPhone: "",
    industry: "", tier: "free", status: "prospect", mrr: 0,
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Company Name *</Label><Input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} data-testid="input-company-name" /></div>
        <div><Label>Contact Name *</Label><Input value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} data-testid="input-contact-name" /></div>
        <div><Label>Email *</Label><Input type="email" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} data-testid="input-contact-email" /></div>
        <div><Label>Phone</Label><Input value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} data-testid="input-contact-phone" /></div>
        <div><Label>Industry</Label><Input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} data-testid="input-industry" /></div>
        <div>
          <Label>Tier</Label>
          <Select value={form.tier} onValueChange={v => setForm({ ...form, tier: v })}>
            <SelectTrigger data-testid="select-tier"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="growth">Growth</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
            <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="churning">Churning</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>MRR ($)</Label><Input type="number" value={form.mrr} onChange={e => setForm({ ...form, mrr: parseInt(e.target.value) || 0 })} data-testid="input-mrr" /></div>
      </div>
      <Button onClick={() => onSubmit(form)} disabled={isPending || !form.companyName || !form.contactName || !form.contactEmail} className="w-full" data-testid="button-submit-account">
        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
        Create Account
      </Button>
    </div>
  );
}

// ==========================================
// DEMO FACTORY TAB
// ==========================================

const INDUSTRY_TEMPLATES = [
  { label: "Battery Manufacturer", industry: "Batteries", prompt: "Generate 3 industrial battery products for a European battery manufacturer (LFP and NMC chemistry). Include detailed material composition, carbon footprint data, and recycling information for EU Battery Regulation compliance." },
  { label: "Fashion Brand", industry: "Apparel", prompt: "Generate 3 sustainable fashion products for a mid-size European fashion brand. Include organic/recycled materials, water usage data, and supply chain origin information for EU DPP textile compliance." },
  { label: "Electronics Company", industry: "Consumer Electronics", prompt: "Generate 3 consumer electronics products (smart devices, IoT sensors). Include repairability scores, spare parts availability, and e-waste recycling instructions for EU DPP electronics compliance." },
  { label: "EV Components Supplier", industry: "EV Accessories", prompt: "Generate 3 electric vehicle accessory products (charging cables, battery modules, power converters). Include material composition, safety certifications, and end-of-life recycling data." },
  { label: "Packaging Manufacturer", industry: "Industrial Packaging", prompt: "Generate 3 industrial packaging products (cardboard, biodegradable packaging, reusable containers). Include recycled content percentages, recyclability data, and material sourcing information." },
  { label: "Furniture Maker", industry: "Furniture", prompt: "Generate 3 furniture products (office chairs, tables, shelving). Include wood sourcing certifications, VOC emissions data, repairability scores, and disassembly instructions." },
];

function DemoFactoryTab() {
  const { toast } = useToast();
  const [customName, setCustomName] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  const { data: demoConfigs = [], isLoading } = useQuery<DemoConfig[]>({
    queryKey: ["/api/demo-configs"],
  });

  const createDemoMutation = useMutation({
    mutationFn: async (data: { name: string; industry: string; prompt: string }) => {
      const res = await apiRequest("POST", "/api/demo-configs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/demo-configs"] });
      setCustomName("");
      setCustomIndustry("");
      setCustomPrompt("");
      toast({ title: "Demo generation started", description: "AI is generating products. This may take a moment." });
    },
    onError: () => toast({ title: "Failed to generate demo", variant: "destructive" }),
  });

  const deleteDemoMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/demo-configs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/demo-configs"] });
      toast({ title: "Demo deleted" });
    },
  });

  const handleTemplateClick = (template: typeof INDUSTRY_TEMPLATES[0]) => {
    if (createDemoMutation.isPending) return;
    createDemoMutation.mutate({
      name: `${template.label} Demo`,
      industry: template.industry,
      prompt: template.prompt,
    });
  };

  const handleCustomGenerate = () => {
    if (!customName || !customIndustry || !customPrompt) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    createDemoMutation.mutate({ name: customName, industry: customIndustry, prompt: customPrompt });
  };

  const readyDemos = demoConfigs.filter(d => d.status === "ready");
  const generatingDemos = demoConfigs.filter(d => d.status === "generating");

  const DEMO_STATUS_COLORS: Record<string, string> = {
    generating: "bg-blue-100 text-blue-700",
    ready: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Ready Demos</p><p className="text-2xl font-bold">{readyDemos.length}</p></div>
            <Rocket className="w-8 h-8 text-green-500/30" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Generating</p><p className="text-2xl font-bold">{generatingDemos.length}</p></div>
            <Loader2 className="w-8 h-8 text-blue-500/30" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Total Created</p><p className="text-2xl font-bold">{demoConfigs.length}</p></div>
            <Tag className="w-8 h-8 text-purple-500/30" />
          </div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Industry Templates</CardTitle>
          <CardDescription>Click a template to instantly generate a demo with AI-created products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {INDUSTRY_TEMPLATES.map(template => (
              <div
                key={template.label}
                className="p-4 rounded-lg border cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all"
                onClick={() => handleTemplateClick(template)}
                data-testid={`button-template-${template.industry.toLowerCase().replace(/\s/g, '-')}`}
              >
                <div className="font-medium text-sm mb-1">{template.label}</div>
                <div className="text-xs text-muted-foreground">{template.industry}</div>
              </div>
            ))}
          </div>
          {createDemoMutation.isPending && (
            <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-700 dark:text-blue-300">Generating demo products with AI...</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Custom Demo</CardTitle>
          <CardDescription>Write your own prompt to generate a demo tailored to a specific prospect</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Demo Name</Label><Input placeholder="e.g., Acme Corp Battery Demo" value={customName} onChange={e => setCustomName(e.target.value)} data-testid="input-custom-demo-name" /></div>
            <div><Label>Industry</Label><Input placeholder="e.g., Batteries, Textiles" value={customIndustry} onChange={e => setCustomIndustry(e.target.value)} data-testid="input-custom-demo-industry" /></div>
          </div>
          <div>
            <Label>Prompt</Label>
            <Textarea placeholder="Describe the products you want to generate. Include details about materials, sustainability goals, and compliance needs..." value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} rows={4} data-testid="input-custom-demo-prompt" />
          </div>
          <Button onClick={handleCustomGenerate} disabled={createDemoMutation.isPending} className="gap-2" data-testid="button-generate-custom-demo">
            {createDemoMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            Generate Demo
          </Button>
        </CardContent>
      </Card>

      <Card data-testid="card-generated-demos">
        <CardHeader>
          <CardTitle className="text-lg">Generated Demos</CardTitle>
          <CardDescription>Previously created demo configurations with AI-generated products</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : demoConfigs.length === 0 ? (
            <div className="text-center py-12">
              <Rocket className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No demos yet</h3>
              <p className="text-muted-foreground text-sm">Use a template above or create a custom demo to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {demoConfigs.map(config => (
                <div key={config.id} className="flex items-center gap-4 p-4 rounded-lg border" data-testid={`demo-config-${config.id}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{config.name}</span>
                      <Badge className={DEMO_STATUS_COLORS[config.status]}>
                        {config.status === "generating" && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                        {config.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{config.industry}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{config.prompt}</p>
                    {config.generatedProducts && (config.generatedProducts as unknown[]).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">{(config.generatedProducts as unknown[]).length} products generated</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:block">{format(new Date(config.createdAt), "MMM d, yyyy")}</span>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this demo?")) deleteDemoMutation.mutate(config.id); }} data-testid={`button-delete-demo-${config.id}`}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ==========================================
// SUPPORT TRIAGE TAB
// ==========================================

function SupportTriageTab() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/internal/tickets"],
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/internal/tickets", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internal/tickets"] });
      setShowCreateDialog(false);
      toast({ title: "Ticket created", description: "AI is analyzing and categorizing..." });
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const res = await apiRequest("PATCH", `/api/internal/tickets/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internal/tickets"] });
      toast({ title: "Ticket updated" });
    },
  });

  const filteredTickets = statusFilter === "all" ? tickets : tickets.filter(t => t.status === statusFilter);
  const openTickets = tickets.filter(t => t.status === "open");
  const urgentTickets = tickets.filter(t => t.priority === "urgent" || t.priority === "high");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Total Tickets</p><p className="text-2xl font-bold">{tickets.length}</p></div>
            <HeadphonesIcon className="w-8 h-8 text-primary/30" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Open</p><p className="text-2xl font-bold">{openTickets.length}</p></div>
            <Clock className="w-8 h-8 text-blue-500/30" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Urgent/High</p><p className="text-2xl font-bold">{urgentTickets.length}</p></div>
            <AlertTriangle className="w-8 h-8 text-red-500/30" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">AI Triaged</p><p className="text-2xl font-bold">{tickets.filter(t => t.aiSummary).length}</p></div>
            <Zap className="w-8 h-8 text-yellow-500/30" />
          </div>
        </CardContent></Card>
      </div>

      <Card data-testid="card-tickets-list">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>AI-powered triage with auto-categorization</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40" data-testid="select-ticket-filter"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="waiting_on_customer">Waiting</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-ticket"><Plus className="w-4 h-4 mr-1" /> New Ticket</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create Support Ticket</DialogTitle>
                    <DialogDescription>AI will automatically analyze, categorize, and prioritize</DialogDescription>
                  </DialogHeader>
                  <CreateTicketForm onSubmit={(data) => createTicketMutation.mutate(data)} isPending={createTicketMutation.isPending} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <HeadphonesIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No tickets</h3>
              <p className="text-muted-foreground text-sm">Create a support ticket to test AI triage</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map(ticket => (
                <Dialog key={ticket.id}>
                  <DialogTrigger asChild>
                    <div className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors" data-testid={`ticket-row-${ticket.id}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium">{ticket.subject}</span>
                            <Badge className={TICKET_STATUS_COLORS[ticket.status] || ""}>{ticket.status.replace(/_/g, " ")}</Badge>
                            <Badge className={PRIORITY_COLORS[ticket.priority]}>{ticket.priority}</Badge>
                            <Badge variant="outline" className="text-xs">{ticket.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{ticket.submitterName || ticket.submitterEmail} • {format(new Date(ticket.createdAt), "MMM d, yyyy")}</p>
                          {ticket.aiSummary && (
                            <div className="mt-2 p-2 rounded bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                              <div className="flex items-center gap-1 text-xs font-medium text-yellow-700 dark:text-yellow-400 mb-1">
                                <Zap className="w-3 h-3" /> AI Summary
                              </div>
                              <p className="text-xs text-yellow-800 dark:text-yellow-300">{ticket.aiSummary}</p>
                            </div>
                          )}
                          {((ticket.aiSuggestedTags as string[]) || []).length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {((ticket.aiSuggestedTags as string[]) || []).map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{ticket.subject}</DialogTitle>
                      <DialogDescription>{ticket.submitterName || ticket.submitterEmail}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-3 bg-muted rounded-lg text-sm">{ticket.description}</div>
                      {ticket.aiSummary && (
                        <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                          <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400 mb-1 flex items-center gap-1"><Zap className="w-3 h-3" /> AI Analysis</p>
                          <p className="text-sm">{ticket.aiSummary}</p>
                          {ticket.aiSuggestedPriority && <p className="text-xs mt-1">Suggested Priority: <strong>{ticket.aiSuggestedPriority}</strong></p>}
                          {ticket.aiSuggestedCategory && <p className="text-xs">Suggested Category: <strong>{ticket.aiSuggestedCategory}</strong></p>}
                        </div>
                      )}
                      <div>
                        <Label>Update Status</Label>
                        <Select value={ticket.status} onValueChange={v => updateTicketMutation.mutate({ id: ticket.id, updates: { status: v } })}>
                          <SelectTrigger data-testid="select-update-ticket-status"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="waiting_on_customer">Waiting on Customer</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CreateTicketForm({ onSubmit, isPending }: { onSubmit: (data: Record<string, unknown>) => void; isPending: boolean }) {
  const [form, setForm] = useState({
    subject: "", description: "", submitterEmail: "", submitterName: "",
    priority: "medium", category: "general",
  });

  return (
    <div className="space-y-4">
      <div><Label>Subject *</Label><Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} data-testid="input-ticket-subject" /></div>
      <div><Label>Description *</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} data-testid="input-ticket-description" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Submitter Email *</Label><Input type="email" value={form.submitterEmail} onChange={e => setForm({ ...form, submitterEmail: e.target.value })} data-testid="input-ticket-email" /></div>
        <div><Label>Submitter Name</Label><Input value={form.submitterName} onChange={e => setForm({ ...form, submitterName: e.target.value })} data-testid="input-ticket-name" /></div>
      </div>
      <Button onClick={() => onSubmit(form)} disabled={isPending || !form.subject || !form.description || !form.submitterEmail} className="w-full" data-testid="button-submit-ticket">
        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
        Create Ticket
      </Button>
    </div>
  );
}

// ==========================================
// PLATFORM OPS TAB
// ==========================================

function PlatformOpsTab() {
  const { data: health, isLoading } = useQuery<{
    status: string;
    uptime: number;
    uptimeFormatted: string;
    memory: { rss: number; heapUsed: number; heapTotal: number; external: number };
    counts: { products: number; accounts: number; tickets: number; openTickets: number; activeDemos: number; totalDemos: number };
    timestamp: string;
  }>({
    queryKey: ["/api/internal/ops/health"],
    refetchInterval: 30000,
  });

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-system-status">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-xl font-bold capitalize">{health?.status || "unknown"}</p>
                </div>
              </div>
              <Shield className="w-8 h-8 text-green-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-uptime">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-xl font-bold">{health?.uptimeFormatted || "0h 0m"}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-memory">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Memory (Heap)</p>
                <p className="text-xl font-bold">{health?.memory?.heapUsed || 0} MB</p>
                <p className="text-xs text-muted-foreground">of {health?.memory?.heapTotal || 0} MB</p>
              </div>
              <Cpu className="w-8 h-8 text-purple-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card data-testid="card-memory-details">
          <CardHeader>
            <CardTitle className="text-lg">Memory Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "RSS (Total)", value: health?.memory?.rss || 0, max: 512, color: "bg-blue-500" },
                { label: "Heap Used", value: health?.memory?.heapUsed || 0, max: health?.memory?.heapTotal || 256, color: "bg-green-500" },
                { label: "External", value: health?.memory?.external || 0, max: 128, color: "bg-purple-500" },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.label}</span>
                    <span className="font-medium">{item.value} MB</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-platform-counts">
          <CardHeader>
            <CardTitle className="text-lg">Platform Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Total Products", value: health?.counts?.products || 0, icon: BarChart3 },
                { label: "Customer Accounts", value: health?.counts?.accounts || 0, icon: Building },
                { label: "Total Tickets", value: health?.counts?.tickets || 0, icon: HeadphonesIcon },
                { label: "Open Tickets", value: health?.counts?.openTickets || 0, icon: AlertTriangle },
                { label: "Active Demos", value: health?.counts?.activeDemos || 0, icon: Rocket },
                { label: "Total Demos", value: health?.counts?.totalDemos || 0, icon: Eye },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <Badge variant="secondary" className="font-mono">{item.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Last refreshed: {health?.timestamp ? format(new Date(health.timestamp), "HH:mm:ss") : "-"}</span>
            <span>Auto-refresh every 30 seconds</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==========================================
// USER MANAGEMENT TAB (Super Admin only)
// ==========================================

type PartnerUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string | null;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
};

function UserManagementTab() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [passwordChangeUser, setPasswordChangeUser] = useState<PartnerUser | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const { data: partners = [], isLoading } = useQuery<PartnerUser[]>({
    queryKey: ["/api/partners"],
  });

  const createPartnerMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/partners", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      setShowCreateDialog(false);
      toast({ title: "User created successfully" });
    },
    onError: () => toast({ title: "Failed to create user", variant: "destructive" }),
  });

  const deletePartnerMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/partners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      toast({ title: "User deleted" });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/partners/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      toast({ title: "User updated" });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      const res = await apiRequest("PATCH", `/api/partners/${id}`, { password });
      return res.json();
    },
    onSuccess: () => {
      setPasswordChangeUser(null);
      setNewPassword("");
      toast({ title: "Password updated successfully" });
    },
    onError: () => toast({ title: "Failed to update password", variant: "destructive" }),
  });

  const activeUsers = partners.filter(p => p.status === "active");
  const inactiveUsers = partners.filter(p => p.status !== "active");

  const ROLE_LABELS: Record<string, string> = {
    sales_partner: "Sales Partner",
    reseller: "Reseller",
    consultant: "Consultant",
    demo_viewer: "Demo Viewer",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Total Users</p><p className="text-2xl font-bold">{partners.length}</p></div>
            <Users className="w-8 h-8 text-blue-500/30" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Active</p><p className="text-2xl font-bold">{activeUsers.length}</p></div>
            <Check className="w-8 h-8 text-green-500/30" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Inactive</p><p className="text-2xl font-bold">{inactiveUsers.length}</p></div>
            <X className="w-8 h-8 text-red-500/30" />
          </div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">Internal Users</CardTitle>
              <CardDescription>Manage team members who can access CRM, Demo Factory, and product demos</CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-user"><UserPlus className="w-4 h-4 mr-1" /> Add User</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>Add a new team member with access to internal tools</DialogDescription>
                </DialogHeader>
                <CreateUserForm onSubmit={(data) => createPartnerMutation.mutate(data)} isPending={createPartnerMutation.isPending} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : partners.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No users yet</h3>
              <p className="text-muted-foreground text-sm">Create your first internal user to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {partners.map(partner => (
                <div key={partner.id} className="flex items-center gap-4 p-4 rounded-lg border" data-testid={`user-row-${partner.id}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{partner.firstName} {partner.lastName}</span>
                      <Badge className={partner.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                        {partner.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{ROLE_LABELS[partner.role] || partner.role}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex gap-2 flex-wrap">
                      <span>{partner.email}</span>
                      {partner.company && <><span>•</span><span>{partner.company}</span></>}
                      {partner.lastLoginAt && <><span>•</span><span>Last login: {format(new Date(partner.lastLoginAt), "MMM d, yyyy")}</span></>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setPasswordChangeUser(partner); setNewPassword(""); }}
                      title="Change Password"
                      data-testid={`button-password-user-${partner.id}`}
                    >
                      <KeyRound className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleStatusMutation.mutate({ id: partner.id, status: partner.status === "active" ? "inactive" : "active" })}
                      title={partner.status === "active" ? "Deactivate" : "Activate"}
                      data-testid={`button-toggle-user-${partner.id}`}
                    >
                      {partner.status === "active" ? <X className="w-4 h-4 text-muted-foreground" /> : <Check className="w-4 h-4 text-green-600" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { if (confirm("Delete this user? This cannot be undone.")) deletePartnerMutation.mutate(partner.id); }}
                      data-testid={`button-delete-user-${partner.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!passwordChangeUser} onOpenChange={(open) => { if (!open) { setPasswordChangeUser(null); setNewPassword(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for {passwordChangeUser?.firstName} {passwordChangeUser?.lastName} ({passwordChangeUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                data-testid="input-new-password"
              />
            </div>
            <Button
              onClick={() => passwordChangeUser && changePasswordMutation.mutate({ id: passwordChangeUser.id, password: newPassword })}
              disabled={changePasswordMutation.isPending || newPassword.length < 6}
              className="w-full"
              data-testid="button-submit-password"
            >
              {changePasswordMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
              Update Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateUserForm({ onSubmit, isPending }: { onSubmit: (data: Record<string, unknown>) => void; isPending: boolean }) {
  const [form, setForm] = useState({
    email: "", password: "", firstName: "", lastName: "",
    company: "", role: "demo_viewer",
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>First Name *</Label><Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} data-testid="input-user-firstname" /></div>
        <div><Label>Last Name *</Label><Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} data-testid="input-user-lastname" /></div>
      </div>
      <div><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} data-testid="input-user-email" /></div>
      <div><Label>Password *</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} data-testid="input-user-password" placeholder="Min 6 characters" /></div>
      <div><Label>Company</Label><Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} data-testid="input-user-company" /></div>
      <div>
        <Label>Role</Label>
        <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
          <SelectTrigger data-testid="select-user-role"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="sales_partner">Sales Partner</SelectItem>
            <SelectItem value="reseller">Reseller</SelectItem>
            <SelectItem value="consultant">Consultant</SelectItem>
            <SelectItem value="demo_viewer">Demo Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={() => onSubmit(form)} disabled={isPending || !form.email || !form.password || !form.firstName || !form.lastName} className="w-full" data-testid="button-submit-user">
        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
        Create User
      </Button>
    </div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

export type AdminInternalMode = "full" | "internal";

export default function AdminInternal({ mode = "full" }: { mode?: AdminInternalMode }) {
  const isFull = mode === "full";

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-internal-title">
            {isFull ? "Internal Operations" : "Team Dashboard"}
          </h1>
          <p className="text-muted-foreground">
            {isFull
              ? "AI-driven CRM, demo factory, support triage, user management, and platform monitoring"
              : "CRM and demo management tools"}
          </p>
        </div>
        {isFull && <Badge variant="outline" className="text-sm">Super Admin</Badge>}
      </div>

      {isFull ? (
        <Tabs defaultValue="crm" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5" data-testid="tabs-internal">
            <TabsTrigger value="crm" data-testid="tab-crm" className="gap-1">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">CRM</span>
            </TabsTrigger>
            <TabsTrigger value="demos" data-testid="tab-demos" className="gap-1">
              <Rocket className="w-4 h-4" />
              <span className="hidden sm:inline">Demo Factory</span>
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users" className="gap-1">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="support" data-testid="tab-support" className="gap-1">
              <HeadphonesIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Support</span>
            </TabsTrigger>
            <TabsTrigger value="ops" data-testid="tab-ops" className="gap-1">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Platform Ops</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crm"><CRMTab /></TabsContent>
          <TabsContent value="demos"><DemoFactoryTab /></TabsContent>
          <TabsContent value="users"><UserManagementTab /></TabsContent>
          <TabsContent value="support"><SupportTriageTab /></TabsContent>
          <TabsContent value="ops"><PlatformOpsTab /></TabsContent>
        </Tabs>
      ) : (
        <Tabs defaultValue="crm" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2" data-testid="tabs-internal">
            <TabsTrigger value="crm" data-testid="tab-crm" className="gap-1">
              <Users className="w-4 h-4" />
              <span>CRM</span>
            </TabsTrigger>
            <TabsTrigger value="demos" data-testid="tab-demos" className="gap-1">
              <Rocket className="w-4 h-4" />
              <span>Demo Factory</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crm"><CRMTab /></TabsContent>
          <TabsContent value="demos"><DemoFactoryTab /></TabsContent>
        </Tabs>
      )}
    </div>
  );
}