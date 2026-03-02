import fs from "fs";
import path from "path";
import {
  type User, type InsertUser,
  type Institution, type InsertInstitution,
  type Campus, type InsertCampus,
  type Department, type InsertDepartment,
  type AcademicYear, type InsertAcademicYear,
  type Program, type InsertProgram,
  type Quota, type InsertQuota,
  type Applicant, type InsertApplicant,
} from "@shared/schema";

interface DatabaseData {
  nextId: Record<string, number>;
  users: User[];
  institutions: Institution[];
  campuses: Campus[];
  departments: Department[];
  academicYears: AcademicYear[];
  programs: Program[];
  quotas: Quota[];
  applicants: Applicant[];
}

const DATA_FILE = path.resolve(process.cwd(), "data", "db.json");

function getEmptyDb(): DatabaseData {
  return {
    nextId: {
      users: 1,
      institutions: 1,
      campuses: 1,
      departments: 1,
      academicYears: 1,
      programs: 1,
      quotas: 1,
      applicants: 1,
    },
    users: [],
    institutions: [],
    campuses: [],
    departments: [],
    academicYears: [],
    programs: [],
    quotas: [],
    applicants: [],
  };
}

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadData(): DatabaseData {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    return getEmptyDb();
  }
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw) as DatabaseData;
}

function saveData(data: DatabaseData): void {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function getNextId(data: DatabaseData, table: string): number {
  const id = data.nextId[table] || 1;
  data.nextId[table] = id + 1;
  return id;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getInstitutions(): Promise<Institution[]>;
  createInstitution(data: InsertInstitution): Promise<Institution>;
  deleteInstitution(id: number): Promise<void>;

  getCampuses(): Promise<Campus[]>;
  createCampus(data: InsertCampus): Promise<Campus>;
  deleteCampus(id: number): Promise<void>;

  getDepartments(): Promise<Department[]>;
  createDepartment(data: InsertDepartment): Promise<Department>;
  deleteDepartment(id: number): Promise<void>;

  getAcademicYears(): Promise<AcademicYear[]>;
  createAcademicYear(data: InsertAcademicYear): Promise<AcademicYear>;
  deleteAcademicYear(id: number): Promise<void>;

  getPrograms(): Promise<Program[]>;
  createProgram(data: InsertProgram): Promise<Program>;
  deleteProgram(id: number): Promise<void>;

  getQuotas(): Promise<Quota[]>;
  getQuotasByProgram(programId: number): Promise<Quota[]>;
  createQuota(data: InsertQuota): Promise<Quota>;
  deleteQuota(id: number): Promise<void>;

  getApplicants(): Promise<Applicant[]>;
  getApplicant(id: number): Promise<Applicant | undefined>;
  createApplicant(data: InsertApplicant): Promise<Applicant>;
  updateApplicantDocStatus(id: number, status: string): Promise<Applicant>;
  updateApplicantFeeStatus(id: number, status: string): Promise<Applicant>;
  allocateSeat(id: number): Promise<Applicant>;
  confirmAdmission(id: number): Promise<Applicant>;
}

export class JsonStorage implements IStorage {
  private data: DatabaseData;

  constructor() {
    this.data = loadData();
  }

  reload(): void {
    this.data = loadData();
  }

  private save(): void {
    saveData(this.data);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.data.users.find((u) => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.data.users.find((u) => u.username === username);
  }

  async createUser(input: InsertUser): Promise<User> {
    const user: User = { id: getNextId(this.data, "users"), ...input, role: input.role || "admission_officer" };
    this.data.users.push(user);
    this.save();
    return user;
  }

  async getInstitutions(): Promise<Institution[]> {
    return this.data.institutions;
  }

  async createInstitution(input: InsertInstitution): Promise<Institution> {
    const existing = this.data.institutions.find((i) => i.code === input.code);
    if (existing) throw new Error(`Institution with code "${input.code}" already exists`);
    const inst: Institution = { id: getNextId(this.data, "institutions"), ...input };
    this.data.institutions.push(inst);
    this.save();
    return inst;
  }

  async deleteInstitution(id: number): Promise<void> {
    this.data.institutions = this.data.institutions.filter((i) => i.id !== id);
    this.save();
  }

  async getCampuses(): Promise<Campus[]> {
    return this.data.campuses;
  }

  async createCampus(input: InsertCampus): Promise<Campus> {
    const campus: Campus = { id: getNextId(this.data, "campuses"), ...input };
    this.data.campuses.push(campus);
    this.save();
    return campus;
  }

  async deleteCampus(id: number): Promise<void> {
    this.data.campuses = this.data.campuses.filter((c) => c.id !== id);
    this.save();
  }

  async getDepartments(): Promise<Department[]> {
    return this.data.departments;
  }

  async createDepartment(input: InsertDepartment): Promise<Department> {
    const dept: Department = { id: getNextId(this.data, "departments"), ...input };
    this.data.departments.push(dept);
    this.save();
    return dept;
  }

  async deleteDepartment(id: number): Promise<void> {
    this.data.departments = this.data.departments.filter((d) => d.id !== id);
    this.save();
  }

  async getAcademicYears(): Promise<AcademicYear[]> {
    return this.data.academicYears;
  }

  async createAcademicYear(input: InsertAcademicYear): Promise<AcademicYear> {
    const existing = this.data.academicYears.find((y) => y.year === input.year);
    if (existing) throw new Error(`Academic year "${input.year}" already exists`);
    if (input.isCurrent) {
      this.data.academicYears.forEach((y) => (y.isCurrent = false));
    }
    const year: AcademicYear = { id: getNextId(this.data, "academicYears"), year: input.year, isCurrent: input.isCurrent ?? false };
    this.data.academicYears.push(year);
    this.save();
    return year;
  }

  async deleteAcademicYear(id: number): Promise<void> {
    this.data.academicYears = this.data.academicYears.filter((y) => y.id !== id);
    this.save();
  }

  async getPrograms(): Promise<Program[]> {
    return this.data.programs;
  }

  async createProgram(input: InsertProgram): Promise<Program> {
    const prog: Program = { id: getNextId(this.data, "programs"), ...input, entryType: input.entryType || "Regular" };
    this.data.programs.push(prog);
    this.save();
    return prog;
  }

  async deleteProgram(id: number): Promise<void> {
    this.data.programs = this.data.programs.filter((p) => p.id !== id);
    this.save();
  }

  async getQuotas(): Promise<Quota[]> {
    return this.data.quotas;
  }

  async getQuotasByProgram(programId: number): Promise<Quota[]> {
    return this.data.quotas.filter((q) => q.programId === programId);
  }

  async createQuota(input: InsertQuota): Promise<Quota> {
    if (!input.isSupernumerary) {
      const prog = this.data.programs.find((p) => p.id === input.programId);
      if (prog) {
        const existingBase = this.data.quotas
          .filter((q) => q.programId === input.programId && !q.isSupernumerary)
          .reduce((s, q) => s + q.totalSeats, 0);
        if (existingBase + input.totalSeats > prog.totalIntake) {
          throw new Error(
            `Total base quota (${existingBase + input.totalSeats}) would exceed program intake (${prog.totalIntake})`
          );
        }
      }
    }
    const quota: Quota = {
      id: getNextId(this.data, "quotas"),
      programId: input.programId,
      quotaName: input.quotaName,
      totalSeats: input.totalSeats,
      filledSeats: 0,
      isSupernumerary: input.isSupernumerary ?? false,
    };
    this.data.quotas.push(quota);
    this.save();
    return quota;
  }

  async deleteQuota(id: number): Promise<void> {
    this.data.quotas = this.data.quotas.filter((q) => q.id !== id);
    this.save();
  }

  async getApplicants(): Promise<Applicant[]> {
    return this.data.applicants;
  }

  async getApplicant(id: number): Promise<Applicant | undefined> {
    return this.data.applicants.find((a) => a.id === id);
  }

  async createApplicant(input: InsertApplicant): Promise<Applicant> {
    const prog = this.data.programs.find((p) => p.id === input.programId);
    if (!prog) throw new Error("Program not found");

    const quota = this.data.quotas.find(
      (q) => q.programId === input.programId && q.quotaName === input.quotaType
    );
    if (!quota) throw new Error(`No ${input.quotaType} quota found for this program`);

    const applicant: Applicant = {
      id: getNextId(this.data, "applicants"),
      name: input.name,
      email: input.email,
      phone: input.phone,
      dateOfBirth: input.dateOfBirth,
      gender: input.gender,
      category: input.category,
      address: input.address,
      qualifyingExam: input.qualifyingExam,
      marks: input.marks,
      entryType: input.entryType || "Regular",
      quotaType: input.quotaType,
      programId: input.programId,
      allotmentNumber: input.allotmentNumber || null,
      admissionMode: input.admissionMode,
      documentStatus: "Pending",
      feeStatus: "Pending",
      admissionNumber: null,
      seatAllocated: false,
      admissionConfirmed: false,
      createdAt: new Date().toISOString(),
    };
    this.data.applicants.push(applicant);
    this.save();
    return applicant;
  }

  async updateApplicantDocStatus(id: number, status: string): Promise<Applicant> {
    const app = this.data.applicants.find((a) => a.id === id);
    if (!app) throw new Error("Applicant not found");
    app.documentStatus = status;
    this.save();
    return app;
  }

  async updateApplicantFeeStatus(id: number, status: string): Promise<Applicant> {
    const app = this.data.applicants.find((a) => a.id === id);
    if (!app) throw new Error("Applicant not found");
    app.feeStatus = status;
    this.save();
    return app;
  }

  async allocateSeat(id: number): Promise<Applicant> {
    const applicant = this.data.applicants.find((a) => a.id === id);
    if (!applicant) throw new Error("Applicant not found");
    if (applicant.seatAllocated) throw new Error("Seat already allocated");

    const quota = this.data.quotas.find(
      (q) => q.programId === applicant.programId && q.quotaName === applicant.quotaType
    );
    if (!quota) throw new Error("Quota not found for this program");
    if (quota.filledSeats >= quota.totalSeats) {
      throw new Error("No seats available in this quota. Allocation blocked.");
    }

    quota.filledSeats += 1;
    applicant.seatAllocated = true;
    this.save();
    return applicant;
  }

  async confirmAdmission(id: number): Promise<Applicant> {
    const applicant = this.data.applicants.find((a) => a.id === id);
    if (!applicant) throw new Error("Applicant not found");
    if (!applicant.seatAllocated) throw new Error("Seat must be allocated first");
    if (applicant.feeStatus !== "Paid") throw new Error("Fee must be paid before confirmation");
    if (applicant.admissionConfirmed) throw new Error("Admission already confirmed");

    const prog = this.data.programs.find((p) => p.id === applicant.programId);
    if (!prog) throw new Error("Program not found");

    const instCode = this.data.institutions.length > 0 ? this.data.institutions[0].code : "INST";

    const existingCount = this.data.applicants.filter(
      (a) => a.admissionConfirmed && a.programId === applicant.programId
    ).length;

    const seqNum = String(existingCount + 1).padStart(4, "0");
    const admissionNumber = `${instCode}/2026/${prog.courseType}/${prog.code}/${applicant.quotaType}/${seqNum}`;

    applicant.admissionConfirmed = true;
    applicant.admissionNumber = admissionNumber;
    this.save();
    return applicant;
  }
}

export const storage = new JsonStorage();
