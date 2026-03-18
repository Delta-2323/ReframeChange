import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, CheckCircle2, Save, Send, User, Sparkles, Loader2, AlertCircle
} from "lucide-react";
import { format } from "date-fns";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

import { 
  useGetMessage, 
  useUpdateMessage, 
  getGetMessageQueryKey, 
  getGetMessagesQueryKey,
  UpdateMessageInputStatus
} from "@workspace/api-client-react";

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

  useEffect(() => {
    if (message) {
      setContent(message.editedContent || message.generatedContent);
    }
  }, [message]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (!isEdited) setIsEdited(true);
  };

  const saveChanges = async (newStatus?: UpdateMessageInputStatus) => {
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
      
      if (newStatus) {
        toast({ title: `Message marked as ${newStatus}` });
        if (newStatus === "sent") {
            setLocation("/manager");
        }
      } else {
        toast({ title: "Changes saved successfully" });
      }
    } catch {
      toast({ title: "Error saving changes", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></main>
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-4">Message not found</h2>
          <Button onClick={() => setLocation("/manager")}>Return to Dashboard</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <Navbar />
      
      <div className="bg-white border-b border-border sticky top-16 z-40 shadow-sm">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/manager")} className="-ml-2 text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => saveChanges()} 
              disabled={!isEdited || updateMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" /> Save Draft
            </Button>
            
            {message.status !== 'approved' && message.status !== 'sent' && (
              <Button 
                onClick={() => saveChanges("approved")} 
                disabled={updateMutation.isPending}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
              </Button>
            )}
            
            {message.status === 'approved' && (
              <Button 
                onClick={() => saveChanges("sent")} 
                disabled={updateMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Send className="mr-2 h-4 w-4" /> Mark as Sent
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="grid md:grid-cols-[1fr_300px] gap-8">
          
          {/* Main Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-display font-bold">Review Message</h2>
              <Badge variant={message.status === 'draft' ? 'outline' : 'default'} className={
                message.status === 'approved' ? 'bg-teal-100 text-teal-800 hover:bg-teal-200' :
                message.status === 'sent' ? 'bg-secondary text-white' : ''
              }>
                {message.status.toUpperCase()}
              </Badge>
            </div>
            
            <div className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden flex flex-col">
              <div className="bg-muted/30 px-6 py-3 border-b flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-secondary" /> AI Generated Draft
                </span>
                <span className="text-xs text-muted-foreground">{format(new Date(message.createdAt), 'PPpp')}</span>
              </div>
              <Textarea 
                className="min-h-[500px] resize-y p-6 text-base leading-relaxed border-0 focus-visible:ring-0 rounded-none bg-transparent"
                value={content}
                onChange={handleContentChange}
                placeholder="Message content..."
              />
            </div>
          </div>
          
          {/* Context Sidebar */}
          <div className="space-y-6 pt-10 md:pt-14">
            <Card className="shadow-sm border-border/50">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4 flex items-center text-foreground">
                  <User className="h-5 w-5 mr-2 text-primary/60" /> Target Stakeholder
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Name</p>
                    <p className="font-medium text-lg">{message.stakeholderName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Identified Mental Model</p>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 font-bold px-3 py-1 text-sm">
                      {message.mentalModel}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-secondary/5 rounded-2xl p-6 border border-secondary/10">
              <h3 className="font-semibold text-secondary-foreground mb-2 flex items-center text-sm uppercase tracking-wider">
                <Sparkles className="h-4 w-4 mr-2 text-secondary" /> Why this works
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This communication was structurally generated to appeal specifically to a <strong>{message.mentalModel}</strong>, addressing their core needs for proof, process, or vision, while mitigating their unique hesitations.
              </p>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
