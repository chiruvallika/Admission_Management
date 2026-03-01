import {
  type User, type InsertUser,
  type Institution, type InsertInstitution,
  type Campus, type InsertCampus,
  type Department, type InsertDepartment,
  type AcademicYear, type InsertAcademicYear,
  type Program, type InsertProgram,
  type Quota, type InsertQuota,
  type Applicant, type InsertApplicant,
  users, institutions, campuses, departments,
  academicYears, programs, quotas, applicants,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

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
  incrementQuotaFilled(programId: number, quotaName: string): Promise<boolean>;

  getApplicants(): Promise<Applicant[]>;
  getApplicant(id: number): Promise<Applicant | undefined>;
  createApplicant(data: InsertApplicant): Promise<Applicant>;
  updateApplicantDocStatus(id: number, status: string): Promise<Applicant>;
  updateApplicantFeeStatus(id: number, status: string): Promise<Applicant>;
  allocateSeat(id: number): Promise<Applicant>;
  confirmAdmission(id: number): Promise<Applicant>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async getInstitutions(): Promise<Institution[]> {
    return db.select().from(institutions);
  }

  async createInstitution(data: InsertInstitution): Promise<Institution> {
    const [inst] = await db.insert(institutions).values(data).returning();
    return inst;
  }

  async deleteInstitution(id: number): Promise<void> {
    await db.delete(institutions).where(eq(institutions.id, id));
  }

  async getCampuses(): Promise<Campus[]> {
    return db.select().from(campuses);
  }

  async createCampus(data: InsertCampus): Promise<Campus> {
    const [campus] = await db.insert(campuses).values(data).returning();
    return campus;
  }

  async deleteCampus(id: number): Promise<void> {
    await db.delete(campuses).where(eq(campuses.id, id));
  }

  async getDepartments(): Promise<Department[]> {
    return db.select().from(departments);
  }

  async createDepartment(data: InsertDepartment): Promise<Department> {
    const [dept] = await db.insert(departments).values(data).returning();
    return dept;
  }

  async deleteDepartment(id: number): Promise<void> {
    await db.delete(departments).where(eq(departments.id, id));
  }

  async getAcademicYears(): Promise<AcademicYear[]> {
    return db.select().from(academicYears);
  }

  async createAcademicYear(data: InsertAcademicYear): Promise<AcademicYear> {
    if (data.isCurrent) {
      await db.update(academicYears).set({ isCurrent: false });
    }
    const [year] = await db.insert(academicYears).values(data).returning();
    return year;
  }

  async deleteAcademicYear(id: number): Promise<void> {
    await db.delete(academicYears).where(eq(academicYears.id, id));
  }

  async getPrograms(): Promise<Program[]> {
    return db.select().from(programs);
  }

  async createProgram(data: InsertProgram): Promise<Program> {
    const [prog] = await db.insert(programs).values(data).returning();
    return prog;
  }

  async deleteProgram(id: number): Promise<void> {
    await db.delete(programs).where(eq(programs.id, id));
  }

  async getQuotas(): Promise<Quota[]> {
    return db.select().from(quotas);
  }

  async getQuotasByProgram(programId: number): Promise<Quota[]> {
    return db.select().from(quotas).where(eq(quotas.programId, programId));
  }

  async createQuota(data: InsertQuota): Promise<Quota> {
    if (!data.isSupernumerary) {
      const existingQuotas = await this.getQuotasByProgram(data.programId);
      const prog = await db.select().from(programs).where(eq(programs.id, data.programId));
      if (prog.length > 0) {
        const baseTotal = existingQuotas
          .filter((q) => !q.isSupernumerary)
          .reduce((s, q) => s + q.totalSeats, 0);
        if (baseTotal + data.totalSeats > prog[0].totalIntake) {
          throw new Error(
            `Total base quota (${baseTotal + data.totalSeats}) would exceed program intake (${prog[0].totalIntake})`
          );
        }
      }
    }
    const [quota] = await db.insert(quotas).values({ ...data, filledSeats: 0 }).returning();
    return quota;
  }

  async deleteQuota(id: number): Promise<void> {
    await db.delete(quotas).where(eq(quotas.id, id));
  }

  async incrementQuotaFilled(programId: number, quotaName: string): Promise<boolean> {
    const result = await db.execute(
      sql`UPDATE quotas SET filled_seats = filled_seats + 1
          WHERE program_id = ${programId} AND quota_name = ${quotaName}
          AND filled_seats < total_seats`
    );
    return (result as any).rowCount > 0;
  }

  async getApplicants(): Promise<Applicant[]> {
    return db.select().from(applicants);
  }

  async getApplicant(id: number): Promise<Applicant | undefined> {
    const [app] = await db.select().from(applicants).where(eq(applicants.id, id));
    return app;
  }

  async createApplicant(data: InsertApplicant): Promise<Applicant> {
    const [prog] = await db.select().from(programs).where(eq(programs.id, data.programId));
    if (!prog) throw new Error("Program not found");

    const [quota] = await db
      .select()
      .from(quotas)
      .where(and(eq(quotas.programId, data.programId), eq(quotas.quotaName, data.quotaType)));
    if (!quota) throw new Error(`No ${data.quotaType} quota found for this program`);

    const [app] = await db.insert(applicants).values(data).returning();
    return app;
  }

  async updateApplicantDocStatus(id: number, status: string): Promise<Applicant> {
    const [app] = await db
      .update(applicants)
      .set({ documentStatus: status })
      .where(eq(applicants.id, id))
      .returning();
    return app;
  }

  async updateApplicantFeeStatus(id: number, status: string): Promise<Applicant> {
    const [app] = await db
      .update(applicants)
      .set({ feeStatus: status })
      .where(eq(applicants.id, id))
      .returning();
    return app;
  }

  async allocateSeat(id: number): Promise<Applicant> {
    const applicant = await this.getApplicant(id);
    if (!applicant) throw new Error("Applicant not found");
    if (applicant.seatAllocated) throw new Error("Seat already allocated");

    const success = await this.incrementQuotaFilled(applicant.programId, applicant.quotaType);
    if (!success) throw new Error("No seats available in this quota. Allocation blocked.");

    const [updated] = await db
      .update(applicants)
      .set({ seatAllocated: true })
      .where(eq(applicants.id, id))
      .returning();
    return updated;
  }

  async confirmAdmission(id: number): Promise<Applicant> {
    const applicant = await this.getApplicant(id);
    if (!applicant) throw new Error("Applicant not found");
    if (!applicant.seatAllocated) throw new Error("Seat must be allocated first");
    if (applicant.feeStatus !== "Paid") throw new Error("Fee must be paid before confirmation");
    if (applicant.admissionConfirmed) throw new Error("Admission already confirmed");

    const prog = await db.select().from(programs).where(eq(programs.id, applicant.programId));
    if (!prog.length) throw new Error("Program not found");

    const allInstitutions = await db.select().from(institutions);
    const instCode = allInstitutions.length > 0 ? allInstitutions[0].code : "INST";

    const existingAdmissions = await db
      .select()
      .from(applicants)
      .where(and(eq(applicants.admissionConfirmed, true), eq(applicants.programId, applicant.programId)));

    const seqNum = String(existingAdmissions.length + 1).padStart(4, "0");
    const admissionNumber = `${instCode}/2026/${prog[0].courseType}/${prog[0].code}/${applicant.quotaType}/${seqNum}`;

    const [updated] = await db
      .update(applicants)
      .set({ admissionConfirmed: true, admissionNumber })
      .where(eq(applicants.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
