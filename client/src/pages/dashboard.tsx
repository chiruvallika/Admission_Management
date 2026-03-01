import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  GraduationCap,
  AlertCircle,
  DollarSign,
  FileText,
  TrendingUp,
} from "lucide-react";
import type { Applicant, Program, Quota } from "@shared/schema";

interface DashboardStats {
  totalIntake: number;
  totalAdmitted: number;
  totalApplicants: number;
  pendingDocuments: number;
  pendingFees: number;
  quotaStats: Array<{
    quotaName: string;
    totalSeats: number;
    filledSeats: number;
    programName: string;
  }>;
  recentApplicants: Applicant[];
  pendingDocApplicants: Applicant[];
  pendingFeeApplicants: Applicant[];
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const variantClasses = {
    default: "text-primary",
    success: "text-chart-2",
    warning: "text-chart-3",
    danger: "text-destructive",
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={`rounded-md p-2 bg-muted ${variantClasses[variant]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Admission overview and statistics</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-5">
                <Skeleton className="h-4 w-32 mb-4" />
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full mb-2" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    );
  }

  const fillRate = stats && stats.totalIntake > 0
    ? Math.round((stats.totalAdmitted / stats.totalIntake) * 100)
    : 0;

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">Dashboard</h1>
          <p className="text-muted-foreground">Admission overview and statistics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Intake"
            value={stats?.totalIntake ?? 0}
            subtitle="Across all programs"
            icon={GraduationCap}
          />
          <StatCard
            title="Total Admitted"
            value={stats?.totalAdmitted ?? 0}
            subtitle={`${fillRate}% fill rate`}
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            title="Pending Documents"
            value={stats?.pendingDocuments ?? 0}
            subtitle="Awaiting verification"
            icon={FileText}
            variant="warning"
          />
          <StatCard
            title="Pending Fees"
            value={stats?.pendingFees ?? 0}
            subtitle="Awaiting payment"
            icon={DollarSign}
            variant="danger"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quota-wise Seat Status</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.quotaStats && stats.quotaStats.length > 0 ? (
                <div className="space-y-4">
                  {stats.quotaStats.map((q, i) => (
                    <div key={i} className="space-y-1.5" data-testid={`quota-stat-${i}`}>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="font-medium truncate">{q.programName} - {q.quotaName}</span>
                        <span className="text-muted-foreground whitespace-nowrap">
                          {q.filledSeats}/{q.totalSeats}
                        </span>
                      </div>
                      <Progress
                        value={q.totalSeats > 0 ? (q.filledSeats / q.totalSeats) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <GraduationCap className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No quota data available</p>
                  <p className="text-xs">Set up programs and quotas first</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pending Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.pendingDocApplicants && stats.pendingDocApplicants.length > 0 ? (
                <div className="space-y-3">
                  {stats.pendingDocApplicants.slice(0, 5).map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-2" data-testid={`pending-doc-${a.id}`}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{a.name}</p>
                        <p className="text-xs text-muted-foreground">{a.email}</p>
                      </div>
                      <Badge variant="secondary">{a.documentStatus}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No pending documents</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Fee Pending List</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.pendingFeeApplicants && stats.pendingFeeApplicants.length > 0 ? (
              <div className="space-y-3">
                {stats.pendingFeeApplicants.slice(0, 8).map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-2" data-testid={`pending-fee-${a.id}`}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.quotaType} | {a.admissionMode}</p>
                    </div>
                    <Badge variant="destructive">Fee Pending</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <DollarSign className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No pending fees</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
