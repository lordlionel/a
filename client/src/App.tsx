import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/layout/navbar";
import Dashboard from "@/pages/dashboard";
import Consumers from "@/pages/consumers";
import Presences from "@/pages/presences";
import Consumptions from "@/pages/consumptions";
import Reports from "@/pages/reports";
import ReportsSimple from "@/pages/reports-simple";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-full">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/consumers" component={Consumers} />
          <Route path="/fiches" component={Presences} />
          <Route path="/consumptions" component={Consumptions} />
          <Route path="/reports" component={ReportsSimple} />
          <Route path="/reports-full" component={Reports} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
