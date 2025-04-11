import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles = ["patient", "caretaker"],
}: {
  path: string;
  component: () => React.JSX.Element;
  allowedRoles?: Array<"patient" | "caretaker">;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </Route>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check role if allowedRoles is specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role as "patient" | "caretaker")) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-neutral-600 text-center">
            You don't have permission to access this page.
          </p>
          {user.role === "patient" ? (
            <Redirect to="/patient/dashboard" />
          ) : (
            <Redirect to="/caretaker/dashboard" />
          )}
        </div>
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
