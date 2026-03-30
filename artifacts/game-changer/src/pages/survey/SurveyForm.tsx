import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, Loader2, ArrowLeft } from "lucide-react";
import { useSubmitSurvey, useGetProjects } from "@/hooks/use-supabase";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const surveySchema = z.object({
  stakeholderName: z.string().min(2, "Name is required"),
  stakeholderEmail: z.string().email("Please enter a valid email address"),
  role: z.string().min(2, "Role is required"),
  thinkingFocus: z.enum(["Proof", "Process", "People", "Possibility"], { required_error: "Please select a focus area" }),
  orientation: z.enum(["Eager", "Cautious"], { required_error: "Please select an orientation" }),
  changeRole: z.enum(["Rockstar", "Roadie"], { required_error: "Please select a preferred role" }),
  projectId: z.number().optional().nullable(),
});

type SurveyFormValues = z.infer<typeof surveySchema>;

export default function SurveyForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  
  const { data: projectsData } = useGetProjects();
  const projects = projectsData?.projects || [];

  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      stakeholderName: "",
      stakeholderEmail: "",
      role: "",
      projectId: null,
    },
    mode: "onChange"
  });

  const submitMutation = useSubmitSurvey();

  const onSubmit = async (data: SurveyFormValues) => {
    try {
      const response = await submitMutation.mutateAsync(data);
      toast({
        title: "Survey completed!",
        description: "Analyzing your mental model...",
      });
      setLocation(`/survey/result/${response.id}`);
    } catch (error) {
      toast({
        title: "Error submitting survey",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const nextStep = async () => {
    const isValid = await form.trigger(step === 1 ? ["stakeholderName", "stakeholderEmail", "role"] : 
                                       step === 2 ? ["thinkingFocus"] : 
                                       step === 3 ? ["orientation"] : []);
    if (isValid) {
      setStep(s => Math.min(s + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep(s => Math.max(s - 1, 1));
  };

  const SelectionCard = ({ fieldName, value, title, description, icon: Icon }: any) => {
    const currentValue = form.watch(fieldName);
    const isSelected = currentValue === value;
    
    return (
      <button
        type="button"
        onClick={() => form.setValue(fieldName, value, { shouldValidate: true })}
        className={`w-full p-6 flex flex-col items-start rounded-2xl border-2 transition-all duration-200 text-left relative overflow-hidden group
          ${isSelected 
            ? 'border-secondary bg-secondary/5 shadow-md shadow-secondary/10 ring-4 ring-secondary/20' 
            : 'border-border bg-card hover:border-primary/30 hover:bg-muted/50 hover:shadow-sm'
          }`}
      >
        <div className="flex w-full items-start justify-between mb-3">
          <h3 className={`text-xl font-bold ${isSelected ? 'text-secondary' : 'text-foreground'}`}>
            {title}
          </h3>
          <div className={`h-6 w-6 rounded-full flex items-center justify-center border-2 transition-colors ${isSelected ? 'bg-secondary border-secondary text-white' : 'border-muted-foreground/30'}`}>
            {isSelected && <CheckCircle2 className="h-4 w-4" />}
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full">
        
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-2.5">
            <span>Step {step} of 4</span>
            <span className="font-semibold text-primary">{Math.round((step / 4) * 100)}% Complete</span>
          </div>
          <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-secondary rounded-full"
              initial={{ width: `${((step - 1) / 4) * 100}%` }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-3xl font-display font-bold text-foreground mb-2">Let's get to know you</h2>
                    <p className="text-muted-foreground text-lg">Your insights help shape the transformation journey.</p>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="stakeholderName" className="text-base font-semibold">Full Name</Label>
                      <Input 
                        id="stakeholderName" 
                        placeholder="Jane Doe" 
                        className="h-14 text-lg rounded-xl border-2 focus-visible:ring-secondary/20"
                        {...form.register("stakeholderName")} 
                      />
                      {form.formState.errors.stakeholderName && (
                        <p className="text-sm text-destructive">{form.formState.errors.stakeholderName.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="stakeholderEmail" className="text-base font-semibold">Email Address</Label>
                      <Input 
                        id="stakeholderEmail"
                        type="email"
                        placeholder="jane.doe@company.com" 
                        className="h-14 text-lg rounded-xl border-2 focus-visible:ring-secondary/20"
                        {...form.register("stakeholderEmail")} 
                      />
                      {form.formState.errors.stakeholderEmail && (
                        <p className="text-sm text-destructive">{form.formState.errors.stakeholderEmail.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-base font-semibold">Your Role / Title</Label>
                      <Input 
                        id="role" 
                        placeholder="E.g. Engineering Manager, Product Lead..." 
                        className="h-14 text-lg rounded-xl border-2 focus-visible:ring-secondary/20"
                        {...form.register("role")} 
                      />
                      {form.formState.errors.role && (
                        <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>
                      )}
                    </div>

                    {projects.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="projectId" className="text-base font-semibold">Project Context (Optional)</Label>
                        <Select 
                          onValueChange={(val) => form.setValue("projectId", val === "none" ? null : parseInt(val))}
                        >
                          <SelectTrigger className="h-14 text-lg rounded-xl border-2">
                            <SelectValue placeholder="Select a project..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None / General</SelectItem>
                            {projects.map((p) => (
                              <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-3xl font-display font-bold text-foreground mb-2">How do you approach work?</h2>
                    <p className="text-muted-foreground text-lg">Select the thinking focus that best describes you.</p>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <SelectionCard 
                      fieldName="thinkingFocus" value="Proof" title="Proof" 
                      description="Analytical, data-driven, and evidence-based. You need facts before making decisions." 
                    />
                    <SelectionCard 
                      fieldName="thinkingFocus" value="Process" title="Process" 
                      description="Structured, methodical, and detail-oriented. You care about the 'how' and minimizing risks." 
                    />
                    <SelectionCard 
                      fieldName="thinkingFocus" value="People" title="People" 
                      description="Emotional, relationship-focused. You care deeply about how changes affect the team." 
                    />
                    <SelectionCard 
                      fieldName="thinkingFocus" value="Possibility" title="Possibility" 
                      description="Creative, innovative, and big-picture oriented. You look for new ideas and future potential." 
                    />
                  </div>
                  {form.formState.errors.thinkingFocus && (
                    <p className="text-sm text-destructive">{form.formState.errors.thinkingFocus.message}</p>
                  )}
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-3xl font-display font-bold text-foreground mb-2">How do you feel about change?</h2>
                    <p className="text-muted-foreground text-lg">Are you generally excited or do you prefer stability?</p>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <SelectionCard 
                      fieldName="orientation" value="Eager" title="Eager" 
                      description="Enthusiastic and ready to move forward. You embrace change as an opportunity." 
                    />
                    <SelectionCard 
                      fieldName="orientation" value="Cautious" title="Cautious" 
                      description="Skeptical of risks. You need reassurance and clear reasoning before jumping in." 
                    />
                  </div>
                  {form.formState.errors.orientation && (
                    <p className="text-sm text-destructive">{form.formState.errors.orientation.message}</p>
                  )}
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-3xl font-display font-bold text-foreground mb-2">What's your role in transformation?</h2>
                    <p className="text-muted-foreground text-lg">How do you prefer to influence outcomes?</p>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <SelectionCard 
                      fieldName="changeRole" value="Rockstar" title="The Rockstar" 
                      description="A highly visible champion. You like leading from the front and rallying others." 
                    />
                    <SelectionCard 
                      fieldName="changeRole" value="Roadie" title="The Roadie" 
                      description="A behind-the-scenes supporter. You make things happen quietly but effectively." 
                    />
                  </div>
                  {form.formState.errors.changeRole && (
                    <p className="text-sm text-destructive">{form.formState.errors.changeRole.message}</p>
                  )}
                </motion.div>
              )}

            </AnimatePresence>

            <div className="mt-10 pt-8 border-t flex items-center justify-between">
              {step > 1 ? (
                <Button type="button" variant="outline" size="lg" onClick={prevStep} className="h-12 px-6 rounded-xl border-2">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              ) : <div></div>}
              
              {step < 4 ? (
                <Button type="button" onClick={nextStep} size="lg" className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90">
                  Continue <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={submitMutation.isPending}
                  className="h-12 px-8 rounded-xl bg-secondary hover:bg-secondary/90 text-white shadow-lg shadow-secondary/25"
                >
                  {submitMutation.isPending ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</>
                  ) : (
                    <><CheckCircle2 className="mr-2 h-5 w-5" /> Complete Survey</>
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
