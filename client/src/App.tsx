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
import NotFound from "@/pages/not-found";
import { initializeMobileApp } from "@/lib/init-mobile";
import { useEffect, useState } from "react";

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
          <Route path="/reports" component={Reports} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeMobileApp()
      .then(() => setIsReady(true))
      .catch((error) => {
        console.error('Failed to initialize mobile app:', error);
        setIsReady(true); // Continue anyway in web mode
      });
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'application...</p>
        </div>
      </div>
    );
  }

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
