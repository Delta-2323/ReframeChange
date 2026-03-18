import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { 
  Users, Briefcase, FileText, CheckCircle, Plus, Edit, Send, Loader2, Sparkles, MessageSquare, LogOut,
  Brain, Lightbulb, AlertTriangle, TrendingUp, RefreshCw, ArrowRight
} from "lucide-react";
import { format } from "date-fns";

import { Navbar } from "@/components/layout/Navbar";
import { ManagerAuth } from "./ManagerAuth";
import { useManagerAuth } from "@/hooks/use-manager-auth";
import { 
  useGetDashboardStats, useGetProjects, useGetSurveys, useGetMessages, 
  useCreateProject, useGenerateMessage, useGenerateAiSummary,
  getGetMessagesQueryKey, getGetDashboardStatsQueryKey, getGetProjectsQueryKey 
} from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AiSummaryData = {
  summary: string;
  keyInsights: string[];
  recommendations: string[];
  riskFlags: string[];
  generatedAt: string;
};

function AiSummaryCard() {
  const [summaryData, setSummaryData] = useState<AiSummaryData | null>(null);
  const generateSummary = useGenerateAiSummary();

  const handleGenerate = async () => {
    try {
      const result = await generateSummary.mutateAsync({ data: {} });
      setSummaryData(result as AiSummaryData);
    } catch {
      // error handled by toast below
    }
  };

  if (!summaryData && !generateSummary.isPending) {
    return (
      <Card className="shadow-sm border-border/50 bg-gradient-to-br from-primary/5 via-background to-teal-500/5">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Landscape Summary</CardTitle>
                <CardDescription>Get an intelligent analysis of your stakeholder change readiness</CardDescription>
              </div>
            </div>
            <Button onClick={handleGenerate} className="bg-primary shadow-lg shadow-primary/20 gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Summary
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
              <TrendingUp className="h-4 w-4 text-teal-600 shrink-0" />
              <span>Readiness insights</span>
            </div>
            <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
              <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Actionable recommendations</span>
            </div>
            <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
              <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
              <span>Risk flags</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (generateSummary.isPending) {
    return (
      <Card className="shadow-sm border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-7 w-7 text-primary" />
            </div>
            <Loader2 className="h-5 w-5 animate-spin text-primary absolute -bottom-1 -right-1" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Analysing stakeholder landscape…</p>
            <p className="text-sm text-muted-foreground mt-1">Your AI is reviewing mental models and generating insights</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summaryData) return null;

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Landscape Summary</CardTitle>
              <CardDescription>Generated {format(new Date(summaryData.generatedAt), "MMM d, yyyy 'at' h:mm a")}</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleGenerate} className="gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Executive Summary */}
        <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
          <p className="text-sm text-foreground leading-relaxed">{summaryData.summary}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Key Insights */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-teal-600" />
              <h4 className="font-semibold text-sm text-foreground">Key Insights</h4>
            </div>
            <ul className="space-y-2">
              {summaryData.keyInsights.map((insight, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0" />
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <h4 className="font-semibold text-sm text-foreground">Recommendations</h4>
            </div>
            <ul className="space-y-2">
              {summaryData.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Risk Flags */}
        {summaryData.riskFlags.length > 0 && (
          <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <h4 className="font-semibold text-sm text-rose-700">Risk Flags</h4>
            </div>
            <ul className="space-y-2">
              {summaryData.riskFlags.map((flag, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-rose-600 leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Sub-components for Tabs to keep file structured
function OverviewTab() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading || !stats) {
    return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const chartData = stats.mentalModelDistribution.map(d => ({
    name: d.mentalModel,
    count: d.count
  }));

  const COLORS = ['#0f172a', '#1e293b', '#334155', '#475569', '#14b8a6', '#0d9488', '#0f766e'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Surveys</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalSurveys}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProjects}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Messages Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalMessages}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved Comms</CardTitle>
            <CheckCircle className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-600">{stats.approvedMessages}</div>
          </CardContent>
        </Card>
      </div>

      {/* AI Summary Card */}
      <AiSummaryCard />

      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Mental Model Distribution</CardTitle>
          <CardDescription>Breakdown of stakeholder mental models across all surveys</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                  interval={0} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b' }} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectsTab() {
  const { data, isLoading } = useGetProjects();
  const createMutation = useCreateProject();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', bcipCanvas: '', changeLogic: '', changeStrategy: '', managerName: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({ data: formData });
      toast({ title: "Project Created!" });
      queryClient.invalidateQueries({ queryKey: getGetProjectsQueryKey() });
      setOpen(false);
      setFormData({ name: '', bcipCanvas: '', changeLogic: '', changeStrategy: '', managerName: '' });
    } catch {
      toast({ title: "Error creating project", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Active Projects</h3>
          <p className="text-muted-foreground">Manage context for organizational changes.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary"><Plus className="mr-2 h-4 w-4" /> New Project</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Project Context</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Project Name *</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="E.g. Q3 Digital Transformation" />
              </div>
              <div className="space-y-2">
                <Label>Manager Name</Label>
                <Input value={formData.managerName} onChange={e => setFormData({...formData, managerName: e.target.value})} placeholder="John Smith" />
              </div>
              <div className="space-y-2">
                <Label>BCIP Canvas (Context)</Label>
                <Textarea rows={3} value={formData.bcipCanvas} onChange={e => setFormData({...formData, bcipCanvas: e.target.value})} placeholder="Paste background context..." />
              </div>
              <div className="space-y-2">
                <Label>Change Logic</Label>
                <Textarea rows={3} value={formData.changeLogic} onChange={e => setFormData({...formData, changeLogic: e.target.value})} placeholder="Why are we doing this?..." />
              </div>
              <div className="space-y-2">
                <Label>Change Strategy</Label>
                <Textarea rows={3} value={formData.changeStrategy} onChange={e => setFormData({...formData, changeStrategy: e.target.value})} placeholder="How will we implement this?..." />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Project
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.projects.length === 0 && (
          <div className="col-span-full p-12 text-center border-2 border-dashed rounded-xl text-muted-foreground">
            No projects created yet. Create one to get started.
          </div>
        )}
        {data?.projects.map(project => (
          <Card key={project.id} className="shadow-sm border-border/50 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>Managed by {project.managerName || 'Unassigned'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4 space-y-1">
                <p>Created: {format(new Date(project.createdAt), 'MMM d, yyyy')}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {project.bcipCanvas && <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20 border-0">BCIP</Badge>}
                  {project.changeLogic && <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-0">Logic</Badge>}
                  {project.changeStrategy && <Badge variant="secondary" className="bg-teal-500/10 text-teal-700 hover:bg-teal-500/20 border-0">Strategy</Badge>}
                </div>
              </div>
              <Button variant="outline" className="w-full" size="sm">Edit Context</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SurveysTab() {
  const { data, isLoading } = useGetSurveys();

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h3 className="text-2xl font-bold">Stakeholder Responses</h3>
        <p className="text-muted-foreground">All completed REM16™ surveys.</p>
      </div>
      
      <div className="border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Mental Model</TableHead>
              <TableHead>Focus</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.surveys.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No surveys found.</TableCell></TableRow>
            )}
            {data?.surveys.map((survey) => (
              <TableRow key={survey.id}>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {format(new Date(survey.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="font-medium">{survey.stakeholderName}</TableCell>
                <TableCell>{survey.role}</TableCell>
                <TableCell>
                  <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 font-semibold shadow-none">
                    {survey.mentalModel}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{survey.thinkingFocus}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function MessagesTab() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: messagesData, isLoading: msgLoading } = useGetMessages();
  const { data: projectsData } = useGetProjects();
  const { data: surveysData } = useGetSurveys();
  const generateMutation = useGenerateMessage();
  
  const [open, setOpen] = useState(false);
  const [genForm, setGenForm] = useState({ surveyId: '', projectId: '' });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genForm.surveyId || !genForm.projectId) {
      toast({ title: "Please select both a survey and a project", variant: "destructive" });
      return;
    }
    
    try {
      const res = await generateMutation.mutateAsync({ 
        data: { surveyId: parseInt(genForm.surveyId), projectId: parseInt(genForm.projectId) } 
      });
      toast({ title: "AI Message Generated!" });
      queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
      setOpen(false);
      setLocation(`/manager/messages/${res.id}`);
    } catch {
      toast({ title: "Error generating message", variant: "destructive" });
    }
  };

  if (msgLoading) return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">AI Communications</h3>
          <p className="text-muted-foreground">Manage and approve tailored stakeholder messages.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-secondary hover:bg-secondary/90 text-white shadow-lg shadow-secondary/20">
              <Sparkles className="mr-2 h-4 w-4" /> Generate Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Tailored Communication</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleGenerate} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Target Stakeholder</Label>
                <Select onValueChange={(v) => setGenForm(p => ({...p, surveyId: v}))}>
                  <SelectTrigger><SelectValue placeholder="Select a surveyed stakeholder..." /></SelectTrigger>
                  <SelectContent>
                    {surveysData?.surveys.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.stakeholderName} ({s.mentalModel})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Project Context</Label>
                <Select onValueChange={(v) => setGenForm(p => ({...p, projectId: v}))}>
                  <SelectTrigger><SelectValue placeholder="Select project context..." /></SelectTrigger>
                  <SelectContent>
                    {projectsData?.projects.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
            </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={generateMutation.isPending} className="w-full sm:w-auto bg-primary">
                  {generateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate AI Message
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Date</TableHead>
              <TableHead>Stakeholder</TableHead>
              <TableHead>Mental Model</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messagesData?.messages.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No messages generated yet.</TableCell></TableRow>
            )}
            {messagesData?.messages.map((msg) => (
              <TableRow key={msg.id} className="group">
                <TableCell className="text-muted-foreground">
                  {format(new Date(msg.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="font-medium">{msg.stakeholderName}</TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-muted-foreground">{msg.mentalModel}</span>
                </TableCell>
                <TableCell>
                  {msg.status === 'approved' ? (
                    <Badge className="bg-teal-500/10 text-teal-700 hover:bg-teal-500/20 border-0"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>
                  ) : msg.status === 'sent' ? (
                    <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20 border-0"><Send className="w-3 h-3 mr-1" /> Sent</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground bg-muted/50 border-border"><Edit className="w-3 h-3 mr-1" /> Draft</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setLocation(`/manager/messages/${msg.id}`)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Review <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function ManagerDashboard() {
  const { isAuthed, isChecking, logout, login } = useManagerAuth();

  if (isChecking) return null;

  if (!isAuthed) {
    return <ManagerAuth onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground">Change Hub</h1>
            <p className="text-muted-foreground text-lg mt-1">Monitor readiness and orchestrate communication.</p>
          </div>
          <Button variant="outline" onClick={logout} size="sm" className="text-muted-foreground hover:text-foreground">
            <LogOut className="mr-2 h-4 w-4" /> Lock Console
          </Button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-border p-6 md:p-8 min-h-[600px]">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-muted/50 p-1 mb-8 rounded-xl h-auto">
              <TabsTrigger value="overview" className="rounded-lg py-2.5 data-[state=active]:shadow-sm">Overview</TabsTrigger>
              <TabsTrigger value="projects" className="rounded-lg py-2.5 data-[state=active]:shadow-sm">Projects</TabsTrigger>
              <TabsTrigger value="surveys" className="rounded-lg py-2.5 data-[state=active]:shadow-sm">Surveys</TabsTrigger>
              <TabsTrigger value="messages" className="rounded-lg py-2.5 data-[state=active]:shadow-sm">Messages</TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              <TabsContent value="overview"><OverviewTab /></TabsContent>
              <TabsContent value="projects"><ProjectsTab /></TabsContent>
              <TabsContent value="surveys"><SurveysTab /></TabsContent>
              <TabsContent value="messages"><MessagesTab /></TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
