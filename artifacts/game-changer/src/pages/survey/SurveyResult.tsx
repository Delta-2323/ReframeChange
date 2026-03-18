import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { useGetSurvey } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Activity, BrainCircuit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SurveyResult() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { data: survey, isLoading, error } = useGetSurvey(Number(id));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-12 text-center space-y-6">
            <Skeleton className="h-20 w-20 rounded-full mx-auto" />
            <Skeleton className="h-10 w-2/3 mx-auto" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Survey not found</h2>
          <Button onClick={() => setLocation("/survey")}>Take Survey Again</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-primary/5 rounded-b-[100%] blur-3xl -z-10 transform -translate-y-1/2"></div>
      
      <Navbar />
      
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-border overflow-hidden"
        >
          <div className="bg-gradient-to-br from-primary to-slate-800 p-12 text-center text-primary-foreground relative overflow-hidden">
            {/* Decorative overlay in header */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop')] opacity-10 mix-blend-overlay object-cover"></div>
            
            <div className="relative z-10">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
                className="h-24 w-24 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-secondary/30"
              >
                <BrainCircuit className="h-12 w-12 text-secondary-foreground" />
              </motion.div>
              <h2 className="text-xl font-medium text-primary-foreground/80 mb-2 uppercase tracking-widest">Your Mental Model</h2>
              <h1 className="text-5xl md:text-6xl font-display font-extrabold tracking-tight mb-4">{survey.mentalModel}</h1>
              <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
                Hi {survey.stakeholderName}, thanks for completing the survey.
              </p>
            </div>
          </div>
          
          <div className="p-8 md:p-12">
            <div className="prose prose-lg max-w-none text-muted-foreground mb-12">
              <h3 className="text-2xl font-bold text-foreground mb-4">What this means for you</h3>
              <p className="leading-relaxed text-lg">
                {survey.mentalModelDescription}
              </p>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-4 mb-12">
              <div className="bg-muted/50 rounded-2xl p-6 border border-border/50 text-center">
                <span className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Focus</span>
                <span className="text-xl font-bold text-foreground">{survey.thinkingFocus}</span>
              </div>
              <div className="bg-muted/50 rounded-2xl p-6 border border-border/50 text-center">
                <span className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Orientation</span>
                <span className="text-xl font-bold text-foreground">{survey.orientation}</span>
              </div>
              <div className="bg-muted/50 rounded-2xl p-6 border border-border/50 text-center">
                <span className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Role</span>
                <span className="text-xl font-bold text-foreground">{survey.changeRole}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button onClick={() => setLocation("/")} variant="outline" size="lg" className="h-14 px-8 rounded-xl border-2">
                Return to Home
              </Button>
              <Button onClick={() => setLocation("/manager")} size="lg" className="h-14 px-8 rounded-xl bg-primary hover:bg-primary/90">
                <ShieldCheck className="mr-2 h-5 w-5" /> Manager Portal
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
