import { z } from "zod";

export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
}

export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  role: z.string().default("admission_officer"),
});
export type InsertUser = z.infer<typeof insertUserSchema>;

export interface Institution {
  id: number;
  name: string;
  code: string;
}

export const insertInstitutionSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
});
export type InsertInstitution = z.infer<typeof insertInstitutionSchema>;

export interface Campus {
  id: number;
  name: string;
  institutionId: number;
}

export const insertCampusSchema = z.object({
  name: z.string().min(1),
  institutionId: z.number(),
});
export type InsertCampus = z.infer<typeof insertCampusSchema>;

export interface Department {
  id: number;
  name: string;
  campusId: number;
}

export const insertDepartmentSchema = z.object({
  name: z.string().min(1),
  campusId: z.number(),
});
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export interface AcademicYear {
  id: number;
  year: string;
  isCurrent: boolean;
}

export const insertAcademicYearSchema = z.object({
  year: z.string().min(1),
  isCurrent: z.boolean().default(false),
});
export type InsertAcademicYear = z.infer<typeof insertAcademicYearSchema>;

export interface Program {
  id: number;
  name: string;
  code: string;
  departmentId: number;
  courseType: string;
  entryType: string;
  totalIntake: number;
}

export const insertProgramSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  departmentId: z.number(),
  courseType: z.string().min(1),
  entryType: z.string().default("Regular"),
  totalIntake: z.number().min(1),
});
export type InsertProgram = z.infer<typeof insertProgramSchema>;

export interface Quota {
  id: number;
  programId: number;
  quotaName: string;
  totalSeats: number;
  filledSeats: number;
  isSupernumerary: boolean;
}

export const insertQuotaSchema = z.object({
  programId: z.number(),
  quotaName: z.string().min(1),
  totalSeats: z.number().min(1),
  isSupernumerary: z.boolean().default(false),
});
export type InsertQuota = z.infer<typeof insertQuotaSchema>;

export interface Applicant {
  id: number;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  category: string;
  address: string;
  qualifyingExam: string;
  marks: number;
  entryType: string;
  quotaType: string;
  programId: number;
  allotmentNumber: string | null;
  admissionMode: string;
  documentStatus: string;
  feeStatus: string;
  admissionNumber: string | null;
  seatAllocated: boolean;
  admissionConfirmed: boolean;
  createdAt: string;
}

export const insertApplicantSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  dateOfBirth: z.string().min(1),
  gender: z.string().min(1),
  category: z.string().min(1),
  address: z.string().min(1),
  qualifyingExam: z.string().min(1),
  marks: z.number(),
  entryType: z.string().default("Regular"),
  quotaType: z.string().min(1),
  programId: z.number(),
  allotmentNumber: z.string().nullable().optional(),
  admissionMode: z.string().min(1),
});
export type InsertApplicant = z.infer<typeof insertApplicantSchema>;
