import { Switch, Route } from "wouter";
import Dashboard from "@/pages/Dashboard";
import FinancialProjections from "@/pages/FinancialProjections";
import CareerExploration from "@/pages/CareerExploration";
import CollegeDiscovery from "@/pages/CollegeDiscovery";
import NetPriceCalculator from "@/pages/NetPriceCalculator";
import Pathways from "@/pages/Pathways";
import Assumptions from "@/pages/Assumptions";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import AppShell from "@/components/ui/layout/AppShell";

function App() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/projections" component={FinancialProjections} />
        <Route path="/careers" component={CareerExploration} />
        <Route path="/colleges" component={CollegeDiscovery} />
        <Route path="/calculator" component={NetPriceCalculator} />
        <Route path="/pathways" component={Pathways} />
        <Route path="/assumptions" component={Assumptions} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

export default App;
