import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Plus, Trash2 } from "lucide-react";
import type { AcademicYear } from "@shared/schema";

export default function AcademicYearsPage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);

  const { data: years, isLoading } = useQuery<AcademicYear[]>({ queryKey: ["/api/academic-years"] });

  const createMutation = useMutation({
    mutationFn: async (data: { year: string; isCurrent: boolean }) => {
      const res = await apiRequest("POST", "/api/academic-years", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/academic-years"] });
      setOpen(false); setYear(""); setIsCurrent(false);
      toast({ title: "Academic year created successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/academic-years/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/academic-years"] });
      toast({ title: "Academic year deleted" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!year.trim()) return;
    createMutation.mutate({ year, isCurrent });
  };

  if (isLoading) {
    return (
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          <div><h1 className="text-2xl font-bold">Academic Years</h1><p className="text-muted-foreground">Manage academic years</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2].map((i) => (<Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>))}
          </div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Academic Years</h1>
            <p className="text-muted-foreground">Manage academic years</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-year"><Plus className="h-4 w-4 mr-2" />Add Year</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Academic Year</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 2025-2026" data-testid="input-year" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="isCurrent" checked={isCurrent} onCheckedChange={setIsCurrent} data-testid="switch-current" />
                  <Label htmlFor="isCurrent">Set as current year</Label>
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-year">
                  {createMutation.isPending ? "Creating..." : "Create Academic Year"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {years && years.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {years.map((ay) => (
              <Card key={ay.id} data-testid={`card-year-${ay.id}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="rounded-md p-2 bg-muted text-primary flex-shrink-0"><Calendar className="h-4 w-4" /></div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{ay.year}</p>
                        {ay.isCurrent && <Badge variant="default" className="mt-1">Current</Badge>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(ay.id)} data-testid={`button-delete-year-${ay.id}`}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-medium mb-1">No academic years yet</h3>
              <p className="text-sm text-muted-foreground">Add your first academic year to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
