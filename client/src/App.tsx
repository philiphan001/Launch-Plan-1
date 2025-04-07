import { Switch, Route } from "wouter";
import Dashboard from "@/pages/Dashboard";
import FinancialProjections from "@/pages/FinancialProjections";
import CareerExploration from "@/pages/CareerExploration";
import CareerBuilder from "@/pages/CareerBuilder";
import CollegeDiscovery from "@/pages/CollegeDiscovery";
import NetPriceCalculator from "@/pages/NetPriceCalculator";
import Pathways from "@/pages/Pathways";
import Assumptions from "@/pages/Assumptions";
import Profile from "@/pages/Profile";
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
        <Route path="/career-builder" component={CareerBuilder} />
        <Route path="/colleges" component={CollegeDiscovery} />
        <Route path="/calculator" component={NetPriceCalculator} />
        <Route path="/pathways" component={Pathways} />
        <Route path="/profile" component={Profile} />
        <Route path="/settings" component={Settings} />
        
        {/* Redirect /assumptions to /settings with assumptions tab */}
        <Route path="/assumptions">
          {() => {
            window.location.href = "/settings#assumptions";
            return null;
          }}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

export default App;
