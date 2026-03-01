import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admission_officer"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const institutions = pgTable("institutions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
});

export const insertInstitutionSchema = createInsertSchema(institutions).omit({ id: true });
export type InsertInstitution = z.infer<typeof insertInstitutionSchema>;
export type Institution = typeof institutions.$inferSelect;

export const campuses = pgTable("campuses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  institutionId: integer("institution_id").notNull(),
});

export const insertCampusSchema = createInsertSchema(campuses).omit({ id: true });
export type InsertCampus = z.infer<typeof insertCampusSchema>;
export type Campus = typeof campuses.$inferSelect;

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  campusId: integer("campus_id").notNull(),
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true });
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departments.$inferSelect;

export const academicYears = pgTable("academic_years", {
  id: serial("id").primaryKey(),
  year: text("year").notNull().unique(),
  isCurrent: boolean("is_current").notNull().default(false),
});

export const insertAcademicYearSchema = createInsertSchema(academicYears).omit({ id: true });
export type InsertAcademicYear = z.infer<typeof insertAcademicYearSchema>;
export type AcademicYear = typeof academicYears.$inferSelect;

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  departmentId: integer("department_id").notNull(),
  courseType: text("course_type").notNull(),
  entryType: text("entry_type").notNull().default("Regular"),
  totalIntake: integer("total_intake").notNull(),
});

export const insertProgramSchema = createInsertSchema(programs).omit({ id: true });
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type Program = typeof programs.$inferSelect;

export const quotas = pgTable("quotas", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").notNull(),
  quotaName: text("quota_name").notNull(),
  totalSeats: integer("total_seats").notNull(),
  filledSeats: integer("filled_seats").notNull().default(0),
  isSupernumerary: boolean("is_supernumerary").notNull().default(false),
});

export const insertQuotaSchema = createInsertSchema(quotas).omit({ id: true, filledSeats: true });
export type InsertQuota = z.infer<typeof insertQuotaSchema>;
export type Quota = typeof quotas.$inferSelect;

export const applicants = pgTable("applicants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  category: text("category").notNull(),
  address: text("address").notNull(),
  qualifyingExam: text("qualifying_exam").notNull(),
  marks: integer("marks").notNull(),
  entryType: text("entry_type").notNull().default("Regular"),
  quotaType: text("quota_type").notNull(),
  programId: integer("program_id").notNull(),
  allotmentNumber: text("allotment_number"),
  admissionMode: text("admission_mode").notNull(),
  documentStatus: text("document_status").notNull().default("Pending"),
  feeStatus: text("fee_status").notNull().default("Pending"),
  admissionNumber: text("admission_number"),
  seatAllocated: boolean("seat_allocated").notNull().default(false),
  admissionConfirmed: boolean("admission_confirmed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertApplicantSchema = createInsertSchema(applicants).omit({
  id: true,
  documentStatus: true,
  feeStatus: true,
  admissionNumber: true,
  seatAllocated: true,
  admissionConfirmed: true,
  createdAt: true,
});
export type InsertApplicant = z.infer<typeof insertApplicantSchema>;
export type Applicant = typeof applicants.$inferSelect;
