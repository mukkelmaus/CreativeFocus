import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Tasks from "@/pages/tasks";
import TaskHistory from "@/pages/task-history";
import Settings from "@/pages/settings";
import AuthPage from "@/pages/auth-page";
import { Layout } from "@/components/layout/layout";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={() => (
        <Layout>
          <Dashboard />
        </Layout>
      )} />
      <ProtectedRoute path="/today" component={() => (
        <Layout>
          <Tasks />
        </Layout>
      )} />
      <ProtectedRoute path="/upcoming" component={() => (
        <Layout>
          <Tasks />
        </Layout>
      )} />
      <ProtectedRoute path="/history" component={() => (
        <Layout>
          <TaskHistory />
        </Layout>
      )} />
      <ProtectedRoute path="/settings" component={() => (
        <Layout>
          <Settings />
        </Layout>
      )} />
      <ProtectedRoute path="/category/:id" component={() => (
        <Layout>
          <Tasks />
        </Layout>
      )} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
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
