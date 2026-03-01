import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Grid3X3, Plus, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Program, Quota } from "@shared/schema";

export default function SeatMatrixPage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    programId: "",
    quotaName: "",
    totalSeats: "",
    isSupernumerary: false,
  });

  const { data: programs } = useQuery<Program[]>({ queryKey: ["/api/programs"] });
  const { data: quotas, isLoading } = useQuery<Quota[]>({ queryKey: ["/api/quotas"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/quotas", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotas"] });
      setOpen(false);
      setForm({ programId: "", quotaName: "", totalSeats: "", isSupernumerary: false });
      toast({ title: "Quota created successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/quotas/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotas"] });
      toast({ title: "Quota deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.programId || !form.quotaName || !form.totalSeats) return;
    createMutation.mutate({
      programId: parseInt(form.programId),
      quotaName: form.quotaName,
      totalSeats: parseInt(form.totalSeats),
      isSupernumerary: form.isSupernumerary,
    });
  };

  const getProgramName = (id: number) => programs?.find((p) => p.id === id)?.name || "Unknown";
  const getProgramIntake = (id: number) => programs?.find((p) => p.id === id)?.totalIntake || 0;

  const groupedByProgram: Record<number, Quota[]> = {};
  quotas?.forEach((q) => {
    if (!groupedByProgram[q.programId]) groupedByProgram[q.programId] = [];
    groupedByProgram[q.programId].push(q);
  });

  if (isLoading) {
    return (
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          <div><h1 className="text-2xl font-bold">Seat Matrix</h1><p className="text-muted-foreground">Configure quotas and seat allocation</p></div>
          {[1, 2].map((i) => (
            <Card key={i}><CardContent className="p-5"><Skeleton className="h-32 w-full" /></CardContent></Card>
          ))}
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Seat Matrix</h1>
            <p className="text-muted-foreground">Configure quotas and seat allocation</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-quota"><Plus className="h-4 w-4 mr-2" />Add Quota</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Quota</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Program</Label>
                  <Select value={form.programId} onValueChange={(v) => setForm({ ...form, programId: v })}>
                    <SelectTrigger data-testid="select-program"><SelectValue placeholder="Select program" /></SelectTrigger>
                    <SelectContent>
                      {programs?.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.code}) - Intake: {p.totalIntake}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quota Name</Label>
                  <Select value={form.quotaName} onValueChange={(v) => setForm({ ...form, quotaName: v })}>
                    <SelectTrigger data-testid="select-quota-name"><SelectValue placeholder="Select quota type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KCET">KCET</SelectItem>
                      <SelectItem value="COMEDK">COMEDK</SelectItem>
                      <SelectItem value="Management">Management</SelectItem>
                      <SelectItem value="JK">J&K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Total Seats</Label>
                  <Input type="number" value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: e.target.value })} placeholder="e.g. 40" data-testid="input-total-seats" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.isSupernumerary} onCheckedChange={(v) => setForm({ ...form, isSupernumerary: v })} data-testid="switch-supernumerary" />
                  <Label>Supernumerary (outside intake count)</Label>
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-quota">
                  {createMutation.isPending ? "Creating..." : "Create Quota"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {Object.keys(groupedByProgram).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(groupedByProgram).map(([progId, pQuotas]) => {
              const intake = getProgramIntake(parseInt(progId));
              const baseQuotaTotal = pQuotas.filter((q) => !q.isSupernumerary).reduce((s, q) => s + q.totalSeats, 0);
              const totalFilled = pQuotas.reduce((s, q) => s + q.filledSeats, 0);
              const mismatch = baseQuotaTotal !== intake;

              return (
                <Card key={progId} data-testid={`card-program-quota-${progId}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <CardTitle className="text-base">{getProgramName(parseInt(progId))}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">Intake: {intake}</Badge>
                        <Badge variant="secondary">Allocated: {baseQuotaTotal}</Badge>
                        <Badge variant={totalFilled > 0 ? "default" : "secondary"}>Filled: {totalFilled}</Badge>
                      </div>
                    </div>
                    {mismatch && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Base quota total ({baseQuotaTotal}) does not match intake ({intake}).
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pQuotas.map((q) => {
                        const fillPct = q.totalSeats > 0 ? (q.filledSeats / q.totalSeats) * 100 : 0;
                        const remaining = q.totalSeats - q.filledSeats;
                        return (
                          <div key={q.id} className="flex items-center gap-4" data-testid={`quota-row-${q.id}`}>
                            <div className="w-28 flex-shrink-0">
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-medium">{q.quotaName}</span>
                                {q.isSupernumerary && <Badge variant="outline" className="text-xs">SN</Badge>}
                              </div>
                            </div>
                            <div className="flex-1 space-y-1">
                              <Progress value={fillPct} className="h-2" />
                              <div className="flex items-center justify-between gap-1 text-xs text-muted-foreground">
                                <span>{q.filledSeats}/{q.totalSeats} filled</span>
                                <span className={remaining === 0 ? "text-destructive font-medium" : ""}>
                                  {remaining === 0 ? "FULL" : `${remaining} remaining`}
                                </span>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(q.id)} data-testid={`button-delete-quota-${q.id}`}>
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Grid3X3 className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-medium mb-1">No quotas configured</h3>
              <p className="text-sm text-muted-foreground">Create programs first, then configure quotas</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
