import { useState } from "react";
import { useParams } from "wouter";
import { Loader2, CheckCircle, Send, AlertCircle } from "lucide-react";
import { useGetConcern, useSubmitSmeResponse, concernKeys } from "@/hooks/use-supabase";
import { useQueryClient } from "@tanstack/react-query";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function SmeRespond() {
  const { id } = useParams();
  const concernId = Number(id);
  const { data: concern, isLoading, error } = useGetConcern(concernId);
  const submitMutation = useSubmitSmeResponse();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [response, setResponse] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitMutation.mutateAsync({ id: concernId, response });
      queryClient.invalidateQueries({ queryKey: concernKeys.detail(concernId) });
      setSubmitted(true);
      toast({ title: "Response submitted successfully" });
    } catch {
      toast({ title: "Error submitting response", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  if (error || !concern) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-bold">Concern not found</h2>
          <p className="text-muted-foreground text-sm">This link may be invalid or the concern has been removed.</p>
        </main>
      </div>
    );
  }

  if (submitted || concern.status === "responded" || concern.status === "resolved") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">Response Submitted</h2>
          <p className="text-muted-foreground max-w-md">
            Thank you for your expert response. The change management team will review it and take appropriate action.
          </p>
          {concern.smeResponse && (
            <Card className="max-w-lg w-full text-left mt-4">
              <CardContent className="pt-6">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Your response:</p>
                <p className="text-sm">{concern.smeResponse}</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <Navbar />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full">
        <Card className="shadow-sm">
          <CardHeader className="bg-primary/5 border-b">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-100 text-blue-800 border-0">SME Response Requested</Badge>
            </div>
            <CardTitle className="text-2xl">Stakeholder Concern</CardTitle>
            <CardDescription>You've been assigned as the subject matter expert for this concern.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">From Stakeholder</p>
              <p className="font-semibold">{concern.stakeholderName}</p>
              <p className="text-sm mt-2">{concern.concernText}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Your Expert Response</Label>
                <Textarea
                  required
                  rows={6}
                  value={response}
                  onChange={e => setResponse(e.target.value)}
                  placeholder="Provide your expert perspective on this concern..."
                  className="text-sm"
                />
              </div>
              <Button type="submit" disabled={submitMutation.isPending} className="w-full h-12 gap-2">
                {submitMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="h-4 w-4" /> Submit Response</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
