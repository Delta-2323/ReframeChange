import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, CheckCircle2, Save, Send, User, Sparkles, Loader2, AlertCircle,
  Download, RotateCcw, Edit3, Eye, FileText, Clock, Brain, Mail
} from "lucide-react";
import { format } from "date-fns";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

import { 
  useGetMessage, 
  useUpdateMessage,
  useSendMessageEmail,
  getGetMessageQueryKey, 
  getGetMessagesQueryKey,
  UpdateMessageInputStatus
} from "@workspace/api-client-react";

function downloadAsPDF(stakeholderName: string, mentalModel: string, content: string) {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return;

  const date = format(new Date(), 'MMMM d, yyyy');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Change Communication – ${stakeholderName}</title>
      <meta charset="UTF-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; padding: 48px; line-height: 1.7; }
        .header { border-bottom: 2px solid #0d9488; padding-bottom: 24px; margin-bottom: 32px; }
        .logo { font-size: 13px; font-weight: 700; color: #0d9488; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 16px; }
        h1 { font-size: 26px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
        .subtitle { font-size: 14px; color: #64748b; }
        .meta { display: flex; gap: 24px; margin: 24px 0; flex-wrap: wrap; }
        .meta-item { }
        .meta-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 3px; }
        .meta-value { font-size: 14px; font-weight: 600; color: #1e293b; }
        .model-badge { display: inline-block; background: #f0fdf4; border: 1px solid #86efac; color: #15803d; padding: 3px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; }
        .content-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; margin-top: 24px; }
        .content-label { font-size: 12px; font-weight: 700; color: #0d9488; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; display: flex; align-items: center; gap: 6px; }
        .content { font-size: 15px; line-height: 1.9; color: #1e293b; white-space: pre-wrap; }
        .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between; }
        @media print {
          body { padding: 24px; }
          .content-box { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">★ Reframe Change · REM16™ Framework</div>
        <h1>Change Management Communication</h1>
        <div class="subtitle">Psychologically safe, personalised stakeholder message</div>
      </div>
      <div class="meta">
        <div class="meta-item">
          <div class="meta-label">Stakeholder</div>
          <div class="meta-value">${stakeholderName}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Mental Model</div>
          <div class="meta-value"><span class="model-badge">${mentalModel}</span></div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Generated</div>
          <div class="meta-value">${date}</div>
        </div>
      </div>
      <div class="content-box">
        <div class="content-label">✦ Tailored Communication</div>
        <div class="content">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
      </div>
      <div class="footer">
        <span>Reframe Change — REM16™ Framework</span>
        <span>Generated on ${date}</span>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

export default function MessageReview() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const msgId = Number(id);
  const { data: message, isLoading, error } = useGetMessage(msgId);
  const updateMutation = useUpdateMessage();
  
  const [content, setContent] = useState("");
  const [isEdited, setIsEdited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendEmailMutation = useSendMessageEmail();

  useEffect(() => {
    if (message) {
      const initial = message.editedContent || message.generatedContent;
      setContent(initial);
      setIsEdited(false);
    }
  }, [message]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (!isEdited) setIsEdited(true);
  };

  const handleReset = () => {
    if (!message) return;
    setContent(message.generatedContent);
    setIsEdited(true);
  };

  const saveChanges = async (newStatus?: UpdateMessageInputStatus) => {
    setIsSaving(true);
    try {
      await updateMutation.mutateAsync({
        id: msgId,
        data: {
          editedContent: content,
          ...(newStatus ? { status: newStatus } : {})
        }
      });
      
      queryClient.invalidateQueries({ queryKey: getGetMessageQueryKey(msgId) });
      queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey() });
      setIsEdited(false);
      
      if (newStatus === "approved") {
        toast({ title: "Message approved!", description: "It's ready to send when you are." });
      } else if (newStatus === "sent") {
        toast({ title: "Message marked as sent!" });
        setLocation("/manager");
      } else {
        toast({ title: "Changes saved successfully" });
      }
    } catch {
      toast({ title: "Error saving changes", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!message) return;
    downloadAsPDF(message.stakeholderName, message.mentalModel, content);
  };

  const handleOpenEmailDialog = () => {
    if (!message) return;
    setEmailSubject(`Change Update — ${message.stakeholderName}`);
    setShowEmailDialog(true);
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim()) return;
    try {
      await sendEmailMutation.mutateAsync({ id: msgId, data: { subject: emailSubject.trim() } });
      queryClient.invalidateQueries({ queryKey: getGetMessageQueryKey(msgId) });
      queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey() });
      setShowEmailDialog(false);
      toast({ title: "Email sent!", description: `Successfully delivered to ${message?.stakeholderName}.` });
      setLocation("/manager");
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? "Failed to send email";
      toast({ title: "Email failed", description: msg, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 p-12">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground">Loading message…</p>
        </main>
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
          <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">Message not found</h2>
            <p className="text-muted-foreground text-sm">This message may have been deleted or the link is incorrect.</p>
          </div>
          <Button onClick={() => setLocation("/manager")} className="mt-2">Return to Dashboard</Button>
        </main>
      </div>
    );
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const hasBeenEdited = content !== message.generatedContent;

  const statusConfig = {
    draft: { label: "Draft", className: "bg-muted text-muted-foreground border-border" },
    approved: { label: "Approved", className: "bg-teal-50 text-teal-700 border-teal-200" },
    sent: { label: "Sent", className: "bg-blue-50 text-blue-700 border-blue-200" },
  };
  const status = statusConfig[message.status as keyof typeof statusConfig] ?? statusConfig.draft;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Sticky Action Bar */}
      <div className="bg-white border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/manager")} className="text-muted-foreground gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Download PDF */}
            <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="gap-1.5">
              <Download className="h-4 w-4" /> Download PDF
            </Button>

            {/* Save Draft */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => saveChanges()} 
              disabled={!isEdited || isSaving}
              className="gap-1.5"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </Button>

            {/* Approve */}
            {message.status !== 'approved' && message.status !== 'sent' && (
              <Button 
                size="sm"
                onClick={() => saveChanges("approved")} 
                disabled={isSaving}
                className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-md shadow-teal-600/20"
              >
                <CheckCircle2 className="h-4 w-4" /> Approve
              </Button>
            )}

            {/* Mark as Sent */}
            {message.status === 'approved' && (
              <Button 
                size="sm"
                onClick={() => saveChanges("sent")} 
                disabled={isSaving}
                className="bg-primary text-white gap-1.5 shadow-md shadow-primary/20"
              >
                <Send className="h-4 w-4" /> Mark as Sent
              </Button>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">

          {/* ── Main Editor ── */}
          <div className="space-y-4">
            {/* Title + Status */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Message Review</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  For <span className="font-medium text-foreground">{message.stakeholderName}</span>
                  {hasBeenEdited && <span className="ml-2 text-amber-500 font-medium">· Edited from original</span>}
                </p>
              </div>
              <Badge className={`${status.className} border shadow-none font-medium`}>
                {status.label}
              </Badge>
            </div>

            {/* Editor / Preview Tabs */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "edit" | "preview")}>
              <div className="flex items-center justify-between">
                <TabsList className="h-9 bg-muted/50">
                  <TabsTrigger value="edit" className="gap-1.5 text-sm px-3 h-7">
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-1.5 text-sm px-3 h-7">
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{wordCount} words</span>
                  {hasBeenEdited && (
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium"
                    >
                      <RotateCcw className="h-3 w-3" /> Reset to original
                    </button>
                  )}
                </div>
              </div>

              <TabsContent value="edit" className="mt-2">
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 bg-muted/30 border-b text-xs text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>AI-generated draft — edit freely before approving</span>
                  </div>
                  <Textarea
                    ref={textareaRef}
                    className="min-h-[480px] resize-y p-5 text-base leading-relaxed border-0 focus-visible:ring-0 rounded-none bg-transparent font-normal"
                    value={content}
                    onChange={handleContentChange}
                    placeholder="Message content will appear here…"
                    disabled={message.status === 'sent'}
                  />
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-2">
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 bg-muted/30 border-b text-xs text-muted-foreground">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Preview — how the message will appear</span>
                  </div>
                  <div className="p-6">
                    {/* Letter Header */}
                    <div className="mb-6 pb-4 border-b border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Change Communication</span>
                      </div>
                      <p className="text-sm text-muted-foreground">To: <span className="font-medium text-foreground">{message.stakeholderName}</span></p>
                      <p className="text-sm text-muted-foreground">Re: <span className="font-medium text-foreground">{message.mentalModel}</span> profile communication</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(), 'MMMM d, yyyy')}</p>
                    </div>
                    <div className="text-base leading-relaxed text-foreground whitespace-pre-wrap font-normal min-h-[380px]">
                      {content || <span className="text-muted-foreground italic">No content to preview.</span>}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Bottom action hint */}
            {message.status === 'sent' && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <Send className="h-4 w-4 text-blue-500 shrink-0" />
                This message has been marked as sent and is now read-only.
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">
            {/* Stakeholder Card */}
            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                  <User className="h-4 w-4" /> Stakeholder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div>
                  <p className="text-xl font-bold text-foreground">{message.stakeholderName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5 font-medium">Mental Model</p>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 shadow-none font-semibold text-sm px-3 py-1 flex items-center gap-1.5 w-fit">
                    <Brain className="h-3.5 w-3.5" />
                    {message.mentalModel}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Created</p>
                  <p className="text-sm text-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {format(new Date(message.createdAt), 'MMM d, yyyy · h:mm a')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-0">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2.5 h-10"
                  onClick={handleDownloadPDF}
                >
                  <Download className="h-4 w-4 text-primary" />
                  Download as PDF
                </Button>
                {isEdited && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2.5 h-10"
                    onClick={() => saveChanges()}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-muted-foreground" />}
                    Save Changes
                  </Button>
                )}
                {message.status === 'draft' && (
                  <Button
                    className="w-full justify-start gap-2.5 h-10 bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={() => saveChanges("approved")}
                    disabled={isSaving}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve Message
                  </Button>
                )}
                {message.status === 'approved' && (
                  <Button
                    className="w-full justify-start gap-2.5 h-10 bg-primary text-white"
                    onClick={handleOpenEmailDialog}
                  >
                    <Mail className="h-4 w-4" />
                    Send Email to Stakeholder
                  </Button>
                )}
                {hasBeenEdited && (
                  <button
                    onClick={handleReset}
                    className="w-full text-left text-sm text-amber-600 hover:text-amber-700 flex items-center gap-2 px-1 py-1"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset to original AI draft
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Why this works */}
            <div className="rounded-xl bg-gradient-to-br from-primary/5 to-teal-500/5 border border-primary/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Why this message works</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This message was crafted specifically for a <strong className="text-foreground">{message.mentalModel}</strong> — addressing their unique psychological needs, core motivations, and likely hesitations around change. It uses language patterns proven to build trust with this archetype.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Send Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Send Email to Stakeholder
            </DialogTitle>
            <DialogDescription>
              This will send the approved message directly to <strong>{message?.stakeholderName}</strong>'s registered email address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="emailSubject" className="text-sm font-semibold">Email Subject</Label>
              <Input
                id="emailSubject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="e.g. Change Update for your team"
                className="h-11 rounded-xl"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendEmail(); }}
              />
            </div>
            <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2.5">
              The message body will be the approved content shown in the editor.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEmailDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={sendEmailMutation.isPending || !emailSubject.trim()}
              className="rounded-xl bg-primary text-white gap-2"
            >
              {sendEmailMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
              ) : (
                <><Mail className="h-4 w-4" /> Send Email</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
