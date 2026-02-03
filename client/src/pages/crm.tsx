import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, TrendingUp, CheckCircle, AlertTriangle, Brain, 
  Plus, Mail, Phone, Building2, Calendar, Clock, ArrowRight, ArrowLeft,
  Sparkles, Target, DollarSign, Activity, MessageSquare,
  ChevronRight, RefreshCw, Send, Trash2, Edit, Loader2
} from "lucide-react";
import type { Lead, Deal, Task, Activity as ActivityType, Communication } from "@shared/schema";

const DEAL_STAGES = ["lead", "qualified", "proposal", "negotiation", "won", "lost"];
const STAGE_COLORS: Record<string, string> = {
  lead: "bg-gray-500",
  qualified: "bg-blue-500",
  proposal: "bg-yellow-500",
  negotiation: "bg-purple-500",
  won: "bg-green-500",
  lost: "bg-red-500"
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-400",
  medium: "bg-blue-400",
  high: "bg-orange-400",
  urgent: "bg-red-500"
};

const adminApiRequest = async (method: string, url: string, data?: unknown): Promise<Response> => {
  const token = localStorage.getItem('adminToken');
  const res = await fetch(url, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      "x-admin-token": token || ""
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  return res;
};

export default function CRM() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
  const [isDealDialogOpen, setIsDealDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailDraft, setEmailDraft] = useState({ subject: "", body: "" });

  const adminToken = localStorage.getItem('adminToken');
  
  if (!adminToken) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800 p-8 text-center">
          <Brain className="h-16 w-16 mx-auto text-indigo-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
          <p className="text-gray-400 mb-4">Please log in through the Admin Dashboard first.</p>
          <Button onClick={() => setLocation('/admin')} className="bg-indigo-600 hover:bg-indigo-700">
            Go to Admin Login
          </Button>
        </Card>
      </div>
    );
  }

  // Queries with admin auth
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/crm/stats"],
    queryFn: async () => {
      const res = await adminApiRequest("GET", "/api/crm/stats");
      return res.json();
    }
  });

  const { data: leadsData, isLoading: leadsLoading, refetch: refetchLeads } = useQuery({
    queryKey: ["/api/crm/leads"],
    queryFn: async () => {
      const res = await adminApiRequest("GET", "/api/crm/leads");
      return res.json();
    }
  });

  const { data: dealsData, isLoading: dealsLoading, refetch: refetchDeals } = useQuery({
    queryKey: ["/api/crm/deals"],
    queryFn: async () => {
      const res = await adminApiRequest("GET", "/api/crm/deals");
      return res.json();
    }
  });

  const { data: tasksData, isLoading: tasksLoading, refetch: refetchTasks } = useQuery({
    queryKey: ["/api/crm/tasks"],
    queryFn: async () => {
      const res = await adminApiRequest("GET", "/api/crm/tasks");
      return res.json();
    }
  });

  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/crm/activities"],
    queryFn: async () => {
      const res = await adminApiRequest("GET", "/api/crm/activities");
      return res.json();
    }
  });

  const { data: contactsData } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: async () => {
      const res = await adminApiRequest("GET", "/api/contacts");
      return res.json();
    }
  });

  // Mutations with admin auth
  const createLeadMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await adminApiRequest("POST", "/api/crm/leads", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/stats"] });
      setIsLeadDialogOpen(false);
      toast({ title: "Lead created with AI enrichment" });
    }
  });

  const enrichLeadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await adminApiRequest("POST", `/api/crm/leads/${id}/enrich`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/leads"] });
      toast({ title: "Lead enriched with AI insights" });
    }
  });

  const generateTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await adminApiRequest("POST", `/api/crm/leads/${id}/generate-task`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/tasks"] });
      toast({ title: "AI task generated" });
    }
  });

  const generateEmailMutation = useMutation({
    mutationFn: async ({ id, purpose }: { id: number; purpose: string }) => {
      const res = await adminApiRequest("POST", `/api/crm/leads/${id}/draft-email`, { purpose });
      return res.json();
    },
    onSuccess: (data: any) => {
      setEmailDraft(data.draft);
      setIsEmailDialogOpen(true);
    }
  });

  const convertContactMutation = useMutation({
    mutationFn: async (contactId: number) => {
      const res = await adminApiRequest("POST", `/api/crm/leads/from-contact/${contactId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({ title: "Contact converted to lead with AI enrichment" });
    }
  });

  const createDealMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await adminApiRequest("POST", "/api/crm/deals", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/stats"] });
      setIsDealDialogOpen(false);
      toast({ title: "Deal created" });
    }
  });

  const updateDealStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: number; stage: string }) => {
      const res = await adminApiRequest("PATCH", `/api/crm/deals/${id}`, { stage });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/activities"] });
    }
  });

  const analyzeDealMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await adminApiRequest("POST", `/api/crm/deals/${id}/analyze`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/deals"] });
      toast({ title: "Deal analyzed with AI" });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await adminApiRequest("PATCH", `/api/crm/tasks/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/stats"] });
    }
  });

  const stats = (statsData as any)?.stats;
  const leads = (leadsData as any)?.leads || [];
  const deals = (dealsData as any)?.deals || [];
  const tasks = (tasksData as any)?.tasks || [];
  const activities = (activitiesData as any)?.activities || [];
  const contacts = (contactsData as any)?.contacts || [];

  // New lead form state
  const [newLead, setNewLead] = useState({ name: "", email: "", phone: "", company: "", originalMessage: "", source: "manual" });
  const [newDeal, setNewDeal] = useState({ leadId: "", title: "", value: "", stage: "lead", expectedCloseDate: "" });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setLocation('/admin')}
              variant="ghost"
              className="text-gray-300 hover:text-indigo-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Brain className="h-8 w-8 text-indigo-400" />
                AI-Powered CRM
              </h1>
              <p className="text-gray-400 mt-1">Autonomous lead management with AI enrichment</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsLeadDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" /> Add Lead
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-900 border border-gray-800 mb-6">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-indigo-600">Dashboard</TabsTrigger>
            <TabsTrigger value="leads" className="data-[state=active]:bg-indigo-600">Leads</TabsTrigger>
            <TabsTrigger value="pipeline" className="data-[state=active]:bg-indigo-600">Pipeline</TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-indigo-600">Tasks</TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-indigo-600">Activity</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            {statsLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                <span className="ml-2 text-gray-400">Loading CRM data...</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Total Leads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats?.leads?.total || 0}</div>
                  <p className="text-xs text-gray-400 mt-1">
                    {stats?.leads?.new || 0} new, {stats?.leads?.qualified || 0} qualified
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Pipeline Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    ${stats?.deals?.totalValue?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {stats?.deals?.total || 0} active deals
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats?.tasks?.pending || 0}</div>
                  <p className="text-xs text-gray-400 mt-1">
                    {stats?.tasks?.overdue || 0} overdue, {stats?.tasks?.aiGenerated || 0} AI-generated
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Target className="h-4 w-4" /> Win Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats?.deals?.avgProbability || 0}%</div>
                  <p className="text-xs text-gray-400 mt-1">
                    {stats?.deals?.byStage?.won || 0} deals won
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Pending Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Activity className="h-5 w-5 text-indigo-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activities.slice(0, 5).map((activity: ActivityType) => (
                      <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-gray-800 last:border-0">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{activity.subject}</p>
                          <p className="text-xs text-gray-400">{activity.description?.substring(0, 100)}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {activities.length === 0 && (
                      <p className="text-gray-400 text-sm">No activity yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <CheckCircle className="h-5 w-5 text-indigo-400" />
                    Pending Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasks.filter((t: Task) => t.status === "pending").slice(0, 5).map((task: Task) => (
                      <div key={task.id} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => updateTaskMutation.mutate({ id: task.id, status: "completed" })}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white">{task.title}</p>
                            {task.aiGenerated && (
                              <Badge variant="secondary" className="text-xs bg-indigo-900 text-indigo-300">
                                <Sparkles className="h-3 w-3 mr-1" /> AI
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date"}
                          </p>
                        </div>
                        <Badge className={`${PRIORITY_COLORS[task.priority || "medium"]} text-white`}>
                          {task.priority}
                        </Badge>
                      </div>
                    ))}
                    {tasks.filter((t: Task) => t.status === "pending").length === 0 && (
                      <p className="text-gray-400 text-sm">No pending tasks</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Unconverted Contacts */}
            {contacts.length > 0 && (
              <Card className="bg-gray-900 border-gray-800 mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <MessageSquare className="h-5 w-5 text-yellow-400" />
                    Website Contacts (Ready to Convert)
                  </CardTitle>
                  <CardDescription className="text-gray-400">Convert website inquiries into CRM leads with AI enrichment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contacts.slice(0, 5).map((contact: any) => (
                      <div key={contact.id} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                        <div>
                          <p className="font-medium text-white">{contact.name}</p>
                          <p className="text-sm text-gray-300">{contact.email}</p>
                          <p className="text-xs text-gray-400 mt-1">{contact.message?.substring(0, 80)}...</p>
                        </div>
                        <Button 
                          onClick={() => convertContactMutation.mutate(contact.id)}
                          disabled={convertContactMutation.isPending}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Convert to Lead
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads">
            {leadsLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                <span className="ml-2 text-gray-400">Loading leads...</span>
              </div>
            )}
            <div className="space-y-4">
              {leads.map((lead: Lead) => (
                <Card key={lead.id} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-white">{lead.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            Score: {lead.score || 50}
                          </Badge>
                          <Badge className={`${
                            lead.status === "new" ? "bg-blue-600" :
                            lead.status === "qualified" ? "bg-green-600" :
                            lead.status === "converted" ? "bg-purple-600" :
                            "bg-gray-600"
                          }`}>
                            {lead.status}
                          </Badge>
                          {lead.urgency === "high" || lead.urgency === "critical" ? (
                            <Badge className="bg-red-600">
                              <AlertTriangle className="h-3 w-3 mr-1" /> {lead.urgency}
                            </Badge>
                          ) : null}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400 mb-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" /> {lead.email}
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" /> {lead.phone}
                            </div>
                          )}
                          {lead.company && (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" /> {lead.company}
                            </div>
                          )}
                          {lead.industry && (
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4" /> {lead.industry}
                            </div>
                          )}
                        </div>

                        {lead.aiSummary && (
                          <div className="bg-indigo-950/50 border border-indigo-900 rounded-lg p-3 mb-3">
                            <div className="flex items-center gap-2 text-indigo-300 text-xs mb-1">
                              <Sparkles className="h-3 w-3" /> AI Summary
                            </div>
                            <p className="text-sm text-gray-300">{lead.aiSummary}</p>
                          </div>
                        )}

                        {lead.tags && (
                          <div className="flex gap-2 flex-wrap">
                            {JSON.parse(lead.tags as string || "[]").map((tag: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs bg-gray-800">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => enrichLeadMutation.mutate(lead.id)}
                          disabled={enrichLeadMutation.isPending}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" /> Re-enrich
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateTaskMutation.mutate(lead.id)}
                          disabled={generateTaskMutation.isPending}
                        >
                          <Sparkles className="h-4 w-4 mr-1" /> AI Task
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedLead(lead);
                            generateEmailMutation.mutate({ id: lead.id, purpose: "follow up" });
                          }}
                        >
                          <Mail className="h-4 w-4 mr-1" /> Draft Email
                        </Button>
                        <Button
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => {
                            setNewDeal({ ...newDeal, leadId: String(lead.id), title: `Deal with ${lead.name}` });
                            setIsDealDialogOpen(true);
                          }}
                        >
                          <ArrowRight className="h-4 w-4 mr-1" /> Create Deal
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {leads.length === 0 && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">No leads yet. Add your first lead or convert a website contact.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline">
            <div className="grid grid-cols-6 gap-4">
              {DEAL_STAGES.map((stage) => (
                <div key={stage} className="space-y-3">
                  <div className={`${STAGE_COLORS[stage]} rounded-lg p-3 text-center`}>
                    <h3 className="font-semibold capitalize">{stage}</h3>
                    <p className="text-sm opacity-80">
                      {deals.filter((d: Deal) => d.stage === stage).length} deals
                    </p>
                  </div>

                  <div className="space-y-2 min-h-[200px]">
                    {deals.filter((d: Deal) => d.stage === stage).map((deal: Deal) => (
                      <Card key={deal.id} className="bg-gray-900 border-gray-800 cursor-pointer hover:border-indigo-600 transition-colors">
                        <CardContent className="p-3">
                          <h4 className="font-medium text-sm mb-1">{deal.title}</h4>
                          {deal.value && (
                            <p className="text-lg font-bold text-green-400">${Number(deal.value).toLocaleString()}</p>
                          )}
                          {deal.probability !== null && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 bg-gray-800 rounded-full h-2">
                                <div 
                                  className="bg-indigo-500 h-2 rounded-full" 
                                  style={{ width: `${deal.probability}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-400">{deal.probability}%</span>
                            </div>
                          )}
                          
                          <div className="flex gap-1 mt-2">
                            {stage !== "won" && stage !== "lost" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => {
                                    const nextStage = DEAL_STAGES[DEAL_STAGES.indexOf(stage) + 1];
                                    if (nextStage) updateDealStageMutation.mutate({ id: deal.id, stage: nextStage });
                                  }}
                                >
                                  <ChevronRight className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => analyzeDealMutation.mutate(deal.id)}
                                >
                                  <Brain className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>

                          {deal.aiRecommendedAction && (
                            <div className="mt-2 text-xs text-indigo-300 bg-indigo-950/50 rounded p-2">
                              <Sparkles className="h-3 w-3 inline mr-1" />
                              {deal.aiRecommendedAction}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <div className="space-y-4">
              {tasks.map((task: Task) => (
                <Card key={task.id} className={`bg-gray-900 border-gray-800 ${task.status === "completed" ? "opacity-60" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          size="sm"
                          variant={task.status === "completed" ? "default" : "outline"}
                          className="h-8 w-8 p-0"
                          onClick={() => updateTaskMutation.mutate({ 
                            id: task.id, 
                            status: task.status === "completed" ? "pending" : "completed" 
                          })}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`font-medium text-white ${task.status === "completed" ? "line-through" : ""}`}>
                              {task.title}
                            </h3>
                            {task.aiGenerated && (
                              <Badge variant="secondary" className="text-xs bg-indigo-900 text-indigo-300">
                                <Sparkles className="h-3 w-3 mr-1" /> AI Generated
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{task.description}</p>
                          {task.aiReason && (
                            <p className="text-xs text-indigo-400 mt-1">
                              <Brain className="h-3 w-3 inline mr-1" />
                              {task.aiReason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={PRIORITY_COLORS[task.priority || "medium"]}>
                          {task.priority}
                        </Badge>
                        <div className="text-sm text-gray-400">
                          <Clock className="h-4 w-4 inline mr-1" />
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {tasks.length === 0 && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">No tasks yet. Generate AI tasks from your leads.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {activities.map((activity: ActivityType) => (
                    <div key={activity.id} className="flex items-start gap-4 py-3 border-b border-gray-800 last:border-0">
                      <div className={`w-3 h-3 rounded-full mt-1.5 ${
                        activity.type === "lead_created" ? "bg-green-500" :
                        activity.type === "deal_created" ? "bg-blue-500" :
                        activity.type === "email" ? "bg-purple-500" :
                        activity.type === "call" ? "bg-yellow-500" :
                        activity.type === "stage_change" ? "bg-orange-500" :
                        "bg-gray-500"
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white">{activity.subject}</h4>
                          <Badge variant="outline" className="text-xs capitalize">{activity.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {activities.length === 0 && (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                      <p className="text-gray-400">No activity recorded yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Lead Dialog */}
        <Dialog open={isLeadDialogOpen} onOpenChange={setIsLeadDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
              <DialogDescription>Enter lead details. AI will automatically enrich the data.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Name *"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                />
                <Input
                  placeholder="Email *"
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Phone"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                />
                <Input
                  placeholder="Company"
                  value={newLead.company}
                  onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                />
              </div>
              <Textarea
                placeholder="Notes or context about this lead..."
                value={newLead.originalMessage}
                onChange={(e) => setNewLead({ ...newLead, originalMessage: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              />
              <Select value={newLead.source} onValueChange={(value) => setNewLead({ ...newLead, source: value })}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Lead Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLeadDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => createLeadMutation.mutate(newLead)}
                disabled={!newLead.name || !newLead.email || createLeadMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Create & Enrich
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Deal Dialog */}
        <Dialog open={isDealDialogOpen} onOpenChange={setIsDealDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle>Create Deal</DialogTitle>
              <DialogDescription>Create a new deal opportunity.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Deal Title *"
                value={newDeal.title}
                onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Value ($)"
                  type="number"
                  value={newDeal.value}
                  onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                />
                <Select value={newDeal.stage} onValueChange={(value) => setNewDeal({ ...newDeal, stage: value })}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEAL_STAGES.filter(s => s !== "won" && s !== "lost").map(stage => (
                      <SelectItem key={stage} value={stage} className="capitalize">{stage}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                type="date"
                placeholder="Expected Close Date"
                value={newDeal.expectedCloseDate}
                onChange={(e) => setNewDeal({ ...newDeal, expectedCloseDate: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDealDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => createDealMutation.mutate({
                  ...newDeal,
                  leadId: newDeal.leadId ? parseInt(newDeal.leadId) : undefined,
                  value: newDeal.value || undefined,
                  expectedCloseDate: newDeal.expectedCloseDate ? new Date(newDeal.expectedCloseDate) : undefined
                })}
                disabled={!newDeal.title || createDealMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Create Deal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Email Draft Dialog */}
        <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                AI-Generated Email Draft
              </DialogTitle>
              <DialogDescription>
                Review and edit the AI-generated email for {selectedLead?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Subject</label>
                <Input
                  value={emailDraft.subject}
                  onChange={(e) => setEmailDraft({ ...emailDraft, subject: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Body</label>
                <Textarea
                  value={emailDraft.body}
                  onChange={(e) => setEmailDraft({ ...emailDraft, body: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white min-h-[200px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>Close</Button>
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(`Subject: ${emailDraft.subject}\n\n${emailDraft.body}`);
                  toast({ title: "Email copied to clipboard" });
                }}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
