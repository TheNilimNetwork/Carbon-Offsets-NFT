import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { Web3Provider } from "@/components/Web3Provider";
import ProducerDashboard from "@/pages/Producer/Dashboard";
import SubmitClaim from "@/pages/Producer/SubmitClaim";
import MyClaims from "@/pages/Producer/MyClaims";
import Marketplace from "@/pages/Buyer/Marketplace";
import MyCertificates from "@/pages/Buyer/MyCertificates";
import PendingClaims from "@/pages/Admin/PendingClaims";
import ApprovedClaims from "@/pages/Admin/ApprovedClaims";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/producer/dashboard" component={ProducerDashboard} />
      <Route path="/producer/submit-claim" component={SubmitClaim} />
      <Route path="/producer/my-claims" component={MyClaims} />
      <Route path="/buyer/marketplace" component={Marketplace} />
      <Route path="/buyer/certificates" component={MyCertificates} />
      <Route path="/admin/pending-claims" component={PendingClaims} />
      <Route path="/admin/approved-claims" component={ApprovedClaims} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </Web3Provider>
    </QueryClientProvider>
  );
}

export default App;
