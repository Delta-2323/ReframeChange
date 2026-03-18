import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/Navbar";

export function ManagerAuth({ onLogin }: { onLogin: (pin: string) => boolean }) {
  const [pin, setPin] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(pin);
    if (!success) {
      toast({
        title: "Invalid PIN",
        description: "Please check your PIN and try again.",
        variant: "destructive"
      });
      setPin("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-black/5 p-8 md:p-12 border border-border"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">Manager Portal</h2>
            <p className="text-muted-foreground">Enter your secure PIN to access change management analytics and tools.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter PIN (hint: manager123)"
                className="h-14 text-center text-xl tracking-widest rounded-xl border-2"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoFocus
              />
            </div>
            
            <Button type="submit" size="lg" className="w-full h-14 text-lg rounded-xl">
              Authenticate <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
