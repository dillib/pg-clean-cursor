import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, TrendingUp, Target, Calendar, Mail, Building, 
  ChevronRight, Search, Filter, ArrowUpRight, ArrowDownRight,
  CheckCircle, Clock, XCircle, Phone
} from "lucide-react";
import { useState } from "react";
import type { Lead, LeadStatus, TierInterest } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; icon: any }> = {
  new: { label: "New", color: "bg-blue-500/10 text-blue-600 border-blue-200", icon: Clock },
  contacted: { label: "Contacted", color: "bg-yellow-500/10 text-yellow-600 border-yellow-200", icon: Mail },
  demo_scheduled: { label: "Demo Scheduled", color: "bg-purple-500/10 text-purple-600 border-purple-200", icon: Calendar },
  qualified: { label: "Qualified", color: "bg-green-500/10 text-green-600 border-green-200", icon: Target },
  won: { label: "Won", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200", icon: CheckCircle },
  lost: { label: "Lost", color: "bg-red-500/10 text-red-600 border-red-200", icon: XCircle },
};

const TIER_COLORS: Record<TierInterest, string> = {
  free: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
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

export default function CRM() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
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
    
    return matchesSearch && matchesStatus && matchesTier;
  });

  const leadVelocity = stats ? (stats.thisWeek - stats.lastWeek) / Math.max(stats.lastWeek, 1) * 100 : 0;
  const conversionRate = stats && stats.total > 0 
    ? ((stats.byStatus?.won || 0) / stats.total * 100).toFixed(1)
    : "0";

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-crm-title">Lead Management</h1>
          <p className="text-muted-foreground">Track and manage your sales pipeline</p>
        </div>
        <Badge variant="outline" className="text-sm">
          VC Metrics Dashboard
        </Badge>
      </div>

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
              {["enterprise", "growth", "starter", "free"].map((tier) => {
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
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
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
                return (
                  <Dialog key={lead.id}>
                    <DialogTrigger asChild>
                      <div 
                        className="flex items-center gap-4 p-4 rounded-lg border hover-elevate cursor-pointer"
                        data-testid={`lead-row-${lead.id}`}
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
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
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{lead.firstName} {lead.lastName}</DialogTitle>
                        <DialogDescription>{lead.company || "No company"} • {lead.jobTitle || "No title"}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-muted-foreground">Email</label>
                            <p className="font-medium">{lead.email}</p>
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Phone</label>
                            <p className="font-medium">{lead.phone || "-"}</p>
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Tier Interest</label>
                            <Badge className={TIER_COLORS[lead.tierInterest]} variant="secondary">
                              {lead.tierInterest}
                            </Badge>
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Volume</label>
                            <p className="font-medium">{lead.estimatedVolume || "-"}</p>
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Source</label>
                            <p className="font-medium capitalize">{lead.source.replace("_", " ")}</p>
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Created</label>
                            <p className="font-medium">{format(new Date(lead.createdAt), "MMM d, yyyy")}</p>
                          </div>
                        </div>
                        
                        {lead.message && (
                          <div>
                            <label className="text-sm text-muted-foreground">Message</label>
                            <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{lead.message}</p>
                          </div>
                        )}

                        <div>
                          <label className="text-sm text-muted-foreground mb-2 block">Update Status</label>
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
                                <SelectItem key={status} value={status}>
                                  {STATUS_CONFIG[status].label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" asChild>
                            <a href={`mailto:${lead.email}`}>
                              <Mail className="w-4 h-4 mr-2" />
                              Email
                            </a>
                          </Button>
                          {lead.phone && (
                            <Button variant="outline" className="flex-1" asChild>
                              <a href={`tel:${lead.phone}`}>
                                <Phone className="w-4 h-4 mr-2" />
                                Call
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
