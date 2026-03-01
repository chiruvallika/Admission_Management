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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import type { Program, Department } from "@shared/schema";

export default function ProgramsPage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    departmentId: "",
    courseType: "",
    entryType: "Regular",
    totalIntake: "",
  });

  const { data: programs, isLoading } = useQuery<Program[]>({ queryKey: ["/api/programs"] });
  const { data: departments } = useQuery<Department[]>({ queryKey: ["/api/departments"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/programs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      setOpen(false);
      setForm({ name: "", code: "", departmentId: "", courseType: "", entryType: "Regular", totalIntake: "" });
      toast({ title: "Program created successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/programs/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      toast({ title: "Program deleted" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code || !form.departmentId || !form.courseType || !form.totalIntake) return;
    createMutation.mutate({
      name: form.name,
      code: form.code,
      departmentId: parseInt(form.departmentId),
      courseType: form.courseType,
      entryType: form.entryType,
      totalIntake: parseInt(form.totalIntake),
    });
  };

  const getDeptName = (id: number) => departments?.find((d) => d.id === id)?.name || "Unknown";

  if (isLoading) {
    return (
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          <div><h1 className="text-2xl font-bold">Programs</h1><p className="text-muted-foreground">Manage programs</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (<Card key={i}><CardContent className="p-5"><Skeleton className="h-20 w-full" /></CardContent></Card>))}
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
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Programs</h1>
            <p className="text-muted-foreground">Manage programs and branches</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-program"><Plus className="h-4 w-4 mr-2" />Add Program</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Program</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Computer Science" data-testid="input-program-name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Code</Label>
                    <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. CSE" data-testid="input-program-code" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={form.departmentId} onValueChange={(v) => setForm({ ...form, departmentId: v })}>
                    <SelectTrigger data-testid="select-department"><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {departments?.map((d) => (<SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Course Type</Label>
                    <Select value={form.courseType} onValueChange={(v) => setForm({ ...form, courseType: v })}>
                      <SelectTrigger data-testid="select-course-type"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UG">UG</SelectItem>
                        <SelectItem value="PG">PG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Entry Type</Label>
                    <Select value={form.entryType} onValueChange={(v) => setForm({ ...form, entryType: v })}>
                      <SelectTrigger data-testid="select-entry-type"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Regular">Regular</SelectItem>
                        <SelectItem value="Lateral">Lateral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Total Intake</Label>
                  <Input type="number" value={form.totalIntake} onChange={(e) => setForm({ ...form, totalIntake: e.target.value })} placeholder="e.g. 100" data-testid="input-total-intake" />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-program">
                  {createMutation.isPending ? "Creating..." : "Create Program"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {programs && programs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.map((prog) => (
              <Card key={prog.id} data-testid={`card-program-${prog.id}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="rounded-md p-2 bg-muted text-primary flex-shrink-0 mt-0.5">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="font-medium truncate">{prog.name}</p>
                        <p className="text-sm text-muted-foreground">{getDeptName(prog.departmentId)}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary">{prog.code}</Badge>
                          <Badge variant="secondary">{prog.courseType}</Badge>
                          <Badge variant="secondary">{prog.entryType}</Badge>
                          <Badge variant="outline">Intake: {prog.totalIntake}</Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(prog.id)} data-testid={`button-delete-program-${prog.id}`}>
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
              <GraduationCap className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-medium mb-1">No programs yet</h3>
              <p className="text-sm text-muted-foreground">Add your first program to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
