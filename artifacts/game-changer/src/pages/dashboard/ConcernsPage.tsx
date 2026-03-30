import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Send, UserCheck, MessageSquare, CheckCircle, AlertCircle, Clock, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";

import { Navbar } from "@/components/layout/Navbar";
import { useManagerAuth } from "@/hooks/use-manager-auth";
import { ManagerAuth } from "./ManagerAuth";
import {
  useGetConcerns, useCreateConcern, useAssignConcernToSme,
  useSubmitManagerResponse, useResolveConcern, useGetProjects,
  concernKeys, dashboardKeys,
} from "@/hooks/use-supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof AlertCircle }> = {
  open: { label: "Open", color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
  assigned: { label: "Assigned to SME", color: "bg-blue-100 text-blue-800", icon: Clock },
  responded: { label: "SME Responded", color: "bg-purple-100 text-purple-800", icon: MessageSquare },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-800", icon: CheckCircle },
};

export default function ConcernsPage() {
  const { isAuthed, isChecking, login } = useManagerAuth();
  const [, setLocation] = useLocation();

  if (isChecking) return null;
  if (!isAuthed) return <><Navbar /><ManagerAuth onLogin={login} /></>;

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/manager")} className="mb-3 gap-1.5 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Stakeholder Concerns</h1>
          <p className="text-muted-foreground">Track, assign, and resolve stakeholder concerns.</p>
        </div>
        <ConcernsList />
      </main>
    </div>
  );
}

function ConcernsList() {
  const { data, isLoading } = useGetConcerns();
  const { data: projectsData } = useGetProjects();
  const projects = projectsData?.projects || [];
  const createMutation = useCreateConcern();
  const assignMutation = useAssignConcernToSme();
  const managerRespondMutation = useSubmitManagerResponse();
  const resolveMutation = useResolveConcern();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [newConcern, setNewConcern] = useState({ stakeholderName: "", concernText: "", projectId: "" });

  const [assignOpen, setAssignOpen] = useState<number | null>(null);
  const [smeEmail, setSmeEmail] = useState("");
  const [smeName, setSmeName] = useState("");

  const [respondOpen, setRespondOpen] = useState<number | null>(null);
  const [managerResponse, setManagerResponse] = useState("");

  const [filter, setFilter] = useState<string>("all");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedProjectId = newConcern.projectId && newConcern.projectId !== "none" ? parseInt(newConcern.projectId) : null;
      await createMutation.mutateAsync({
        stakeholderName: newConcern.stakeholderName,
        concernText: newConcern.concernText,
        projectId: Number.isNaN(parsedProjectId) ? null : parsedProjectId,
      });
      toast({ title: "Concern created" });
      queryClient.invalidateQueries({ queryKey: concernKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats });
      setCreateOpen(false);
      setNewConcern({ stakeholderName: "", concernText: "", projectId: "" });
    } catch {
      toast({ title: "Error creating concern", variant: "destructive" });
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignOpen) return;
    try {
      await assignMutation.mutateAsync({ id: assignOpen, smeEmail, smeName });
      toast({ title: "Concern assigned to SME", description: `Link: /sme/respond/${assignOpen}` });
      queryClient.invalidateQueries({ queryKey: concernKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats });
      setAssignOpen(null);
      setSmeEmail("");
      setSmeName("");
    } catch {
      toast({ title: "Error assigning concern", variant: "destructive" });
    }
  };

  const handleManagerRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondOpen) return;
    try {
      await managerRespondMutation.mutateAsync({ id: respondOpen, response: managerResponse });
      toast({ title: "Response saved and concern resolved" });
      queryClient.invalidateQueries({ queryKey: concernKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats });
      setRespondOpen(null);
      setManagerResponse("");
    } catch {
      toast({ title: "Error responding", variant: "destructive" });
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await resolveMutation.mutateAsync(id);
      toast({ title: "Concern marked as resolved" });
      queryClient.invalidateQueries({ queryKey: concernKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats });
    } catch {
      toast({ title: "Error resolving concern", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const concerns = data?.concerns || [];
  const filtered = filter === "all" ? concerns : concerns.filter(c => c.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          {["all", "open", "assigned", "responded", "resolved"].map(s => (
            <Button key={s} variant={filter === s ? "default" : "outline"} size="sm"
              onClick={() => setFilter(s)} className="capitalize">
              {s === "all" ? "All" : STATUS_CONFIG[s]?.label || s}
              {s !== "all" && <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">{concerns.filter(c => c.status === s).length}</Badge>}
            </Button>
          ))}
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><AlertCircle className="mr-2 h-4 w-4" /> Log Concern</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log a Stakeholder Concern</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Stakeholder Name *</Label>
                <Input required value={newConcern.stakeholderName} onChange={e => setNewConcern({ ...newConcern, stakeholderName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Concern *</Label>
                <Textarea required rows={4} value={newConcern.concernText} onChange={e => setNewConcern({ ...newConcern, concernText: e.target.value })} placeholder="Describe the concern..." />
              </div>
              {projects.length > 0 && (
                <div className="space-y-2">
                  <Label>Related Project</Label>
                  <Select value={newConcern.projectId} onValueChange={v => setNewConcern({ ...newConcern, projectId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select project..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {projects.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Log Concern
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed rounded-xl text-muted-foreground">
          No concerns found.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(concern => {
            const cfg = STATUS_CONFIG[concern.status] || STATUS_CONFIG.open;
            const StatusIcon = cfg.icon;
            return (
              <Card key={concern.id} className="shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">{concern.stakeholderName}</CardTitle>
                      <p className="text-xs text-muted-foreground">{format(new Date(concern.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
                    </div>
                    <Badge className={`${cfg.color} border-0 gap-1`}>
                      <StatusIcon className="h-3 w-3" /> {cfg.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{concern.concernText}</p>

                  {concern.assignedToSmeName && (
                    <div className="text-xs bg-blue-50 rounded-lg p-3 space-y-1">
                      <p className="font-semibold text-blue-800">Assigned to: {concern.assignedToSmeName} ({concern.assignedToSmeEmail})</p>
                      <p className="text-blue-600">SME Link: <code className="bg-blue-100 px-1 rounded">/sme/respond/{concern.id}</code></p>
                    </div>
                  )}

                  {concern.smeResponse && (
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-purple-800 mb-1">SME Response:</p>
                      <p className="text-sm text-purple-900">{concern.smeResponse}</p>
                    </div>
                  )}

                  {concern.managerResponse && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-green-800 mb-1">Manager Response:</p>
                      <p className="text-sm text-green-900">{concern.managerResponse}</p>
                    </div>
                  )}

                  {concern.status !== "resolved" && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      {concern.status === "open" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => { setAssignOpen(concern.id); }}>
                            <UserCheck className="mr-1.5 h-3.5 w-3.5" /> Assign to SME
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setRespondOpen(concern.id); }}>
                            <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Respond Directly
                          </Button>
                        </>
                      )}
                      {concern.status === "assigned" && (
                        <Button size="sm" variant="outline" onClick={() => { setRespondOpen(concern.id); }}>
                          <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Respond Directly
                        </Button>
                      )}
                      {concern.status === "responded" && (
                        <Button size="sm" onClick={() => handleResolve(concern.id)}>
                          <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Mark Resolved
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={assignOpen !== null} onOpenChange={() => setAssignOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign to Subject Matter Expert</DialogTitle></DialogHeader>
          <form onSubmit={handleAssign} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>SME Name *</Label>
              <Input required value={smeName} onChange={e => setSmeName(e.target.value)} placeholder="Dr. Smith" />
            </div>
            <div className="space-y-2">
              <Label>SME Email *</Label>
              <Input required type="email" value={smeEmail} onChange={e => setSmeEmail(e.target.value)} placeholder="sme@company.com" />
            </div>
            <p className="text-xs text-muted-foreground">The SME will use the link <code>/sme/respond/{assignOpen}</code> to submit their response.</p>
            <DialogFooter>
              <Button type="submit" disabled={assignMutation.isPending}>
                {assignMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Send className="mr-1.5 h-4 w-4" /> Assign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={respondOpen !== null} onOpenChange={() => setRespondOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Manager Direct Response</DialogTitle></DialogHeader>
          <form onSubmit={handleManagerRespond} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Your Response *</Label>
              <Textarea required rows={5} value={managerResponse} onChange={e => setManagerResponse(e.target.value)} placeholder="Type your response to the stakeholder concern..." />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={managerRespondMutation.isPending}>
                {managerRespondMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit & Resolve
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
