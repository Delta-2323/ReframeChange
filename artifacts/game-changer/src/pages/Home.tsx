import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Target, MessageSquare, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Target,
    label: "16 Mental Models",
    description: "Map each stakeholder to one of 16 distinct psychological archetypes based on how they think, feel, and engage with change.",
    color: "bg-blue-50 text-blue-700",
  },
  {
    icon: MessageSquare,
    label: "AI-Tailored Communications",
    description: "Generate psychologically safe messages that speak directly to each stakeholder's core motivations and hesitations.",
    color: "bg-teal-50 text-teal-700",
  },
  {
    icon: BarChart3,
    label: "Readiness Analytics",
    description: "Get a real-time view of your organisation's change readiness across all active projects and stakeholder groups.",
    color: "bg-indigo-50 text-indigo-700",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-white to-secondary/4 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-secondary/5 blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 border border-secondary/20 px-4 py-1.5 text-sm font-semibold text-secondary mb-7">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
                </span>
                Based on the REM16™ Framework
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight text-primary leading-[1.05] mb-6">
                Navigate Change<br />
                with <span className="text-gradient">Precision.</span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-xl">
                Identify stakeholder mental models and generate psychologically safe, deeply personalised communications powered by AI and organisational psychology.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/survey" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full h-12 px-7 text-base font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md shadow-primary/20 gap-2 transition-all hover:-translate-y-0.5"
                  >
                    Discover Your Model
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/manager" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full h-12 px-7 text-base font-semibold border-2 border-border hover:border-primary/30 rounded-xl gap-2 transition-all hover:-translate-y-0.5"
                  >
                    Manager Login
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 md:py-24 bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-center mb-14">
                <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-3">Why Game Changer</p>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-primary">Built for the human side of change</h2>
                <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
                  Every stakeholder is different. Game Changer makes it easy to reach them where they are.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {features.map((f, i) => (
                  <motion.div
                    key={f.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
                    className="group rounded-2xl border border-border bg-white p-8 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className={`h-12 w-12 rounded-xl ${f.color} flex items-center justify-center mb-5`}>
                      <f.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-foreground mb-3">{f.label}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{f.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20 bg-primary">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Ready to understand your stakeholders?
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-md mx-auto">
                Take the 4-question survey and discover your REM16™ mental model in under 2 minutes.
              </p>
              <Link href="/survey">
                <Button size="lg" className="h-12 px-8 font-semibold text-base bg-white text-primary hover:bg-white/90 rounded-xl gap-2 shadow-lg">
                  Start Survey
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-display font-bold text-xs">GC</span>
            </div>
            <span className="text-sm font-semibold text-muted-foreground">Game Changer · REM16™</span>
          </div>
          <p className="text-xs text-muted-foreground">Powered by organisational psychology and AI</p>
        </div>
      </footer>
    </div>
  );
}
