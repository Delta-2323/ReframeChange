import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Target, MessageSquare } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Background image & gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Hero abstract" 
            className="w-full h-full object-cover opacity-20 object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background"></div>
        </div>

        <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-32 md:pb-36">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-semibold text-secondary mb-6 border border-secondary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              Based on the REM16™ Framework
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-foreground drop-shadow-sm">
              Navigate Change with <span className="text-gradient">Precision.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              Identify stakeholder mental models and generate psychologically safe, deeply personalized communications powered by AI and organizational psychology.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/survey" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-xl shadow-primary/20 transition-all hover:-translate-y-1">
                  Discover Your Model
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/manager" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full h-14 px-8 text-lg font-semibold bg-white/50 backdrop-blur-sm border-2 rounded-2xl hover:bg-white/80 transition-all hover:-translate-y-1">
                  Manager Login
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-8 mt-24"
          >
            <div className="glass-card rounded-3xl p-8 transition-transform hover:-translate-y-2 duration-300">
              <div className="h-14 w-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">16 Mental Models</h3>
              <p className="text-muted-foreground leading-relaxed">
                Map stakeholders into distinct personas based on their thinking focus, orientation to change, and desired role.
              </p>
            </div>

            <div className="glass-card rounded-3xl p-8 transition-transform hover:-translate-y-2 duration-300">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <MessageSquare className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Tailored AI Comms</h3>
              <p className="text-muted-foreground leading-relaxed">
                Generate psychologically safe messaging that speaks directly to what each stakeholder cares about most.
              </p>
            </div>

            <div className="glass-card rounded-3xl p-8 transition-transform hover:-translate-y-2 duration-300">
              <div className="h-14 w-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6">
                <BarChart3 className="h-7 w-7 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Rich Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Gain a birds-eye view of your organization's readiness and resistance across all active change projects.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
