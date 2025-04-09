import { Switch, Route, useLocation } from "wouter";
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
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import NotFound from "@/pages/not-found";
import AppShell from "@/components/ui/layout/AppShell";

function App() {
  const [location] = useLocation();
  
  // Check if the current route should be displayed within the AppShell
  const isPublicRoute = ["/", "/login", "/signup"].includes(location);
  
  // Routes that should be displayed without the AppShell layout
  if (isPublicRoute) {
    return (
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
      </Switch>
    );
  }
  
  // Routes that should be displayed within the AppShell layout
  return (
    <AppShell>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/projections" component={FinancialProjections} />
        <Route path="/careers" component={CareerExploration} />
        <Route path="/career-builder" component={CareerBuilder} />
        <Route path="/colleges" component={CollegeDiscovery} />
        <Route path="/calculator" component={NetPriceCalculator} />
        <Route path="/pathways" component={Pathways} />
        <Route path="/profile" component={Profile} />
        <Route path="/settings" component={Settings} />
        <Route path="/explore" component={Pathways} />
        
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
