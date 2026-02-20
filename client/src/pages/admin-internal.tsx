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
import { Separator } from "@/components/ui/separator";
import {
  Users, Activity, Zap, HeadphonesIcon, BarChart3,
  Building, Heart, ArrowRight, Check, X, Clock, AlertTriangle,
  Plus, Loader2, RefreshCw, Rocket, Tag, Shield, Cpu,
  TrendingUp, ChevronRight, Search, Mail, Phone, Eye,
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type {
  CustomerAccount, AccountActivity, NextBestAction,
  DemoInstance, PersonaTemplate, SupportTicket,
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

function DemoFactoryTab() {
  const { toast } = useToast();
  const [showProvisionDialog, setShowProvisionDialog] = useState(false);

  const { data: demos = [], isLoading } = useQuery<DemoInstance[]>({
    queryKey: ["/api/internal/demos"],
  });

  const { data: personas = [] } = useQuery<PersonaTemplate[]>({
    queryKey: ["/api/internal/personas"],
  });

  const seedPersonasMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/internal/personas/seed-defaults");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internal/personas"] });
      toast({ title: "Persona templates seeded" });
    },
  });

  const provisionMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/internal/demos/provision", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internal/demos"] });
      setShowProvisionDialog(false);
      toast({ title: "Demo provisioning started", description: "Products are being generated with AI..." });
    },
    onError: () => toast({ title: "Failed to provision demo", variant: "destructive" }),
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/internal/demos/${id}`, { status: "deactivated" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internal/demos"] });
      toast({ title: "Demo deactivated" });
    },
  });

  const activeDemos = demos.filter(d => d.status === "active");
  const provisioningDemos = demos.filter(d => d.status === "provisioning");

  const DEMO_STATUS_COLORS: Record<string, string> = {
    provisioning: "bg-blue-100 text-blue-700",
    active: "bg-green-100 text-green-700",
    expired: "bg-orange-100 text-orange-700",
    deactivated: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Active Demos</p><p className="text-2xl font-bold">{activeDemos.length}</p></div>
            <Rocket className="w-8 h-8 text-green-500/30" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Provisioning</p><p className="text-2xl font-bold">{provisioningDemos.length}</p></div>
            <Loader2 className="w-8 h-8 text-blue-500/30" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Persona Templates</p><p className="text-2xl font-bold">{personas.length}</p></div>
            <Tag className="w-8 h-8 text-purple-500/30" />
          </div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Industry Persona Templates</CardTitle>
          <CardDescription>Pre-defined templates with sample products and IoT configurations</CardDescription>
        </CardHeader>
        <CardContent>
          {personas.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">No persona templates yet</p>
              <Button onClick={() => seedPersonasMutation.mutate()} disabled={seedPersonasMutation.isPending} data-testid="button-seed-personas">
                {seedPersonasMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Load Default Templates
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {personas.map(p => (
                <div key={p.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors" data-testid={`persona-${p.id}`}>
                  <div className="font-medium mb-1">{p.name}</div>
                  <div className="text-xs text-muted-foreground mb-2">{p.description}</div>
                  <Badge variant="outline" className="text-xs">{p.productCount} products</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card data-testid="card-demo-instances">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Demo Instances</CardTitle>
              <CardDescription>One-click provisioned demo environments for prospects</CardDescription>
            </div>
            <Dialog open={showProvisionDialog} onOpenChange={setShowProvisionDialog}>
              <DialogTrigger asChild>
                <Button data-testid="button-provision-demo"><Rocket className="w-4 h-4 mr-1" /> Provision Demo</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Provision New Demo</DialogTitle>
                  <DialogDescription>Enter prospect details to spawn a fully seeded demo environment</DialogDescription>
                </DialogHeader>
                <ProvisionDemoForm personas={personas} onSubmit={(data) => provisionMutation.mutate(data)} isPending={provisionMutation.isPending} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : demos.length === 0 ? (
            <div className="text-center py-12">
              <Rocket className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No demo instances</h3>
              <p className="text-muted-foreground text-sm">Provision your first demo to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {demos.map(demo => (
                <div key={demo.id} className="flex items-center gap-4 p-4 rounded-lg border" data-testid={`demo-row-${demo.id}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{demo.prospectName}</span>
                      <Badge className={DEMO_STATUS_COLORS[demo.status]}>{demo.status}</Badge>
                      <Badge variant="outline" className="text-xs">{demo.industry}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex gap-2 flex-wrap">
                      {demo.prospectCompany && <span>{demo.prospectCompany}</span>}
                      {demo.prospectEmail && <><span>•</span><span>{demo.prospectEmail}</span></>}
                      <span>•</span>
                      <span>{(demo.productIds as string[])?.length || 0} products</span>
                      {demo.expiresAt && <><span>•</span><span>Expires {format(new Date(demo.expiresAt), "MMM d, yyyy")}</span></>}
                    </div>
                  </div>
                  {demo.status === "active" && (
                    <Button size="sm" variant="outline" onClick={() => deactivateMutation.mutate(demo.id)} data-testid={`button-deactivate-${demo.id}`}>
                      <X className="w-3 h-3 mr-1" /> Deactivate
                    </Button>
                  )}
                  {demo.status === "provisioning" && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProvisionDemoForm({ personas, onSubmit, isPending }: { personas: PersonaTemplate[]; onSubmit: (data: Record<string, unknown>) => void; isPending: boolean }) {
  const [form, setForm] = useState({
    prospectName: "", prospectEmail: "", prospectCompany: "",
    industry: personas[0]?.industry || "Automotive", personaTemplate: "",
  });

  return (
    <div className="space-y-4">
      <div><Label>Prospect Name *</Label><Input value={form.prospectName} onChange={e => setForm({ ...form, prospectName: e.target.value })} data-testid="input-prospect-name" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Email</Label><Input type="email" value={form.prospectEmail} onChange={e => setForm({ ...form, prospectEmail: e.target.value })} data-testid="input-prospect-email" /></div>
        <div><Label>Company</Label><Input value={form.prospectCompany} onChange={e => setForm({ ...form, prospectCompany: e.target.value })} data-testid="input-prospect-company" /></div>
      </div>
      <div>
        <Label>Industry *</Label>
        <Select value={form.industry} onValueChange={v => setForm({ ...form, industry: v })}>
          <SelectTrigger data-testid="select-industry"><SelectValue /></SelectTrigger>
          <SelectContent>
            {personas.length > 0 ? personas.map(p => (
              <SelectItem key={p.id} value={p.industry}>{p.name} - {p.industry}</SelectItem>
            )) : (
              <>
                <SelectItem value="Automotive">Automotive</SelectItem>
                <SelectItem value="Textiles">Textiles</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Batteries">Batteries</SelectItem>
                <SelectItem value="Packaging">Packaging</SelectItem>
                <SelectItem value="Furniture">Furniture</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={() => onSubmit(form)} disabled={isPending || !form.prospectName || !form.industry} className="w-full" data-testid="button-submit-provision">
        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Rocket className="w-4 h-4 mr-2" />}
        Provision Demo Environment
      </Button>
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
// MAIN PAGE
// ==========================================

export default function AdminInternal() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-internal-title">Internal Operations</h1>
          <p className="text-muted-foreground">AI-driven CRM, demo factory, support triage, and platform monitoring</p>
        </div>
        <Badge variant="outline" className="text-sm">Enterprise Admin</Badge>
      </div>

      <Tabs defaultValue="crm" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4" data-testid="tabs-internal">
          <TabsTrigger value="crm" data-testid="tab-crm" className="gap-1">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">CRM</span>
          </TabsTrigger>
          <TabsTrigger value="demos" data-testid="tab-demos" className="gap-1">
            <Rocket className="w-4 h-4" />
            <span className="hidden sm:inline">Demo Factory</span>
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
        <TabsContent value="support"><SupportTriageTab /></TabsContent>
        <TabsContent value="ops"><PlatformOpsTab /></TabsContent>
      </Tabs>
    </div>
  );
}