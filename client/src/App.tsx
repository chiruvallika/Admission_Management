import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import InstitutionsPage from "@/pages/institutions";
import CampusesPage from "@/pages/campuses";
import DepartmentsPage from "@/pages/departments";
import ProgramsPage from "@/pages/programs";
import AcademicYearsPage from "@/pages/academic-years";
import SeatMatrixPage from "@/pages/seat-matrix";
import ApplicantsPage from "@/pages/applicants";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/institutions" component={InstitutionsPage} />
      <Route path="/campuses" component={CampusesPage} />
      <Route path="/departments" component={DepartmentsPage} />
      <Route path="/programs" component={ProgramsPage} />
      <Route path="/academic-years" component={AcademicYearsPage} />
      <Route path="/seat-matrix" component={SeatMatrixPage} />
      <Route path="/applicants" component={ApplicantsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 min-w-0">
              <header className="flex items-center gap-2 p-2 border-b">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <h1 className="text-sm font-medium text-muted-foreground">Admission Management System</h1>
              </header>
              <main className="flex-1 overflow-hidden">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
