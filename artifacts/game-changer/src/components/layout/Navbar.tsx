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
          <Link href="/" className="flex items-center group">
            <div className="bg-black px-3 py-1.5 leading-none">
              <div className="text-white font-display font-black text-[11px] tracking-[0.15em] uppercase">Reframe</div>
              <div className="text-white font-display font-black text-[11px] tracking-[0.15em] uppercase rotate-180">Change</div>
            </div>
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

            {location !== "/" && (
              <>
                <div className="h-5 w-px bg-border mx-1 hidden sm:block" />
                <Link href="/manager">
                  <Button
                    size="sm"
                    className={`gap-2 text-sm font-medium hidden sm:flex ${isManager ? "bg-primary text-white shadow-sm" : "bg-transparent border border-primary/30 text-primary hover:bg-primary hover:text-white transition-colors"}`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Manager Portal
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
