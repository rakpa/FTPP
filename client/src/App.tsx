import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import Salary from "@/pages/Salary";
import IndianDashboard from "@/pages/IndianFinance/Dashboard";
import IndianExpenses from "@/pages/IndianFinance/Expenses";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Expenses} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/salary" component={Salary} />
      <Route path="/indian-finance/dashboard" component={IndianDashboard} />
      <Route path="/indian-finance/expenses" component={IndianExpenses} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
