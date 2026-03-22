import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { useGetSurvey } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function SurveyResult() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { data: survey, isLoading, error } = useGetSurvey(Number(id));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl space-y-5">
            <div className="rounded-2xl border border-border bg-white p-10 space-y-6">
              <Skeleton className="h-16 w-16 rounded-2xl mx-auto" />
              <Skeleton className="h-9 w-1/2 mx-auto" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
          <div className="text-4xl mb-2">😕</div>
          <h2 className="text-xl font-display font-bold">Survey not found</h2>
          <p className="text-muted-foreground text-sm">This survey may have expired or the link is incorrect.</p>
          <Button onClick={() => setLocation("/survey")} className="mt-2 gap-2">
            <RotateCcw className="h-4 w-4" /> Take Survey Again
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Hero result card */}
          <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
            <div className="bg-primary px-8 py-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_top_right,_hsl(185_72%_60%),_transparent_60%)]" />
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.4 }}
                className="relative z-10"
              >
                <div className="h-16 w-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <p className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-2">Your REM16™ Mental Model</p>
                <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight mb-3">
                  {survey.mentalModel}
                </h1>
                <p className="text-white/80 text-base">
                  Hi <span className="font-semibold text-white">{survey.stakeholderName}</span>, here's what your profile reveals.
                </p>
              </motion.div>
            </div>

            <div className="p-7 md:p-9">
              {/* Profile breakdown */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { label: "Thinking Focus", value: survey.thinkingFocus },
                  { label: "Orientation", value: survey.orientation },
                  { label: "Change Role", value: survey.changeRole },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-muted/40 border border-border/60 p-4 text-center">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{item.label}</p>
                    <Badge className="bg-primary/10 text-primary border-0 shadow-none font-bold text-sm px-2 py-0.5">
                      {item.value}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-display font-bold text-foreground mb-3">What this means for you</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {survey.mentalModelDescription}
                </p>
              </div>

              {/* What happens next */}
              <div className="rounded-xl bg-secondary/5 border border-secondary/15 p-5 mb-8">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-secondary/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm mb-1">Your manager will be in touch</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Based on your profile, your change manager can now generate a personalised communication tailored to your mental model — addressing exactly what matters most to you.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => setLocation("/survey")}
                  className="flex-1 h-11 border-2 rounded-xl text-sm font-medium gap-2"
                >
                  <RotateCcw className="h-4 w-4" /> Take Another Survey
                </Button>
                <Button
                  onClick={() => setLocation("/")}
                  className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-medium gap-2"
                >
                  Return Home
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
