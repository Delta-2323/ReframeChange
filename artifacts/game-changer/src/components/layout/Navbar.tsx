import { Link, useLocation } from "wouter";
import { LayoutDashboard, ClipboardList, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();
  const isManager = location.startsWith("/manager");
  const isSurvey = location.startsWith("/survey");

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-15 items-center justify-between" style={{ height: '60px' }}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-white font-display font-bold text-sm">RC</span>
            </div>
            <span className="font-display text-lg font-bold text-primary tracking-tight group-hover:text-secondary transition-colors">
              Reframe Change
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-2 text-sm font-medium hidden sm:flex ${location === "/" ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link href="/survey">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-2 text-sm font-medium hidden sm:flex ${isSurvey ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}
              >
                <ClipboardList className="h-4 w-4" />
                Take Survey
              </Button>
            </Link>

            <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

            <Link href="/manager">
              <Button
                size="sm"
                className={`gap-2 text-sm font-medium ${isManager ? "bg-primary text-white shadow-sm" : "bg-primary/8 text-primary border border-primary/20 hover:bg-primary hover:text-white"}`}
                style={{ backgroundColor: isManager ? undefined : 'hsl(220 55% 18% / 0.06)' }}
              >
                <ShieldCheck className="h-4 w-4" />
                Manager Portal
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
