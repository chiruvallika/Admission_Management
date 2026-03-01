import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/institutions", async (_req, res) => {
    const data = await storage.getInstitutions();
    res.json(data);
  });

  app.post("/api/institutions", async (req, res) => {
    try {
      const inst = await storage.createInstitution(req.body);
      res.json(inst);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/institutions/:id", async (req, res) => {
    await storage.deleteInstitution(parseInt(req.params.id));
    res.json({ ok: true });
  });

  app.get("/api/campuses", async (_req, res) => {
    const data = await storage.getCampuses();
    res.json(data);
  });

  app.post("/api/campuses", async (req, res) => {
    try {
      const campus = await storage.createCampus(req.body);
      res.json(campus);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/campuses/:id", async (req, res) => {
    await storage.deleteCampus(parseInt(req.params.id));
    res.json({ ok: true });
  });

  app.get("/api/departments", async (_req, res) => {
    const data = await storage.getDepartments();
    res.json(data);
  });

  app.post("/api/departments", async (req, res) => {
    try {
      const dept = await storage.createDepartment(req.body);
      res.json(dept);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/departments/:id", async (req, res) => {
    await storage.deleteDepartment(parseInt(req.params.id));
    res.json({ ok: true });
  });

  app.get("/api/academic-years", async (_req, res) => {
    const data = await storage.getAcademicYears();
    res.json(data);
  });

  app.post("/api/academic-years", async (req, res) => {
    try {
      const year = await storage.createAcademicYear(req.body);
      res.json(year);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/academic-years/:id", async (req, res) => {
    await storage.deleteAcademicYear(parseInt(req.params.id));
    res.json({ ok: true });
  });

  app.get("/api/programs", async (_req, res) => {
    const data = await storage.getPrograms();
    res.json(data);
  });

  app.post("/api/programs", async (req, res) => {
    try {
      const prog = await storage.createProgram(req.body);
      res.json(prog);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/programs/:id", async (req, res) => {
    await storage.deleteProgram(parseInt(req.params.id));
    res.json({ ok: true });
  });

  app.get("/api/quotas", async (_req, res) => {
    const data = await storage.getQuotas();
    res.json(data);
  });

  app.post("/api/quotas", async (req, res) => {
    try {
      const quota = await storage.createQuota(req.body);
      res.json(quota);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/quotas/:id", async (req, res) => {
    try {
      await storage.deleteQuota(parseInt(req.params.id));
      res.json({ ok: true });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.get("/api/applicants", async (_req, res) => {
    const data = await storage.getApplicants();
    res.json(data);
  });

  app.get("/api/applicants/:id", async (req, res) => {
    const app_data = await storage.getApplicant(parseInt(req.params.id));
    if (!app_data) return res.status(404).json({ message: "Not found" });
    res.json(app_data);
  });

  app.post("/api/applicants", async (req, res) => {
    try {
      const applicant = await storage.createApplicant(req.body);
      res.json(applicant);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.post("/api/applicants/:id/allocate", async (req, res) => {
    try {
      const result = await storage.allocateSeat(parseInt(req.params.id));
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/applicants/:id/documents", async (req, res) => {
    try {
      const result = await storage.updateApplicantDocStatus(
        parseInt(req.params.id),
        req.body.documentStatus
      );
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/applicants/:id/fee", async (req, res) => {
    try {
      const result = await storage.updateApplicantFeeStatus(
        parseInt(req.params.id),
        req.body.feeStatus
      );
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.post("/api/applicants/:id/confirm", async (req, res) => {
    try {
      const result = await storage.confirmAdmission(parseInt(req.params.id));
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const allPrograms = await storage.getPrograms();
      const allQuotas = await storage.getQuotas();
      const allApplicants = await storage.getApplicants();

      const totalIntake = allPrograms.reduce((s, p) => s + p.totalIntake, 0);
      const totalAdmitted = allApplicants.filter((a) => a.admissionConfirmed).length;
      const pendingDocuments = allApplicants.filter((a) => a.documentStatus !== "Verified").length;
      const pendingFees = allApplicants.filter((a) => a.feeStatus !== "Paid").length;

      const quotaStats = allQuotas.map((q) => ({
        quotaName: q.quotaName,
        totalSeats: q.totalSeats,
        filledSeats: q.filledSeats,
        programName: allPrograms.find((p) => p.id === q.programId)?.name || "Unknown",
      }));

      const pendingDocApplicants = allApplicants.filter((a) => a.documentStatus !== "Verified");
      const pendingFeeApplicants = allApplicants.filter((a) => a.feeStatus !== "Paid");

      res.json({
        totalIntake,
        totalAdmitted,
        totalApplicants: allApplicants.length,
        pendingDocuments,
        pendingFees,
        quotaStats,
        recentApplicants: allApplicants.slice(-5),
        pendingDocApplicants,
        pendingFeeApplicants,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  return httpServer;
}
