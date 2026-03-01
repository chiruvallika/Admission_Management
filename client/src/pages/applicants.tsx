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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Plus, CheckCircle, XCircle, FileText, DollarSign, Lock, Unlock } from "lucide-react";
import type { Applicant, Program, Quota } from "@shared/schema";

function StatusBadge({ status, type }: { status: string; type: "doc" | "fee" }) {
  if (status === "Paid" || status === "Verified") return <Badge variant="default">{status}</Badge>;
  if (status === "Submitted") return <Badge variant="secondary">{status}</Badge>;
  return <Badge variant="destructive">{status}</Badge>;
}

export default function ApplicantsPage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", dateOfBirth: "", gender: "",
    category: "", address: "", qualifyingExam: "", marks: "",
    entryType: "Regular", quotaType: "", programId: "",
    allotmentNumber: "", admissionMode: "",
  });

  const { data: applicants, isLoading } = useQuery<Applicant[]>({ queryKey: ["/api/applicants"] });
  const { data: programs } = useQuery<Program[]>({ queryKey: ["/api/programs"] });
  const { data: quotas } = useQuery<Quota[]>({ queryKey: ["/api/quotas"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/applicants", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applicants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setOpen(false);
      setForm({
        name: "", email: "", phone: "", dateOfBirth: "", gender: "",
        category: "", address: "", qualifyingExam: "", marks: "",
        entryType: "Regular", quotaType: "", programId: "",
        allotmentNumber: "", admissionMode: "",
      });
      toast({ title: "Applicant created successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const allocateMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/applicants/${id}/allocate`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applicants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Seat allocated successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Allocation failed", description: err.message, variant: "destructive" });
    },
  });

  const updateDocMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/applicants/${id}/documents`, { documentStatus: status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applicants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Document status updated" });
    },
  });

  const updateFeeMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/applicants/${id}/fee`, { feeStatus: status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applicants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Fee status updated" });
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/applicants/${id}/confirm`);
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/applicants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Admission confirmed", description: `Admission No: ${data.admissionNumber}` });
    },
    onError: (err: Error) => {
      toast({ title: "Confirmation failed", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.programId || !form.quotaType || !form.admissionMode) return;
    createMutation.mutate({
      ...form,
      marks: parseInt(form.marks) || 0,
      programId: parseInt(form.programId),
    });
  };

  const getProgramName = (id: number) => programs?.find((p) => p.id === id)?.name || "Unknown";
  const getProgramCode = (id: number) => programs?.find((p) => p.id === id)?.code || "";

  const selectedApplicant = detailId ? applicants?.find((a) => a.id === detailId) : null;

  if (isLoading) {
    return (
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          <div><h1 className="text-2xl font-bold">Applicants</h1><p className="text-muted-foreground">Manage applicants and admissions</p></div>
          <Card><CardContent className="p-5"><Skeleton className="h-64 w-full" /></CardContent></Card>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Applicants</h1>
            <p className="text-muted-foreground">Manage applicants and admissions</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-applicant"><Plus className="h-4 w-4 mr-2" />Add Applicant</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add Applicant</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" data-testid="input-name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" data-testid="input-email" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" data-testid="input-phone" />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} data-testid="input-dob" />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                      <SelectTrigger data-testid="select-gender"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger data-testid="select-category"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GM">GM</SelectItem>
                        <SelectItem value="SC">SC</SelectItem>
                        <SelectItem value="ST">ST</SelectItem>
                        <SelectItem value="OBC">OBC</SelectItem>
                        <SelectItem value="EWS">EWS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" data-testid="input-address" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Qualifying Exam</Label>
                    <Input value={form.qualifyingExam} onChange={(e) => setForm({ ...form, qualifyingExam: e.target.value })} placeholder="e.g. KCET" data-testid="input-exam" />
                  </div>
                  <div className="space-y-2">
                    <Label>Marks</Label>
                    <Input type="number" value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} placeholder="Marks obtained" data-testid="input-marks" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Admission Mode</Label>
                    <Select value={form.admissionMode} onValueChange={(v) => setForm({ ...form, admissionMode: v })}>
                      <SelectTrigger data-testid="select-admission-mode"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Government">Government</SelectItem>
                        <SelectItem value="Management">Management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Entry Type</Label>
                    <Select value={form.entryType} onValueChange={(v) => setForm({ ...form, entryType: v })}>
                      <SelectTrigger data-testid="select-entry-type"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Regular">Regular</SelectItem>
                        <SelectItem value="Lateral">Lateral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Program</Label>
                    <Select value={form.programId} onValueChange={(v) => setForm({ ...form, programId: v })}>
                      <SelectTrigger data-testid="select-program"><SelectValue placeholder="Select program" /></SelectTrigger>
                      <SelectContent>
                        {programs?.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.code})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quota Type</Label>
                    <Select value={form.quotaType} onValueChange={(v) => setForm({ ...form, quotaType: v })}>
                      <SelectTrigger data-testid="select-quota-type"><SelectValue placeholder="Select quota" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KCET">KCET</SelectItem>
                        <SelectItem value="COMEDK">COMEDK</SelectItem>
                        <SelectItem value="Management">Management</SelectItem>
                        <SelectItem value="JK">J&K</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {form.admissionMode === "Government" && (
                  <div className="space-y-2">
                    <Label>Allotment Number</Label>
                    <Input value={form.allotmentNumber} onChange={(e) => setForm({ ...form, allotmentNumber: e.target.value })} placeholder="Government allotment number" data-testid="input-allotment" />
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-applicant">
                  {createMutation.isPending ? "Creating..." : "Create Applicant"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {selectedApplicant && (
          <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Applicant Details</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Name:</span><p className="font-medium">{selectedApplicant.name}</p></div>
                  <div><span className="text-muted-foreground">Email:</span><p className="font-medium">{selectedApplicant.email}</p></div>
                  <div><span className="text-muted-foreground">Program:</span><p className="font-medium">{getProgramName(selectedApplicant.programId)}</p></div>
                  <div><span className="text-muted-foreground">Quota:</span><p className="font-medium">{selectedApplicant.quotaType}</p></div>
                  <div><span className="text-muted-foreground">Category:</span><p className="font-medium">{selectedApplicant.category}</p></div>
                  <div><span className="text-muted-foreground">Marks:</span><p className="font-medium">{selectedApplicant.marks}</p></div>
                  <div><span className="text-muted-foreground">Mode:</span><p className="font-medium">{selectedApplicant.admissionMode}</p></div>
                  {selectedApplicant.allotmentNumber && (
                    <div><span className="text-muted-foreground">Allotment #:</span><p className="font-medium">{selectedApplicant.allotmentNumber}</p></div>
                  )}
                  {selectedApplicant.admissionNumber && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Admission Number:</span>
                      <p className="font-bold text-primary" data-testid="text-admission-number">{selectedApplicant.admissionNumber}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3 border-t pt-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm">Seat Allocated</span>
                    {selectedApplicant.seatAllocated ? (
                      <Badge variant="default"><Lock className="h-3 w-3 mr-1" />Locked</Badge>
                    ) : (
                      <Button size="sm" onClick={() => allocateMutation.mutate(selectedApplicant.id)} disabled={allocateMutation.isPending} data-testid="button-allocate-seat">
                        <Unlock className="h-3 w-3 mr-1" />Allocate Seat
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm">Documents</span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={selectedApplicant.documentStatus} type="doc" />
                      {selectedApplicant.documentStatus !== "Verified" && (
                        <Select onValueChange={(v) => updateDocMutation.mutate({ id: selectedApplicant.id, status: v })}>
                          <SelectTrigger className="w-32" data-testid="select-doc-status"><SelectValue placeholder="Update" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Submitted">Submitted</SelectItem>
                            <SelectItem value="Verified">Verified</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm">Fee Status</span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={selectedApplicant.feeStatus} type="fee" />
                      {selectedApplicant.feeStatus !== "Paid" && (
                        <Select onValueChange={(v) => updateFeeMutation.mutate({ id: selectedApplicant.id, status: v })}>
                          <SelectTrigger className="w-32" data-testid="select-fee-status"><SelectValue placeholder="Update" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                  {selectedApplicant.seatAllocated && selectedApplicant.feeStatus === "Paid" && !selectedApplicant.admissionConfirmed && (
                    <Button className="w-full" onClick={() => confirmMutation.mutate(selectedApplicant.id)} disabled={confirmMutation.isPending} data-testid="button-confirm-admission">
                      <CheckCircle className="h-4 w-4 mr-2" />Confirm Admission
                    </Button>
                  )}
                  {selectedApplicant.admissionConfirmed && (
                    <div className="flex items-center gap-2 p-3 rounded-md bg-muted text-sm">
                      <CheckCircle className="h-4 w-4 text-chart-2" />
                      <span>Admission confirmed</span>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {applicants && applicants.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Quota</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Seat</TableHead>
                    <TableHead>Docs</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicants.map((app) => (
                    <TableRow
                      key={app.id}
                      className="cursor-pointer"
                      onClick={() => setDetailId(app.id)}
                      data-testid={`row-applicant-${app.id}`}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{app.name}</p>
                          <p className="text-xs text-muted-foreground">{app.email}</p>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{getProgramCode(app.programId)}</Badge></TableCell>
                      <TableCell className="text-sm">{app.quotaType}</TableCell>
                      <TableCell className="text-sm">{app.admissionMode}</TableCell>
                      <TableCell>
                        {app.seatAllocated ? (
                          <Badge variant="default"><Lock className="h-3 w-3" /></Badge>
                        ) : (
                          <Badge variant="secondary"><Unlock className="h-3 w-3" /></Badge>
                        )}
                      </TableCell>
                      <TableCell><StatusBadge status={app.documentStatus} type="doc" /></TableCell>
                      <TableCell><StatusBadge status={app.feeStatus} type="fee" /></TableCell>
                      <TableCell>
                        {app.admissionConfirmed ? (
                          <Badge variant="default">Confirmed</Badge>
                        ) : app.seatAllocated ? (
                          <Badge variant="secondary">Allocated</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-medium mb-1">No applicants yet</h3>
              <p className="text-sm text-muted-foreground">Add your first applicant to begin the admission process</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
