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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin, Plus, Trash2 } from "lucide-react";
import type { Campus, Institution } from "@shared/schema";

export default function CampusesPage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [institutionId, setInstitutionId] = useState("");

  const { data: campuses, isLoading } = useQuery<Campus[]>({
    queryKey: ["/api/campuses"],
  });

  const { data: institutions } = useQuery<Institution[]>({
    queryKey: ["/api/institutions"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; institutionId: number }) => {
      const res = await apiRequest("POST", "/api/campuses", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campuses"] });
      setOpen(false);
      setName("");
      setInstitutionId("");
      toast({ title: "Campus created successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/campuses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campuses"] });
      toast({ title: "Campus deleted" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !institutionId) return;
    createMutation.mutate({ name, institutionId: parseInt(institutionId) });
  };

  const getInstitutionName = (id: number) =>
    institutions?.find((i) => i.id === id)?.name || "Unknown";

  if (isLoading) {
    return (
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          <div><h1 className="text-2xl font-bold">Campuses</h1><p className="text-muted-foreground">Manage campuses</p></div>
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
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Campuses</h1>
            <p className="text-muted-foreground">Manage campuses</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-campus"><Plus className="h-4 w-4 mr-2" />Add Campus</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Campus</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Main Campus" data-testid="input-campus-name" />
                </div>
                <div className="space-y-2">
                  <Label>Institution</Label>
                  <Select value={institutionId} onValueChange={setInstitutionId}>
                    <SelectTrigger data-testid="select-institution"><SelectValue placeholder="Select institution" /></SelectTrigger>
                    <SelectContent>
                      {institutions?.map((inst) => (
                        <SelectItem key={inst.id} value={String(inst.id)}>{inst.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-campus">
                  {createMutation.isPending ? "Creating..." : "Create Campus"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {campuses && campuses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campuses.map((campus) => (
              <Card key={campus.id} data-testid={`card-campus-${campus.id}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="rounded-md p-2 bg-muted text-primary flex-shrink-0"><MapPin className="h-4 w-4" /></div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{campus.name}</p>
                        <p className="text-sm text-muted-foreground">{getInstitutionName(campus.institutionId)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(campus.id)} data-testid={`button-delete-campus-${campus.id}`}>
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
              <MapPin className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-medium mb-1">No campuses yet</h3>
              <p className="text-sm text-muted-foreground">Add your first campus to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
