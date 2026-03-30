import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/Home";
import SurveyForm from "@/pages/survey/SurveyForm";
import SurveyResult from "@/pages/survey/SurveyResult";
import ManagerDashboard from "@/pages/dashboard/ManagerDashboard";
import MessageReview from "@/pages/dashboard/MessageReview";
import ConcernsPage from "@/pages/dashboard/ConcernsPage";
import SmeRespond from "@/pages/sme/SmeRespond";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    }
  }
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/survey" component={SurveyForm} />
      <Route path="/survey/result/:id" component={SurveyResult} />
      
      <Route path="/manager" component={ManagerDashboard} />
      <Route path="/manager/messages/:id" component={MessageReview} />
      <Route path="/manager/concerns" component={ConcernsPage} />
      
      <Route path="/sme/respond/:id" component={SmeRespond} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
