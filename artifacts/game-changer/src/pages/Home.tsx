import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Target, MessageSquare, ChevronRight, FlaskConical, Cog, Heart, Lightbulb, ClipboardList, UserSearch, Wand2, CheckCheck, Send } from "lucide-react";
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


type ModelCard = { key: string; name: string; description: string; focus: string; orientation: string; role: string };

const models: ModelCard[] = [
  { key: "Proof-Eager-Rockstar",         name: "The Champion Analyst",   description: "Champions change with evidence. Energetically communicates data-driven rationale and inspires others through logical argument.", focus: "Proof",       orientation: "Eager",    role: "Rockstar" },
  { key: "Proof-Eager-Roadie",           name: "The Quiet Validator",    description: "Supports change by gathering and sharing evidence behind the scenes, building confidence in others through thorough research.", focus: "Proof",       orientation: "Eager",    role: "Roadie"   },
  { key: "Proof-Cautious-Rockstar",      name: "The Sceptic",            description: "Asks the hard questions publicly. Needs solid evidence before committing — their visible scrutiny ensures the change is rigorous.", focus: "Proof",       orientation: "Cautious", role: "Rockstar" },
  { key: "Proof-Cautious-Roadie",        name: "The Silent Doubter",     description: "Has reservations but expresses them quietly. Needs data and reassurance before fully committing to supporting the change.", focus: "Proof",       orientation: "Cautious", role: "Roadie"   },
  { key: "Process-Eager-Rockstar",       name: "The Systems Builder",    description: "Champions change through structure. Visibly leads implementation of plans, processes, and governance frameworks.", focus: "Process",     orientation: "Eager",    role: "Rockstar" },
  { key: "Process-Eager-Roadie",         name: "The Reliable Executor",  description: "Supports change by diligently following processes — the backbone of implementation: reliable, thorough, and consistent.", focus: "Process",     orientation: "Eager",    role: "Roadie"   },
  { key: "Process-Cautious-Rockstar",    name: "The Risk Manager",       description: "Visibly advocates for careful, risk-aware change. Raises concerns about process gaps to help the team avoid costly mistakes.", focus: "Process",     orientation: "Cautious", role: "Rockstar" },
  { key: "Process-Cautious-Roadie",      name: "The Resistant Follower", description: "Follows instructions but has serious concerns about planning. Needs clear processes and assurances before fully engaging.", focus: "Process",     orientation: "Cautious", role: "Roadie"   },
  { key: "People-Eager-Rockstar",        name: "The Energiser",          description: "Brings emotional energy and enthusiasm. Visibly rallies people, builds morale, and creates community around the change journey.", focus: "People",      orientation: "Eager",    role: "Rockstar" },
  { key: "People-Eager-Roadie",          name: "The Quiet Connector",    description: "Nurtures relationships behind the scenes. Listens, supports, and connects people informally — helping teams feel safe and supported.", focus: "People",      orientation: "Eager",    role: "Roadie"   },
  { key: "People-Cautious-Rockstar",     name: "The Protector",          description: "Visibly advocates for team wellbeing during change. Cautious about human impact and ensures the cost of change is recognised.", focus: "People",      orientation: "Cautious", role: "Rockstar" },
  { key: "People-Cautious-Roadie",       name: "The Concerned Observer", description: "Deeply worried about how change affects people, but expresses concerns quietly. Needs reassurance about wellbeing before engaging.", focus: "People",      orientation: "Cautious", role: "Roadie"   },
  { key: "Possibility-Eager-Rockstar",   name: "The Creator",            description: "The visionary champion. Sees exciting possibilities and actively promotes a bold future, inspiring others with creativity and enthusiasm.", focus: "Possibility", orientation: "Eager",    role: "Rockstar" },
  { key: "Possibility-Eager-Roadie",     name: "The Dreamer",            description: "Inspired by possibilities and supports change enthusiastically behind the scenes — generating ideas and creative solutions.", focus: "Possibility", orientation: "Eager",    role: "Roadie"   },
  { key: "Possibility-Cautious-Rockstar",name: "The Critic",             description: "Sees the potential but is openly critical of execution. Challenges assumptions publicly and pushes for more ambitious approaches.", focus: "Possibility", orientation: "Cautious", role: "Rockstar" },
  { key: "Possibility-Cautious-Roadie",  name: "The Hesitant Innovator", description: "Drawn to possibilities but holds back due to uncertainty. Needs the vision articulated more clearly before committing creative energy.", focus: "Possibility", orientation: "Cautious", role: "Roadie"   },
];

const focusGroups = ["Proof", "Process", "People", "Possibility"] as const;

const focusMeta: Record<string, { color: string; badge: string; icon: React.ElementType }> = {
  Proof:       { color: "border-violet-200 bg-violet-50/60",  badge: "bg-violet-100 text-violet-700",  icon: FlaskConical },
  Process:     { color: "border-blue-200 bg-blue-50/60",      badge: "bg-blue-100 text-blue-700",      icon: Cog          },
  People:      { color: "border-rose-200 bg-rose-50/60",      badge: "bg-rose-100 text-rose-700",      icon: Heart        },
  Possibility: { color: "border-amber-200 bg-amber-50/60",    badge: "bg-amber-100 text-amber-700",    icon: Lightbulb    },
};

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
              </div>
            </motion.div>
          </div>
        </section>

        {/* What Reframe Change actually does — step by step */}
        <section className="py-20 md:py-24 bg-primary/3 border-y border-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-14">
                <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-3">How Reframe Change Works</p>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-primary">From stakeholder to sent message — in minutes.</h2>
                <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
                  Reframe Change turns a 4-question survey into a personalised, psychologically informed communication — without the guesswork.
                </p>
              </div>

              <div className="relative">
                <div className="hidden md:block absolute top-9 left-[calc(10%+2.5rem)] right-[calc(10%+2.5rem)] h-px bg-border" />
                <div className="grid md:grid-cols-5 gap-6 relative">
                  {[
                    { icon: ClipboardList, step: "01", label: "Stakeholder takes survey", desc: "A short 4-question survey identifies how each person thinks about and engages with change.", color: "bg-blue-50 text-blue-700" },
                    { icon: UserSearch,    step: "02", label: "Mental model identified", desc: "The REM16™ framework maps their answers to one of 16 precise psychological archetypes.", color: "bg-violet-50 text-violet-700" },
                    { icon: Wand2,         step: "03", label: "AI drafts the message", desc: "GPT generates a tailored communication written specifically for that person's mindset and role.", color: "bg-teal-50 text-teal-700" },
                    { icon: CheckCheck,    step: "04", label: "Manager reviews & approves", desc: "You read, edit if needed, and approve the message before anything is sent.", color: "bg-amber-50 text-amber-700" },
                    { icon: Send,          step: "05", label: "Message sent — tracked", desc: "The approved message is emailed directly to the stakeholder, logged, and included in your readiness dashboard.", color: "bg-rose-50 text-rose-700" },
                  ].map((s, i) => (
                    <motion.div
                      key={s.step}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: i * 0.09 }}
                      className="flex flex-col items-center text-center relative"
                    >
                      <div className={`h-[4.5rem] w-[4.5rem] rounded-2xl ${s.color} flex items-center justify-center mb-5 ring-4 ring-white shadow-sm`}>
                        <s.icon className="h-7 w-7" />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1">{s.step}</span>
                      <h4 className="font-display font-bold text-foreground text-sm mb-2 leading-snug">{s.label}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why Reframe Change */}
        <section className="py-20 md:py-24 bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-center mb-14">
                <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-3">Why Reframe Change</p>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-primary">Built for the human side of change</h2>
                <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
                  Every stakeholder is different. Reframe Change makes it easy to reach them where they are.
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

        {/* The 16 Models */}
        <section className="py-20 md:py-28 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-14">
                <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-3">All 16 Archetypes</p>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-primary">Which one are you?</h2>
                <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
                  Every person on your team fits one of these profiles. Understanding them is the first step to communicating effectively.
                </p>
              </div>

              <div className="space-y-10">
                {focusGroups.map((focus, gi) => {
                  const meta = focusMeta[focus];
                  const FocusIcon = meta.icon;
                  const groupModels = models.filter((m) => m.focus === focus);
                  return (
                    <motion.div
                      key={focus}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: gi * 0.08 }}
                    >
                      <div className="flex items-center gap-3 mb-5">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${meta.badge}`}>
                          <FocusIcon className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-lg text-foreground leading-tight">{focus} Thinkers</h3>
                          <p className="text-xs text-muted-foreground">4 archetypes — driven by {focus.toLowerCase()}</p>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {groupModels.map((model) => (
                          <div
                            key={model.key}
                            className={`rounded-xl border p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${meta.color}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-display font-bold text-sm leading-snug text-foreground">{model.name}</h4>
                            </div>
                            <div className="flex gap-1.5 flex-wrap">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.badge}`}>{model.orientation}</span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.badge} opacity-75`}>{model.role}</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed flex-1">{model.description}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20 bg-primary">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
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
              <span className="text-white font-display font-bold text-xs">RC</span>
            </div>
            <span className="text-sm font-semibold text-muted-foreground">Reframe Change · REM16™</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Powered by organisational psychology and AI ·{" "}
            <Link href="/manager" className="hover:text-foreground transition-colors">Admin</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
