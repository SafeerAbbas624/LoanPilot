import { Switch, Route, useLocation, useRoute } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Contacts from "@/pages/Contacts";
import LoansPage from "@/pages/LoansPage";
import Templates from "@/pages/Templates";
import Settings from "@/pages/Settings";
import { useEffect, useState } from "react";
import { apiRequest } from "./lib/queryClient";
import { GoogleDriveProvider } from "@/contexts/GoogleDriveContext";

function Router() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/user", {
          credentials: "include",
        });
        
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      setUser(null);
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Check if a loan ID route is matched
  const [, loanParams] = useRoute("/loans/:id");
  const loanId = loanParams ? parseInt(loanParams.id, 10) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login">
        {user ? <Dashboard user={user} onLogout={handleLogout} activeLoanId={loanId} currentPath={location} /> : <Login setUser={setUser} />}
      </Route>
      <Route path="/">
        {user ? <Dashboard user={user} onLogout={handleLogout} activeLoanId={loanId} currentPath={location} /> : <Login setUser={setUser} />}
      </Route>
      <Route path="/dashboard">
        {user ? <Dashboard user={user} onLogout={handleLogout} activeLoanId={loanId} currentPath={location} /> : <Login setUser={setUser} />}
      </Route>
      <Route path="/loans/:id">
        {user ? <Dashboard user={user} onLogout={handleLogout} activeLoanId={loanId} currentPath={location} /> : <Login setUser={setUser} />}
      </Route>
      <Route path="/loans">
        {user ? <LoansPage user={user} onLogout={handleLogout} /> : <Login setUser={setUser} />}
      </Route>
      <Route path="/contacts">
        {user ? <Contacts user={user} onLogout={handleLogout} /> : <Login setUser={setUser} />}
      </Route>
      <Route path="/templates">
        {user ? <Templates user={user} onLogout={handleLogout} /> : <Login setUser={setUser} />}
      </Route>
      <Route path="/settings">
        {user ? <Settings user={user} onLogout={handleLogout} /> : <Login setUser={setUser} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleDriveProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </GoogleDriveProvider>
    </QueryClientProvider>
  );
}

export default App;
