import { Link, useLocation } from "wouter";
import { Activity, ShieldCheck, Home as HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src={`${import.meta.env.BASE_URL}images/logo-icon.png`} 
              alt="Game Changer Logo" 
              className="h-8 w-8 object-contain"
            />
            <Link 
              href="/" 
              className="font-display text-xl font-bold text-primary transition-colors hover:text-secondary"
            >
              Game Changer
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant={location === "/" ? "secondary" : "ghost"} size="sm" className="hidden md:flex gap-2">
                <HomeIcon className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link href="/survey">
              <Button variant={location === "/survey" ? "secondary" : "ghost"} size="sm" className="hidden md:flex gap-2">
                <Activity className="h-4 w-4" />
                Take Survey
              </Button>
            </Link>
            <div className="h-6 w-px bg-border hidden md:block"></div>
            <Link href="/manager">
              <Button variant={location.startsWith("/manager") ? "default" : "outline"} size="sm" className="gap-2">
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
