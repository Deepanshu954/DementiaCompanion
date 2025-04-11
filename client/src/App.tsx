import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

import AuthPage from "@/pages/auth-page";
import PatientDashboard from "@/pages/patient-dashboard";
import CaretakerDashboard from "@/pages/caretaker-dashboard";
import FindCaretakers from "@/pages/find-caretakers";
import Medications from "@/pages/medications";
import Tasks from "@/pages/tasks";
import NotFound from "@/pages/not-found";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth">
        <AuthPage />
      </Route>
      
      <ProtectedRoute 
        path="/patient/dashboard" 
        component={() => (
          <AppLayout>
            <PatientDashboard />
          </AppLayout>
        )}
        allowedRoles={["patient"]}
      />
      
      <ProtectedRoute 
        path="/caretaker/dashboard" 
        component={() => (
          <AppLayout>
            <CaretakerDashboard />
          </AppLayout>
        )}
        allowedRoles={["caretaker"]}
      />
      
      <ProtectedRoute 
        path="/find-caretakers" 
        component={() => (
          <AppLayout>
            <FindCaretakers />
          </AppLayout>
        )}
        allowedRoles={["patient"]}
      />
      
      <ProtectedRoute 
        path="/medications" 
        component={() => (
          <AppLayout>
            <Medications />
          </AppLayout>
        )}
        allowedRoles={["patient"]}
      />
      
      <ProtectedRoute 
        path="/tasks" 
        component={() => (
          <AppLayout>
            <Tasks />
          </AppLayout>
        )}
        allowedRoles={["patient"]}
      />
      
      <ProtectedRoute 
        path="/caretaker/medications" 
        component={() => (
          <AppLayout>
            <Medications />
          </AppLayout>
        )}
        allowedRoles={["caretaker"]}
      />
      
      <ProtectedRoute 
        path="/caretaker/tasks" 
        component={() => (
          <AppLayout>
            <Tasks />
          </AppLayout>
        )}
        allowedRoles={["caretaker"]}
      />
      
      <Route path="/">
        <Route>
          <AuthPage />
        </Route>
      </Route>
      
      <Route component={() => (
        <AppLayout>
          <NotFound />
        </AppLayout>
      )} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
