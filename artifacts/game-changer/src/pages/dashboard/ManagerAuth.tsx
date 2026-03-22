import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/Navbar";

export function ManagerAuth({ onLogin }: { onLogin: (pin: string) => boolean }) {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const success = onLogin(pin);
    setIsLoading(false);
    if (!success) {
      toast({
        title: "Incorrect PIN",
        description: "Please check your access PIN and try again.",
        variant: "destructive",
      });
      setPin("");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Card */}
          <div className="bg-white rounded-2xl border border-border shadow-lg overflow-hidden">
            {/* Header bar */}
            <div className="bg-primary px-8 py-8 text-center">
              <div className="h-14 w-14 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-display font-bold text-white">Manager Portal</h2>
              <p className="text-white/70 text-sm mt-1">Secure access for change managers</p>
            </div>

            <div className="px-8 py-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="pin" className="text-sm font-semibold text-foreground">Access PIN</Label>
                  <div className="relative">
                    <Input
                      id="pin"
                      type={showPin ? "text" : "password"}
                      placeholder="Enter your PIN"
                      className="h-11 pr-10 text-sm border-border focus-visible:ring-secondary/30 rounded-lg"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      autoFocus
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPin(v => !v)}
                      tabIndex={-1}
                    >
                      {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground pt-0.5">Hint: manager123</p>
                </div>

                <Button
                  type="submit"
                  disabled={!pin || isLoading}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg text-sm"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying…
                    </span>
                  ) : "Authenticate"}
                </Button>
              </form>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-5">
            Session is saved securely in your browser.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
