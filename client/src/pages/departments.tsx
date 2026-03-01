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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import type { Department, Campus } from "@shared/schema";

export default function DepartmentsPage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [campusId, setCampusId] = useState("");

  const { data: departments, isLoading } = useQuery<Department[]>({ queryKey: ["/api/departments"] });
  const { data: campuses } = useQuery<Campus[]>({ queryKey: ["/api/campuses"] });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; campusId: number }) => {
      const res = await apiRequest("POST", "/api/departments", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      setOpen(false); setName(""); setCampusId("");
      toast({ title: "Department created successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/departments/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      toast({ title: "Department deleted" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !campusId) return;
    createMutation.mutate({ name, campusId: parseInt(campusId) });
  };

  const getCampusName = (id: number) => campuses?.find((c) => c.id === id)?.name || "Unknown";

  if (isLoading) {
    return (
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          <div><h1 className="text-2xl font-bold">Departments</h1><p className="text-muted-foreground">Manage departments</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (<Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>))}
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
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Departments</h1>
            <p className="text-muted-foreground">Manage departments</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-department"><Plus className="h-4 w-4 mr-2" />Add Department</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Department</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Computer Science" data-testid="input-department-name" />
                </div>
                <div className="space-y-2">
                  <Label>Campus</Label>
                  <Select value={campusId} onValueChange={setCampusId}>
                    <SelectTrigger data-testid="select-campus"><SelectValue placeholder="Select campus" /></SelectTrigger>
                    <SelectContent>
                      {campuses?.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-department">
                  {createMutation.isPending ? "Creating..." : "Create Department"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {departments && departments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <Card key={dept.id} data-testid={`card-department-${dept.id}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="rounded-md p-2 bg-muted text-primary flex-shrink-0"><BookOpen className="h-4 w-4" /></div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{dept.name}</p>
                        <p className="text-sm text-muted-foreground">{getCampusName(dept.campusId)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(dept.id)} data-testid={`button-delete-department-${dept.id}`}>
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
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-medium mb-1">No departments yet</h3>
              <p className="text-sm text-muted-foreground">Add your first department to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
