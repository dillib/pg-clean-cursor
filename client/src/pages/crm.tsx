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
  Users, TrendingUp, Target, Calendar, Mail, Building, 
  ChevronRight, Search, Filter, ArrowUpRight, ArrowDownRight,
  CheckCircle, Clock, XCircle, Phone, UserPlus, Handshake,
  Wand2, Loader2, Trash2, Eye, EyeOff, Copy, ExternalLink,
  Globe, Database, ClipboardList
} from "lucide-react";
import { useState } from "react";
import { SiSap } from "react-icons/si";
import type { Lead, LeadStatus, TierInterest, Partner, DemoConfig, SAPSystemType } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; icon: any }> = {
  new: { label: "New", color: "bg-amber-500/10 text-amber-600 border-amber-200", icon: Clock },
  contacted: { label: "Contacted", color: "bg-yellow-500/10 text-yellow-600 border-yellow-200", icon: Mail },
  demo_scheduled: { label: "Demo Scheduled", color: "bg-purple-500/10 text-purple-600 border-purple-200", icon: Calendar },
  qualified: { label: "Qualified", color: "bg-green-500/10 text-green-600 border-green-200", icon: Target },
  won: { label: "Won", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200", icon: CheckCircle },
  lost: { label: "Lost", color: "bg-red-500/10 text-red-600 border-red-200", icon: XCircle },
};

const TIER_COLORS: Record<TierInterest, string> = {
  poc: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  starter: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  growth: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  enterprise: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
};

interface LeadStats {
  total: number;
  byStatus: Record<string, number>;
  byTier: Record<string, number>;
  bySource: Record<string, number>;
  thisWeek: number;
  lastWeek: number;
}

const SAP_SYSTEM_LABELS: Record<string, string> = {
  s4hana_cloud: "S/4HANA Cloud", s4hana_onprem: "S/4HANA On-Prem",
  ecc: "SAP ECC", business_one: "Business One", no_sap: "No SAP", other_erp: "Other ERP",
};
const COMPLIANCE_LABELS: Record<string, string> = {
  not_started: "Not started", planning: "Planning", in_progress: "In progress", compliant: "Compliant",
};
const TIMELINE_LABELS: Record<string, string> = {
  immediate: "Immediate", "1_3_months": "1–3 months", "3_6_months": "3–6 months",
  "6_12_months": "6–12 months", exploring: "Exploring",
};

function assessmentScore(lead: Lead): number {
  let score = 0;
  if (lead.sapSystemType && lead.sapSystemType !== "no_sap") score += 25;
  if (lead.euMarketsActive === "yes") score += 20;
  if ((lead.dppCategories ?? []).length > 0) score += 20;
  if (lead.dppComplianceStatus && lead.dppComplianceStatus !== "compliant") score += 10;
  if (lead.implementationTimeline === "immediate" || lead.implementationTimeline === "1_3_months") score += 15;
  if (lead.integrationNeeds && lead.integrationNeeds !== "standalone") score += 10;
  return Math.min(score, 100);
}

function AssessmentScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    : score >= 40 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
  if (score === 0) return null;
  return <Badge variant="outline" className={`text-xs font-medium ${color}`}>{score}% fit</Badge>;
}

export default function CRM({ isAdmin = true }: { isAdmin?: boolean }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [sapFilter, setSapFilter] = useState<boolean>(false);
  const [assessmentFilter, setAssessmentFilter] = useState<boolean>(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { toast } = useToast();

  const { data: leads = [], isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<LeadStats>({
    queryKey: ["/api/leads/stats"],
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Lead> }) => {
      const response = await apiRequest("PATCH", `/api/leads/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/stats"] });
      toast({ title: "Lead updated" });
    },
    onError: () => {
      toast({ title: "Failed to update lead", variant: "destructive" });
    },
  });

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesTier = tierFilter === "all" || lead.tierInterest === tierFilter;
    const matchesSap = !sapFilter || (lead.sapSystemType && lead.sapSystemType !== "no_sap");
    const matchesAssessment = !assessmentFilter || !!lead.assessmentCompletedAt;
    
    return matchesSearch && matchesStatus && matchesTier && matchesSap && matchesAssessment;
  });

  const leadVelocity = stats ? (stats.thisWeek - stats.lastWeek) / Math.max(stats.lastWeek, 1) * 100 : 0;
  const conversionRate = stats && stats.total > 0 
    ? ((stats.byStatus?.won || 0) / stats.total * 100).toFixed(1)
    : "0";

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-crm-title">CRM & Team Management</h1>
          <p className="text-muted-foreground">Leads, team, and demo management</p>
        </div>
        <Badge variant="outline" className="text-sm">
          VC Metrics Dashboard
        </Badge>
      </div>

      <Tabs defaultValue="leads" className="space-y-6">
        <TabsList data-testid="tabs-crm">
          <TabsTrigger value="leads" data-testid="tab-leads" className="gap-1">
            <Users className="w-4 h-4" />
            Leads
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="partners" data-testid="tab-partners" className="gap-1">
              <Handshake className="w-4 h-4" />
              Team
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="bookings" data-testid="tab-bookings" className="gap-1">
              <Calendar className="w-4 h-4" />
              Bookings
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="demos" data-testid="tab-demos" className="gap-1">
              <Wand2 className="w-4 h-4" />
              Demo Generator
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="leads" className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-metric-total">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-3xl font-bold">{stats?.total || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-metric-velocity">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lead Velocity</p>
                <p className="text-3xl font-bold flex items-center gap-2">
                  {stats?.thisWeek || 0}
                  {leadVelocity > 0 ? (
                    <span className="text-sm text-green-600 flex items-center">
                      <ArrowUpRight className="w-4 h-4" />
                      +{leadVelocity.toFixed(0)}%
                    </span>
                  ) : leadVelocity < 0 ? (
                    <span className="text-sm text-red-600 flex items-center">
                      <ArrowDownRight className="w-4 h-4" />
                      {leadVelocity.toFixed(0)}%
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-muted-foreground">this week</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-metric-conversion">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-3xl font-bold">{conversionRate}%</p>
                <p className="text-xs text-muted-foreground">lead → won</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-metric-enterprise">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enterprise Interest</p>
                <p className="text-3xl font-bold">{stats?.byTier?.enterprise || 0}</p>
                <p className="text-xs text-muted-foreground">high-value leads</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Building className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" data-testid="card-tier-breakdown">
          <CardHeader>
            <CardTitle className="text-lg">Tier Interest Breakdown</CardTitle>
            <CardDescription>Which pricing tiers are attracting the most leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["enterprise", "growth", "starter", "poc"].map((tier) => {
                const count = stats?.byTier?.[tier] || 0;
                const percentage = stats?.total ? (count / stats.total * 100).toFixed(0) : 0;
                return (
                  <div key={tier} className="flex items-center gap-4">
                    <Badge className={`${TIER_COLORS[tier as TierInterest]} w-24 justify-center capitalize`}>
                      {tier}
                    </Badge>
                    <div className="flex-1 bg-muted rounded-full h-3">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">
                      {count} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-pipeline">
          <CardHeader>
            <CardTitle className="text-lg">Pipeline Status</CardTitle>
            <CardDescription>Current lead distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(["new", "contacted", "demo_scheduled", "qualified", "won", "lost"] as LeadStatus[]).map((status) => {
                const config = STATUS_CONFIG[status];
                const count = stats?.byStatus?.[status] || 0;
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <config.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{config.label}</span>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-leads-table">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle>All Leads</CardTitle>
              <CardDescription>Click on a lead to view details and update status</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-48"
                  data-testid="input-search-leads"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36" data-testid="select-status-filter">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {(Object.keys(STATUS_CONFIG) as LeadStatus[]).map((status) => (
                    <SelectItem key={status} value={status}>{STATUS_CONFIG[status].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-36" data-testid="select-tier-filter">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="poc">POC</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={() => setSapFilter(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${sapFilter ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                data-testid="button-filter-sap"
              >
                <SiSap className="w-3.5 h-3.5" />
                SAP
              </button>
              <button
                onClick={() => setAssessmentFilter(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${assessmentFilter ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                data-testid="button-filter-assessed"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                Assessed
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {leadsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading leads...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No leads yet</h3>
              <p className="text-muted-foreground text-sm">
                Leads from contact forms and demo requests will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLeads.map((lead) => {
                const statusConfig = STATUS_CONFIG[lead.status];
                const score = assessmentScore(lead);
                const hasAssessment = !!lead.assessmentCompletedAt || !!lead.sapSystemType;
                return (
                  <Dialog key={lead.id}>
                    <DialogTrigger asChild>
                      <div 
                        className="flex items-center gap-4 p-4 rounded-lg border hover-elevate cursor-pointer"
                        data-testid={`lead-row-${lead.id}`}
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium">
                            {lead.firstName[0]}{lead.lastName[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{lead.firstName} {lead.lastName}</span>
                            <Badge className={TIER_COLORS[lead.tierInterest]} variant="secondary">
                              {lead.tierInterest}
                            </Badge>
                            {hasAssessment && score > 0 && <AssessmentScoreBadge score={score} />}
                            {lead.sapSystemType && lead.sapSystemType !== "no_sap" && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <SiSap className="w-2.5 h-2.5" />
                                {SAP_SYSTEM_LABELS[lead.sapSystemType] ?? lead.sapSystemType}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                            <span>{lead.email}</span>
                            {lead.company && (
                              <>
                                <span className="text-muted-foreground/50">•</span>
                                <span>{lead.company}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Badge className={statusConfig.color} variant="outline">
                          {statusConfig.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground hidden sm:block">
                          {format(new Date(lead.createdAt), "MMM d, yyyy")}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <div className="flex items-center gap-3">
                          <div>
                            <DialogTitle>{lead.firstName} {lead.lastName}</DialogTitle>
                            <DialogDescription>{lead.company || "No company"} • {lead.jobTitle || "No title"}</DialogDescription>
                          </div>
                          {score > 0 && <AssessmentScoreBadge score={score} />}
                        </div>
                      </DialogHeader>

                      <Tabs defaultValue="contact">
                        <TabsList className="w-full">
                          <TabsTrigger value="contact" className="flex-1">
                            <Mail className="w-3.5 h-3.5 mr-1.5" />Contact
                          </TabsTrigger>
                          {hasAssessment && (
                            <TabsTrigger value="assessment" className="flex-1">
                              <ClipboardList className="w-3.5 h-3.5 mr-1.5" />Assessment
                            </TabsTrigger>
                          )}
                          <TabsTrigger value="pipeline" className="flex-1">
                            <Target className="w-3.5 h-3.5 mr-1.5" />Pipeline
                          </TabsTrigger>
                        </TabsList>

                        {/* ── Contact tab ── */}
                        <TabsContent value="contact" className="space-y-4 pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-muted-foreground uppercase tracking-wide">Email</label>
                              <p className="font-medium mt-0.5">{lead.email}</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground uppercase tracking-wide">Phone</label>
                              <p className="font-medium mt-0.5">{lead.phone || "-"}</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground uppercase tracking-wide">Tier Interest</label>
                              <div className="mt-0.5">
                                <Badge className={TIER_COLORS[lead.tierInterest]} variant="secondary">{lead.tierInterest}</Badge>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground uppercase tracking-wide">Product Volume</label>
                              <p className="font-medium mt-0.5">{lead.estimatedVolume || "-"}</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground uppercase tracking-wide">Source</label>
                              <p className="font-medium mt-0.5 capitalize">{lead.source.replace(/_/g, " ")}</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground uppercase tracking-wide">Submitted</label>
                              <p className="font-medium mt-0.5">{format(new Date(lead.createdAt), "MMM d, yyyy")}</p>
                            </div>
                          </div>
                          {lead.message && (
                            <div>
                              <label className="text-xs text-muted-foreground uppercase tracking-wide">Message</label>
                              <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{lead.message}</p>
                            </div>
                          )}
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" className="flex-1" asChild>
                              <a href={`mailto:${lead.email}`}><Mail className="w-4 h-4 mr-2" />Email</a>
                            </Button>
                            {lead.phone && (
                              <Button variant="outline" className="flex-1" asChild>
                                <a href={`tel:${lead.phone}`}><Phone className="w-4 h-4 mr-2" />Call</a>
                              </Button>
                            )}
                          </div>
                        </TabsContent>

                        {/* ── Assessment tab ── */}
                        {hasAssessment && (
                          <TabsContent value="assessment" className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                              {lead.sapSystemType && (
                                <div className="col-span-2 flex items-center gap-2 p-3 bg-muted/40 rounded-lg">
                                  <SiSap className="w-5 h-5 text-primary" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">SAP System</p>
                                    <p className="font-medium text-sm">{SAP_SYSTEM_LABELS[lead.sapSystemType] ?? lead.sapSystemType}
                                      {lead.sapDeployment && ` · ${lead.sapDeployment.replace("_", " ")}`}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {lead.currentErp && (
                                <div className="col-span-2">
                                  <label className="text-xs text-muted-foreground uppercase tracking-wide">Current ERP Landscape</label>
                                  <p className="text-sm mt-0.5">{lead.currentErp}</p>
                                </div>
                              )}
                              {lead.euMarketsActive && (
                                <div>
                                  <label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1"><Globe className="w-3 h-3" />EU Markets</label>
                                  <p className="text-sm font-medium mt-0.5 capitalize">{lead.euMarketsActive.replace("_", " ")}</p>
                                </div>
                              )}
                              {lead.dppComplianceStatus && (
                                <div>
                                  <label className="text-xs text-muted-foreground uppercase tracking-wide">DPP Status</label>
                                  <p className="text-sm font-medium mt-0.5">{COMPLIANCE_LABELS[lead.dppComplianceStatus] ?? lead.dppComplianceStatus}</p>
                                </div>
                              )}
                              {lead.estimatedSkus && (
                                <div>
                                  <label className="text-xs text-muted-foreground uppercase tracking-wide">Est. SKUs</label>
                                  <p className="text-sm font-medium mt-0.5">{lead.estimatedSkus.replace(/_/g, " ")}</p>
                                </div>
                              )}
                              {lead.implementationTimeline && (
                                <div>
                                  <label className="text-xs text-muted-foreground uppercase tracking-wide">Timeline</label>
                                  <p className="text-sm font-medium mt-0.5">{TIMELINE_LABELS[lead.implementationTimeline] ?? lead.implementationTimeline}</p>
                                </div>
                              )}
                              {lead.primaryUseCase && (
                                <div>
                                  <label className="text-xs text-muted-foreground uppercase tracking-wide">Primary Use Case</label>
                                  <p className="text-sm font-medium mt-0.5 capitalize">{lead.primaryUseCase.replace(/_/g, " ")}</p>
                                </div>
                              )}
                              {lead.integrationNeeds && (
                                <div>
                                  <label className="text-xs text-muted-foreground uppercase tracking-wide">Integration Needs</label>
                                  <p className="text-sm font-medium mt-0.5 capitalize">{lead.integrationNeeds.replace(/_/g, " ")}</p>
                                </div>
                              )}
                              {(lead.dppCategories ?? []).length > 0 && (
                                <div className="col-span-2">
                                  <label className="text-xs text-muted-foreground uppercase tracking-wide">DPP Categories</label>
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {(lead.dppCategories ?? []).map(cat => (
                                      <Badge key={cat} variant="secondary" className="text-xs capitalize">{cat.replace(/_/g, " ")}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {lead.assessmentNotes && (
                                <div className="col-span-2">
                                  <label className="text-xs text-muted-foreground uppercase tracking-wide">Technical Notes</label>
                                  <p className="text-sm mt-0.5 p-3 bg-muted/40 rounded-lg">{lead.assessmentNotes}</p>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                        )}

                        {/* ── Pipeline tab ── */}
                        <TabsContent value="pipeline" className="space-y-4 pt-4">
                          <div>
                            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Update Status</label>
                            <Select 
                              value={lead.status}
                              onValueChange={(value) => updateLeadMutation.mutate({ 
                                id: lead.id, 
                                updates: { status: value as LeadStatus } 
                              })}
                            >
                              <SelectTrigger data-testid="select-update-status">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(Object.keys(STATUS_CONFIG) as LeadStatus[]).map((status) => (
                                  <SelectItem key={status} value={status}>{STATUS_CONFIG[status].label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {lead.notes && (
                            <div>
                              <label className="text-xs text-muted-foreground uppercase tracking-wide">Internal Notes</label>
                              <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{lead.notes}</p>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="partners">
          <PartnersTab />
        </TabsContent>

        <TabsContent value="bookings">
          <BookingsTab />
        </TabsContent>

        <TabsContent value="demos">
          <DemoGeneratorTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const SAMPLE_PROMPTS = [
  { label: "Battery Manufacturer", industry: "Batteries", prompt: "Generate 3 industrial battery products for a European battery manufacturer (LFP and NMC chemistry). Include detailed material composition, carbon footprint data, and recycling information for EU Battery Regulation compliance." },
  { label: "Fashion Brand", industry: "Apparel", prompt: "Generate 3 sustainable fashion products for a mid-size European fashion brand. Include organic/recycled materials, water usage data, and supply chain origin information for EU DPP textile compliance." },
  { label: "Electronics Company", industry: "Consumer Electronics", prompt: "Generate 3 consumer electronics products (smart devices, IoT sensors). Include repairability scores, spare parts availability, and e-waste recycling instructions for EU DPP electronics compliance." },
  { label: "EV Components Supplier", industry: "EV Accessories", prompt: "Generate 3 electric vehicle accessory products (charging cables, battery modules, power converters). Include material composition, safety certifications, and end-of-life recycling data." },
  { label: "Packaging Manufacturer", industry: "Industrial Packaging", prompt: "Generate 3 industrial packaging products (cardboard, biodegradable packaging, reusable containers). Include recycled content percentages, recyclability data, and material sourcing information." },
  { label: "Furniture Maker", industry: "Furniture", prompt: "Generate 3 furniture products (office chairs, tables, shelving). Include wood sourcing certifications, VOC emissions data, repairability scores, and disassembly instructions." },
];

type SafePartner = Omit<Partner, "passwordHash">;

type DemoBooking = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  interestArea: string;
  slotDatetime: string;
  status: "pending" | "confirmed" | "cancelled";
  notes: string | null;
  createdAt: string | null;
};

const INTEREST_LABELS: Record<string, string> = {
  eu_dpp_compliance: "EU DPP Compliance",
  battery_regulation: "Battery Regulation",
  sap_integration: "SAP Integration",
  supply_chain: "Supply Chain Traceability",
  ai_sustainability: "AI Sustainability",
  other: "General Overview",
};

function BookingsTab() {
  const { toast } = useToast();

  const { data: bookings, isLoading, refetch } = useQuery<DemoBooking[]>({
    queryKey: ["/api/demo-bookings"],
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/demo-bookings/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/demo-bookings"] });
      toast({ title: "Status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Demo Bookings</h2>
          <p className="text-sm text-muted-foreground">Manage scheduled demo appointments</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh-bookings">
          <Clock className="w-3.5 h-3.5 mr-1" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading bookings...</span>
            </div>
          ) : !bookings || bookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No demo bookings yet.</p>
              <p className="text-xs mt-1">When users schedule demos via /book-demo, they'll appear here.</p>
            </div>
          ) : (
            <div className="divide-y">
              {bookings.map((booking) => (
                <div key={booking.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-4" data-testid={`booking-row-${booking.id}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{booking.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[booking.status]}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-0.5">{booking.email}{booking.company ? ` · ${booking.company}` : ""}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(booking.slotDatetime), "EEE, MMM d yyyy 'at' h:mm a 'CET'")}
                      </span>
                      <span>·</span>
                      <span>{INTEREST_LABELS[booking.interestArea] || booking.interestArea}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      data-testid={`button-download-ics-${booking.id}`}
                    >
                      <a href={`/api/demo-bookings/${booking.id}/calendar.ics`} download>
                        ICS
                      </a>
                    </Button>
                    <select
                      value={booking.status}
                      onChange={e => statusMutation.mutate({ id: booking.id, status: e.target.value })}
                      className="text-xs border rounded px-2 py-1.5 bg-background"
                      data-testid={`select-status-${booking.id}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
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

function PartnersTab() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPartner, setNewPartner] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    company: "",
    role: "demo_viewer" as string,
  });
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const { data: partnersList = [], isLoading } = useQuery<SafePartner[]>({
    queryKey: ["/api/partners"],
  });

  const createPartnerMutation = useMutation({
    mutationFn: async (data: typeof newPartner) => {
      const response = await apiRequest("POST", "/api/partners", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      setShowCreateDialog(false);
      setNewPartner({ email: "", password: "", firstName: "", lastName: "", company: "", role: "demo_viewer" });
      toast({ title: "Partner created", description: "Login credentials have been set up" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create partner", description: error.message, variant: "destructive" });
    },
  });

  const updatePartnerMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const response = await apiRequest("PATCH", `/api/partners/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      toast({ title: "Partner updated" });
    },
  });

  const deletePartnerMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/partners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      toast({ title: "Partner removed" });
    },
  });

  const copyLoginInfo = (email: string) => {
    navigator.clipboard.writeText(email);
    toast({ title: "Email copied to clipboard" });
  };

  const ROLE_LABELS: Record<string, string> = {
    sales_partner: "Sales Partner",
    reseller: "Reseller",
    consultant: "Consultant",
    demo_viewer: "Demo Viewer",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold">Team Accounts</h2>
          <p className="text-sm text-muted-foreground">Create and manage team login credentials for demo access</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-create-partner">
              <UserPlus className="w-4 h-4" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>Set up login credentials for a new team member</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createPartnerMutation.mutate(newPartner);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={newPartner.firstName}
                    onChange={(e) => setNewPartner({ ...newPartner, firstName: e.target.value })}
                    required
                    data-testid="input-partner-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={newPartner.lastName}
                    onChange={(e) => setNewPartner({ ...newPartner, lastName: e.target.value })}
                    required
                    data-testid="input-partner-last-name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newPartner.email}
                  onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                  required
                  data-testid="input-partner-create-email"
                />
              </div>
              <div className="space-y-2">
                <Label>Password (min 6 characters)</Label>
                <Input
                  type="text"
                  value={newPartner.password}
                  onChange={(e) => setNewPartner({ ...newPartner, password: e.target.value })}
                  required
                  minLength={6}
                  data-testid="input-partner-create-password"
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={newPartner.company}
                  onChange={(e) => setNewPartner({ ...newPartner, company: e.target.value })}
                  data-testid="input-partner-company"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newPartner.role} onValueChange={(v) => setNewPartner({ ...newPartner, role: v })}>
                  <SelectTrigger data-testid="select-partner-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="demo_viewer">Demo Viewer</SelectItem>
                    <SelectItem value="sales_partner">Sales Partner</SelectItem>
                    <SelectItem value="reseller">Reseller</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createPartnerMutation.isPending}
                data-testid="button-submit-partner"
              >
                {createPartnerMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Create Partner Account
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : partnersList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Handshake className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No team members yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create team accounts to give demo access to sales partners and clients
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2" data-testid="button-add-first-partner">
              <UserPlus className="w-4 h-4" />
              Add First Team Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {partnersList.map((partner) => (
            <Card key={partner.id} data-testid={`card-partner-${partner.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {partner.firstName[0]}{partner.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{partner.firstName} {partner.lastName}</span>
                      <Badge variant="secondary">{ROLE_LABELS[partner.role] || partner.role}</Badge>
                      <Badge variant={partner.status === "active" ? "default" : "secondary"}>
                        {partner.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      <span>{partner.email}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyLoginInfo(partner.email)}
                        data-testid={`button-copy-email-${partner.id}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      {partner.company && (
                        <>
                          <span className="text-muted-foreground/50">|</span>
                          <span>{partner.company}</span>
                        </>
                      )}
                    </div>
                    {partner.lastLoginAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last login: {format(new Date(partner.lastLoginAt), "MMM d, yyyy h:mm a")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={partner.status}
                      onValueChange={(value) =>
                        updatePartnerMutation.mutate({ id: partner.id, updates: { status: value } })
                      }
                    >
                      <SelectTrigger className="w-28" data-testid={`select-partner-status-${partner.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Remove this partner account?")) {
                          deletePartnerMutation.mutate(partner.id);
                        }
                      }}
                      data-testid={`button-delete-partner-${partner.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Team Login URL
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={`${window.location.origin}/team/login`}
              className="font-mono text-sm"
              data-testid="input-partner-login-url"
            />
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/team/login`);
                toast({ title: "Login URL copied" });
              }}
              data-testid="button-copy-login-url"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Share this URL with team members so they can log in and explore the platform
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function DemoGeneratorTab() {
  const { toast } = useToast();
  const [selectedPrompt, setSelectedPrompt] = useState<typeof SAMPLE_PROMPTS[0] | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [customName, setCustomName] = useState("");

  const { data: demoConfigs = [], isLoading } = useQuery<DemoConfig[]>({
    queryKey: ["/api/demo-configs"],
  });

  const createDemoMutation = useMutation({
    mutationFn: async (data: { name: string; industry: string; prompt: string }) => {
      const response = await apiRequest("POST", "/api/demo-configs", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/demo-configs"] });
      setSelectedPrompt(null);
      setCustomPrompt("");
      setCustomIndustry("");
      setCustomName("");
      toast({ title: "Demo generation started", description: "Products are being generated using AI. This may take a moment." });
    },
    onError: () => {
      toast({ title: "Failed to create demo", variant: "destructive" });
    },
  });

  const deleteDemoMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/demo-configs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/demo-configs"] });
      toast({ title: "Demo config removed" });
    },
  });

  const handleGenerateFromPrompt = (prompt: typeof SAMPLE_PROMPTS[0]) => {
    createDemoMutation.mutate({
      name: `${prompt.label} Demo`,
      industry: prompt.industry,
      prompt: prompt.prompt,
    });
  };

  const handleGenerateCustom = () => {
    if (!customName || !customIndustry || !customPrompt) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    createDemoMutation.mutate({
      name: customName,
      industry: customIndustry,
      prompt: customPrompt,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Quick Demo Generator</h2>
        <p className="text-sm text-muted-foreground">Generate tailored product demos for potential clients using AI</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Industry Templates</CardTitle>
          <CardDescription>Click a template to instantly generate a demo with realistic products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SAMPLE_PROMPTS.map((prompt) => (
              <div
                key={prompt.label}
                className="p-3 rounded-md border text-left cursor-pointer hover-elevate active-elevate-2"
                onClick={() => !createDemoMutation.isPending && handleGenerateFromPrompt(prompt)}
                data-testid={`button-template-${prompt.industry.toLowerCase().replace(/\s/g, '-')}`}
              >
                <p className="font-medium text-sm">{prompt.label}</p>
                <p className="text-xs text-muted-foreground">{prompt.industry}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom Demo</CardTitle>
          <CardDescription>Write your own prompt to generate a specific industry demo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Demo Name</Label>
              <Input
                placeholder="e.g., Acme Corp Battery Demo"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                data-testid="input-custom-demo-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input
                placeholder="e.g., Batteries, Textiles, Electronics"
                value={customIndustry}
                onChange={(e) => setCustomIndustry(e.target.value)}
                data-testid="input-custom-demo-industry"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Prompt</Label>
            <Textarea
              placeholder="Describe the products you want to generate. Include details about materials, sustainability goals, and compliance needs..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={4}
              data-testid="input-custom-demo-prompt"
            />
          </div>
          <Button
            onClick={handleGenerateCustom}
            disabled={createDemoMutation.isPending}
            className="gap-2"
            data-testid="button-generate-custom-demo"
          >
            {createDemoMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            Generate Demo
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generated Demos</CardTitle>
          <CardDescription>Previously generated demo configurations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : demoConfigs.length === 0 ? (
            <div className="text-center py-8">
              <Wand2 className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No demos generated yet. Use a template or create a custom demo above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {demoConfigs.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center gap-4 p-4 rounded-lg border"
                  data-testid={`card-demo-config-${config.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{config.name}</span>
                      <Badge variant="secondary">{config.industry}</Badge>
                      <Badge
                        variant={
                          config.status === "ready"
                            ? "default"
                            : config.status === "generating"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {config.status === "generating" && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                        {config.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{config.prompt}</p>
                    {config.generatedProducts && (config.generatedProducts as any[]).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {(config.generatedProducts as any[]).length} products generated
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(config.createdAt), "MMM d, yyyy")}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Delete this demo configuration?")) {
                        deleteDemoMutation.mutate(config.id);
                      }
                    }}
                    data-testid={`button-delete-demo-${config.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
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
