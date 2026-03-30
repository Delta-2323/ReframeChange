import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { 
  Users, Briefcase, FileText, CheckCircle, Plus, Edit, Send, Loader2, Sparkles, MessageSquare, LogOut,
  Brain, Lightbulb, AlertTriangle, TrendingUp, RefreshCw, ArrowRight, Paperclip, Download, FileUp, Trash2,
  Power, Calendar, ClipboardList
} from "lucide-react";
import { format } from "date-fns";

import { Navbar } from "@/components/layout/Navbar";
import { ManagerAuth } from "./ManagerAuth";
import { useManagerAuth } from "@/hooks/use-manager-auth";
import { 
  useGetDashboardStats, useGetProjects, useGetSurveys, useGetMessages, 
  useCreateProject, useUpdateProject, useToggleProjectStatus,
  projectKeys, messageKeys, dashboardKeys
} from "@/hooks/use-supabase";
import { projectService } from "@/lib/supabase-services";
import type { FieldDocKey } from "@/lib/supabase-services";
import { extractTextFromPdf } from "@/lib/pdf-extract";

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
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsPending(true);
    try {
      const res = await fetch(`/api/dashboard/ai-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to generate summary");
      const result = await res.json();
      setSummaryData(result as AiSummaryData);
    } catch {
      toast({ title: "Failed to generate summary", variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  };

  if (!summaryData && !isPending) {
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

  if (isPending) {
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
        <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
          <p className="text-sm text-foreground leading-relaxed">{summaryData.summary}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
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

function OverviewTab() {
  const { data: stats, isLoading } = useGetDashboardStats();
  const [, setLocation] = useLocation();

  if (isLoading || !stats) {
    return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const chartData = stats.mentalModelDistribution.map(d => ({
    name: d.mentalModel,
    count: d.count
  }));

  const focusPieData = stats.focusAreaDistribution.map(d => ({ name: d.focusArea, value: d.count }));
  const orientPieData = stats.orientationDistribution.map(d => ({ name: d.orientation, value: d.count }));

  const COLORS = ['#0f172a', '#1e293b', '#334155', '#475569', '#14b8a6', '#0d9488', '#0f766e'];
  const PIE_COLORS = ['#0f172a', '#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Messages</CardTitle>
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
        <Card className="shadow-sm border-border/50 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation("/manager/concerns")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Concerns</CardTitle>
            <ClipboardList className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{stats.openConcerns}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.totalConcerns} total</p>
          </CardContent>
        </Card>
      </div>

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
                  {chartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {(focusPieData.length > 0 || orientPieData.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {focusPieData.length > 0 && (
            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Thinking Focus Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={focusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {focusPieData.map((_e, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
          {orientPieData.length > 0 && (
            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Orientation Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={orientPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {orientPieData.map((_e, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectDocumentUpload({ projectId, documentName }: { projectId: number; documentName?: string | null }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setIsUploading(true);
    try {
      await projectService.uploadDocument(projectId, file);
      await queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast({ title: "Document attached!", description: file.name });
    } catch (err) {
      toast({ title: "Upload failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const { blob, name } = await projectService.downloadDocument(projectId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast({ title: "Download failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await projectService.deleteDocument(projectId);
      await queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast({ title: "Document removed" });
    } catch (err) {
      toast({ title: "Remove failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-border/60">
      {documentName ? (
        <div className="flex items-center gap-2 mb-2">
          <Paperclip className="h-3.5 w-3.5 text-teal-600 shrink-0" />
          <span className="text-xs text-teal-700 truncate max-w-[140px]" title={documentName}>
            {documentName}
          </span>
          <button
            onClick={handleDownload}
            className="ml-auto shrink-0"
            title="Download document"
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            title="Remove document"
            className="shrink-0 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
          >
            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />

      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading || isDeleting}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <FileUp className="h-3.5 w-3.5" />
            {documentName ? "Replace Document" : "Attach Document"}
          </>
        )}
      </Button>
    </div>
  );
}

type ProjectFormData = {
  name: string; bcipCanvas: string; changeLogic: string; changeStrategy: string;
  communicationPlan: string; stakeholderImpact: string; managerName: string;
  startDate: string; goLiveDate: string; communicationStartDate: string; assessmentEndDate: string;
  bcipFile: File | null; logicFile: File | null; strategyFile: File | null;
  commPlanFile: File | null; impactFile: File | null;
};
const EMPTY_FORM: ProjectFormData = {
  name: '', bcipCanvas: '', changeLogic: '', changeStrategy: '',
  communicationPlan: '', stakeholderImpact: '', managerName: '',
  startDate: '', goLiveDate: '', communicationStartDate: '', assessmentEndDate: '',
  bcipFile: null, logicFile: null, strategyFile: null,
  commPlanFile: null, impactFile: null,
};

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_FILE_SIZE_MB = 10;
const FILE_ACCEPT = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function validateFile(file: File, toast: ReturnType<typeof useToast>["toast"]): boolean {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_FILE_TYPES.includes(file.type)) {
    toast({ title: "Invalid file type", description: "Please select a PDF or Word document (.pdf, .doc, .docx).", variant: "destructive" });
    return false;
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    toast({ title: "File too large", description: `Maximum file size is ${MAX_FILE_SIZE_MB} MB.`, variant: "destructive" });
    return false;
  }
  return true;
}

function InlineFileUpload({ file, onSelect, onRemove }: { file: File | null; onSelect: (f: File) => void; onRemove: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={FILE_ACCEPT}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onSelect(f);
          e.target.value = "";
        }}
      />
      {file ? (
        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30 mt-1.5">
          <Paperclip className="h-3.5 w-3.5 text-teal-600 shrink-0" />
          <span className="text-xs truncate flex-1" title={file.name}>{file.name}</span>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {(file.size / 1024 / 1024).toFixed(1)} MB
          </span>
          <button type="button" onClick={onRemove} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors" title="Remove file">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1.5"
          onClick={() => inputRef.current?.click()}
        >
          <FileUp className="h-3.5 w-3.5" />
          Upload PDF or Word document
        </button>
      )}
    </>
  );
}

function ProjectForm({ formData, onChange }: { formData: ProjectFormData; onChange: (d: ProjectFormData) => void }) {
  const { toast } = useToast();
  const [extracting, setExtracting] = useState<string | null>(null);

  type FileField = "bcipFile" | "logicFile" | "strategyFile" | "commPlanFile" | "impactFile";
  type TextField = "bcipCanvas" | "changeLogic" | "changeStrategy" | "communicationPlan" | "stakeholderImpact";

  const handleFieldFile = async (fileField: FileField, textField: TextField, file: File) => {
    if (!validateFile(file, toast)) return;
    onChange({ ...formData, [fileField]: file });

    if (file.type === "application/pdf") {
      setExtracting(fileField);
      try {
        const text = await extractTextFromPdf(file);
        if (text.trim()) {
          const current = formData[textField];
          onChange({
            ...formData,
            [fileField]: file,
            [textField]: current ? current + "\n\n--- Extracted from PDF ---\n" + text : text,
          });
          toast({ title: "PDF text extracted", description: "Text has been added to the field." });
        }
      } catch {
        toast({ title: "Could not extract PDF text", description: "The file was attached but text could not be read.", variant: "destructive" });
      } finally {
        setExtracting(null);
      }
    }
  };

  const strategyFields: { label: string; textField: TextField; fileField: FileField; placeholder: string }[] = [
    { label: "BCIP Canvas (Context)", textField: "bcipCanvas", fileField: "bcipFile", placeholder: "Paste background context..." },
    { label: "Change Logic", textField: "changeLogic", fileField: "logicFile", placeholder: "Why are we doing this?..." },
    { label: "Change Strategy", textField: "changeStrategy", fileField: "strategyFile", placeholder: "How will we implement this?..." },
    { label: "Communication Plan", textField: "communicationPlan", fileField: "commPlanFile", placeholder: "Communication approach and channels..." },
    { label: "Stakeholder Impact", textField: "stakeholderImpact", fileField: "impactFile", placeholder: "How will stakeholders be impacted?..." },
  ];

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Project Name *</Label>
        <Input required value={formData.name} onChange={e => onChange({...formData, name: e.target.value})} placeholder="E.g. Q3 Digital Transformation" />
      </div>
      <div className="space-y-2">
        <Label>Manager Name</Label>
        <Input value={formData.managerName} onChange={e => onChange({...formData, managerName: e.target.value})} placeholder="John Smith" />
      </div>

      <div className="border rounded-lg p-4 space-y-2 bg-muted/20">
        <Label className="text-sm font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" /> Key Dates</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Start Date</Label>
            <Input type="date" value={formData.startDate} onChange={e => onChange({...formData, startDate: e.target.value})} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Go-Live Date</Label>
            <Input type="date" value={formData.goLiveDate} onChange={e => onChange({...formData, goLiveDate: e.target.value})} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Communication Start</Label>
            <Input type="date" value={formData.communicationStartDate} onChange={e => onChange({...formData, communicationStartDate: e.target.value})} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Assessment End</Label>
            <Input type="date" value={formData.assessmentEndDate} onChange={e => onChange({...formData, assessmentEndDate: e.target.value})} />
          </div>
        </div>
      </div>

      {strategyFields.map(({ label, textField, fileField, placeholder }) => (
        <div key={textField} className="space-y-2">
          <Label>{label}</Label>
          <Textarea rows={3} value={formData[textField]} onChange={e => onChange({...formData, [textField]: e.target.value})} placeholder={placeholder} />
          {extracting === fileField && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Extracting text from PDF...
            </div>
          )}
          <InlineFileUpload
            file={formData[fileField]}
            onSelect={(f) => handleFieldFile(fileField, textField, f)}
            onRemove={() => onChange({ ...formData, [fileField]: null })}
          />
        </div>
      ))}
    </div>
  );
}

function ProjectsTab() {
  const { data, isLoading } = useGetProjects();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const toggleMutation = useToggleProjectStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ProjectFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editProjectId, setEditProjectId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ProjectFormData>(EMPTY_FORM);

  const uploadFieldFiles = async (projectId: number, form: ProjectFormData) => {
    const uploads: { field: FieldDocKey; file: File }[] = [];
    if (form.bcipFile) uploads.push({ field: "bcip", file: form.bcipFile });
    if (form.logicFile) uploads.push({ field: "logic", file: form.logicFile });
    if (form.strategyFile) uploads.push({ field: "strategy", file: form.strategyFile });
    if (form.commPlanFile) uploads.push({ field: "comm_plan", file: form.commPlanFile });
    if (form.impactFile) uploads.push({ field: "impact", file: form.impactFile });

    const failed: string[] = [];
    for (const { field, file } of uploads) {
      try {
        await projectService.uploadFieldDocument(projectId, field, file);
      } catch {
        failed.push(file.name);
      }
    }
    return { total: uploads.length, failed };
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { bcipFile, logicFile, strategyFile, commPlanFile, impactFile, ...formFields } = createForm;
      void bcipFile; void logicFile; void strategyFile; void commPlanFile; void impactFile;
      const project = await createMutation.mutateAsync({
        ...formFields,
        startDate: formFields.startDate || null,
        goLiveDate: formFields.goLiveDate || null,
        communicationStartDate: formFields.communicationStartDate || null,
        assessmentEndDate: formFields.assessmentEndDate || null,
      });
      const { total, failed } = await uploadFieldFiles(project.id, createForm);
      if (failed.length > 0) {
        toast({ title: "Project created, but some uploads failed", description: `Failed: ${failed.join(", ")}. You can re-upload from the project card.`, variant: "destructive" });
      } else if (total > 0) {
        toast({ title: "Project Created!", description: `${total} document${total > 1 ? "s" : ""} attached.` });
      } else {
        toast({ title: "Project Created!" });
      }
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats });
      setCreateOpen(false);
      setCreateForm(EMPTY_FORM);
    } catch {
      toast({ title: "Error creating project", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditOpen = (project: NonNullable<typeof data>["projects"][number]) => {
    setEditProjectId(project.id);
    setEditForm({
      name: project.name,
      bcipCanvas: project.bcipCanvas ?? '',
      changeLogic: project.changeLogic ?? '',
      changeStrategy: project.changeStrategy ?? '',
      communicationPlan: project.communicationPlan ?? '',
      stakeholderImpact: project.stakeholderImpact ?? '',
      managerName: project.managerName ?? '',
      startDate: project.startDate ?? '',
      goLiveDate: project.goLiveDate ?? '',
      communicationStartDate: project.communicationStartDate ?? '',
      assessmentEndDate: project.assessmentEndDate ?? '',
      bcipFile: null, logicFile: null, strategyFile: null,
      commPlanFile: null, impactFile: null,
    });
    setEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProjectId) return;
    setIsSubmitting(true);
    try {
      const { bcipFile, logicFile, strategyFile, commPlanFile, impactFile, ...formFields } = editForm;
      void bcipFile; void logicFile; void strategyFile; void commPlanFile; void impactFile;
      await updateMutation.mutateAsync({
        id: editProjectId,
        data: {
          ...formFields,
          startDate: formFields.startDate || null,
          goLiveDate: formFields.goLiveDate || null,
          communicationStartDate: formFields.communicationStartDate || null,
          assessmentEndDate: formFields.assessmentEndDate || null,
        },
      });
      const { total, failed } = await uploadFieldFiles(editProjectId, editForm);
      if (failed.length > 0) {
        toast({ title: "Project updated, but some uploads failed", description: `Failed: ${failed.join(", ")}. You can re-upload from the project card.`, variant: "destructive" });
      } else if (total > 0) {
        toast({ title: "Project Updated!", description: `${total} document${total > 1 ? "s" : ""} attached.` });
      } else {
        toast({ title: "Project Updated!" });
      }
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      setEditOpen(false);
    } catch {
      toast({ title: "Error updating project", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (project: { id: number; status: string }) => {
    const newStatus = project.status === "active" ? "inactive" : "active";
    try {
      await toggleMutation.mutateAsync({ id: project.id, status: newStatus });
      toast({ title: `Project ${newStatus === "active" ? "activated" : "deactivated"}` });
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats });
    } catch {
      toast({ title: "Error updating status", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Projects</h3>
          <p className="text-muted-foreground">Manage context for organizational changes.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary"><Plus className="mr-2 h-4 w-4" /> New Project</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Project Context</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <ProjectForm formData={createForm} onChange={setCreateForm} />
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Project
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project Context</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <ProjectForm formData={editForm} onChange={setEditForm} />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.projects.length === 0 && (
          <div className="col-span-full p-12 text-center border-2 border-dashed rounded-xl text-muted-foreground">
            No projects created yet. Create one to get started.
          </div>
        )}
        {data?.projects.map(project => {
          const isActive = project.status === "active";
          return (
            <Card key={project.id} className={`shadow-sm border-border/50 hover:shadow-md transition-shadow ${!isActive ? "opacity-60" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="truncate">{project.name}</CardTitle>
                    <CardDescription>Managed by {project.managerName || 'Unassigned'}</CardDescription>
                  </div>
                  <Badge className={isActive ? "bg-green-100 text-green-800 border-0" : "bg-gray-100 text-gray-600 border-0"}>
                    {isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4 space-y-2">
                  <p>Created: {format(new Date(project.createdAt), 'MMM d, yyyy')}</p>
                  {project.startDate && <p className="text-xs">Start: {format(new Date(project.startDate), 'MMM d, yyyy')}</p>}
                  {project.goLiveDate && <p className="text-xs">Go-Live: {format(new Date(project.goLiveDate), 'MMM d, yyyy')}</p>}
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {(project.bcipCanvas || project.bcipDocName) && <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20 border-0 text-[10px] px-1.5">{project.bcipDocName ? <><Paperclip className="h-2.5 w-2.5 mr-0.5" />BCIP</> : "BCIP"}</Badge>}
                    {(project.changeLogic || project.logicDocName) && <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-0 text-[10px] px-1.5">{project.logicDocName ? <><Paperclip className="h-2.5 w-2.5 mr-0.5" />Logic</> : "Logic"}</Badge>}
                    {(project.changeStrategy || project.strategyDocName) && <Badge variant="secondary" className="bg-teal-500/10 text-teal-700 hover:bg-teal-500/20 border-0 text-[10px] px-1.5">{project.strategyDocName ? <><Paperclip className="h-2.5 w-2.5 mr-0.5" />Strategy</> : "Strategy"}</Badge>}
                    {(project.communicationPlan || project.commPlanDocName) && <Badge variant="secondary" className="bg-violet-500/10 text-violet-700 hover:bg-violet-500/20 border-0 text-[10px] px-1.5">{project.commPlanDocName ? <><Paperclip className="h-2.5 w-2.5 mr-0.5" />Comm Plan</> : "Comm Plan"}</Badge>}
                    {(project.stakeholderImpact || project.impactDocName) && <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-0 text-[10px] px-1.5">{project.impactDocName ? <><Paperclip className="h-2.5 w-2.5 mr-0.5" />Impact</> : "Impact"}</Badge>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" size="sm" onClick={() => handleEditOpen(project)}>
                    <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    variant={isActive ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleToggle(project)}
                    disabled={toggleMutation.isPending}
                    className={`gap-1.5 ${isActive ? "text-muted-foreground hover:text-destructive" : ""}`}
                  >
                    <Power className="h-3.5 w-3.5" />
                    {isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
                <ProjectDocumentUpload
                  projectId={project.id}
                  documentName={project.documentName}
                />
              </CardContent>
            </Card>
          );
        })}
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
  
  const { data: messagesData, isLoading: msgLoading, isError: msgError, refetch } = useGetMessages();
  const { data: projectsData } = useGetProjects();
  const { data: surveysData } = useGetSurveys();
  
  const [open, setOpen] = useState(false);
  const [genForm, setGenForm] = useState({ surveyId: '', projectId: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  const noSurveys = !surveysData?.surveys.length;
  const noProjects = !projectsData?.projects.length;
  const messages = messagesData?.messages ?? [];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genForm.surveyId || !genForm.projectId) {
      toast({ title: "Please select both a stakeholder and a project", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surveyId: parseInt(genForm.surveyId), projectId: parseInt(genForm.projectId) }),
      });
      if (!res.ok) throw new Error("Failed to generate message");
      const data = await res.json();
      toast({ title: "AI message generated!", description: "Opening the message for review..." });
      queryClient.invalidateQueries({ queryKey: messageKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats });
      setOpen(false);
      setLocation(`/manager/messages/${data.id}`);
    } catch {
      toast({ title: "Failed to generate message", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  if (msgLoading) return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (msgError) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="p-4 rounded-full bg-destructive/10 mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h4 className="font-semibold mb-2">Could not load messages</h4>
      <p className="text-muted-foreground text-sm mb-4">There was an issue connecting to the server.</p>
      <Button variant="outline" onClick={() => refetch()} className="gap-2">
        <RefreshCw className="h-4 w-4" /> Try Again
      </Button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold">AI Communications</h3>
          <p className="text-muted-foreground">Generate, review, and approve tailored stakeholder messages.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary shadow-md shadow-primary/20 shrink-0">
              <Sparkles className="h-4 w-4" /> Generate New Message
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Generate AI Message</DialogTitle>
            </DialogHeader>

            {(noSurveys || noProjects) && (
              <div className="space-y-2 my-2">
                {noSurveys && (
                  <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>No stakeholder surveys yet. Share the survey link with stakeholders first.</span>
                  </div>
                )}
                {noProjects && (
                  <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>No projects created yet. Create a project in the Projects tab first.</span>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-5 py-2">
              <div className="space-y-2">
                <Label className="font-semibold">1. Select Stakeholder</Label>
                <p className="text-xs text-muted-foreground">Choose the stakeholder whose survey you want to generate a message for.</p>
                <Select onValueChange={(v) => setGenForm(p => ({...p, surveyId: v}))}>
                  <SelectTrigger className="h-11"><SelectValue placeholder={noSurveys ? "No surveys available" : "Choose a stakeholder..."} /></SelectTrigger>
                  <SelectContent>
                    {surveysData?.surveys.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        <span className="font-medium">{s.stakeholderName}</span>
                        <span className="text-muted-foreground ml-2 text-xs">· {s.mentalModel}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">2. Select Project</Label>
                <p className="text-xs text-muted-foreground">The AI will use this project's context to personalise the message.</p>
                <Select onValueChange={(v) => setGenForm(p => ({...p, projectId: v}))}>
                  <SelectTrigger className="h-11"><SelectValue placeholder={noProjects ? "No projects available" : "Choose a project..."} /></SelectTrigger>
                  <SelectContent>
                    {projectsData?.projects.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isGenerating || noSurveys || noProjects} className="w-full bg-primary">
                  {isGenerating
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</>
                    : <><Sparkles className="mr-2 h-4 w-4" /> Generate AI Message</>
                  }
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-2xl text-center bg-muted/20">
          <div className="p-4 rounded-full bg-primary/10 mb-4">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h4 className="text-lg font-semibold mb-2">No messages yet</h4>
          <p className="text-muted-foreground text-sm max-w-xs mb-6">
            Generate your first AI-tailored communication by clicking "Generate New Message" above.
            {noSurveys && " You'll need at least one completed survey first."}
            {noProjects && " You'll also need a project set up in the Projects tab."}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 text-xs text-muted-foreground">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${noSurveys ? 'bg-amber-50 text-amber-700' : 'bg-teal-50 text-teal-700'}`}>
              {noSurveys ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
              Surveys: {surveysData?.surveys.length ?? 0} completed
            </span>
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${noProjects ? 'bg-amber-50 text-amber-700' : 'bg-teal-50 text-teal-700'}`}>
              {noProjects ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
              Projects: {projectsData?.projects.length ?? 0} created
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const preview = (msg.editedContent || msg.generatedContent || '').substring(0, 120);
            return (
              <div
                key={msg.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setLocation(`/manager/messages/${msg.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-foreground">{msg.stakeholderName}</span>
                    <Badge className="shrink-0 text-xs bg-primary/10 text-primary border-0 hover:bg-primary/20 shadow-none">
                      {msg.mentalModel}
                    </Badge>
                  </div>
                  {preview && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {preview}{preview.length >= 120 ? '…' : ''}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1.5">{format(new Date(msg.createdAt), 'MMM d, yyyy')}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {msg.status === 'approved' ? (
                    <Badge className="bg-teal-500/10 text-teal-700 border-teal-200 shadow-none gap-1">
                      <CheckCircle className="w-3 h-3" /> Approved
                    </Badge>
                  ) : msg.status === 'sent' ? (
                    <Badge className="bg-blue-500/10 text-blue-700 border-blue-200 shadow-none gap-1">
                      <Send className="w-3 h-3" /> Sent
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground bg-muted/50 shadow-none gap-1">
                      <Edit className="w-3 h-3" /> Draft
                    </Badge>
                  )}
                  <Button size="sm" variant="outline" className="gap-1.5 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors shrink-0">
                    Review <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ConcernsTabInline() {
  const [, setLocation] = useLocation();
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Stakeholder Concerns</h3>
          <p className="text-muted-foreground">Track, assign, and resolve stakeholder concerns.</p>
        </div>
        <Button onClick={() => setLocation("/manager/concerns")} className="gap-2">
          <ClipboardList className="h-4 w-4" /> Open Full View
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-2xl text-center bg-muted/20">
        <ClipboardList className="h-10 w-10 text-muted-foreground mb-4" />
        <h4 className="text-lg font-semibold mb-2">Manage Concerns</h4>
        <p className="text-muted-foreground text-sm max-w-sm mb-4">
          Log, assign to subject matter experts, and resolve stakeholder concerns from the dedicated concerns page.
        </p>
        <Button onClick={() => setLocation("/manager/concerns")}>Go to Concerns</Button>
      </div>
    </div>
  );
}

export default function ManagerDashboard() {
  const { isAuthed, isChecking, logout, login } = useManagerAuth();

  if (isChecking) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </main>
      </div>
    );
  }

  if (!isAuthed) {
    return <ManagerAuth onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Change Hub</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Monitor readiness and orchestrate stakeholder communication.</p>
          </div>
          <Button variant="outline" onClick={logout} size="sm" className="gap-2 text-muted-foreground hover:text-foreground text-sm">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <Tabs defaultValue="overview" className="w-full">
          <div className="border-b border-border mb-6">
            <TabsList className="h-auto bg-transparent p-0 gap-0 rounded-none">
              {[
                { value: "overview", label: "Overview" },
                { value: "projects", label: "Projects" },
                { value: "surveys", label: "Surveys" },
                { value: "messages", label: "Messages" },
                { value: "concerns", label: "Concerns" },
              ].map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview"><OverviewTab /></TabsContent>
          <TabsContent value="projects"><ProjectsTab /></TabsContent>
          <TabsContent value="surveys"><SurveysTab /></TabsContent>
          <TabsContent value="messages"><MessagesTab /></TabsContent>
          <TabsContent value="concerns"><ConcernsTabInline /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
