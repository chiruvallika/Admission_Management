import { db } from "./db";
import { institutions, campuses, departments, programs, quotas, academicYears, applicants } from "@shared/schema";

export async function seedDatabase() {
  const existingInstitutions = await db.select().from(institutions);
  if (existingInstitutions.length > 0) return;

  const [inst] = await db.insert(institutions).values({
    name: "Reva University",
    code: "REVA",
  }).returning();

  const [campus] = await db.insert(campuses).values({
    name: "Main Campus - Bangalore",
    institutionId: inst.id,
  }).returning();

  const [csDept] = await db.insert(departments).values({
    name: "Computer Science & Engineering",
    campusId: campus.id,
  }).returning();

  const [eceDept] = await db.insert(departments).values({
    name: "Electronics & Communication",
    campusId: campus.id,
  }).returning();

  const [mechDept] = await db.insert(departments).values({
    name: "Mechanical Engineering",
    campusId: campus.id,
  }).returning();

  await db.insert(academicYears).values([
    { year: "2025-2026", isCurrent: false },
    { year: "2026-2027", isCurrent: true },
  ]);

  const [cseProg] = await db.insert(programs).values({
    name: "Computer Science & Engineering",
    code: "CSE",
    departmentId: csDept.id,
    courseType: "UG",
    entryType: "Regular",
    totalIntake: 120,
  }).returning();

  const [eceProg] = await db.insert(programs).values({
    name: "Electronics & Communication",
    code: "ECE",
    departmentId: eceDept.id,
    courseType: "UG",
    entryType: "Regular",
    totalIntake: 60,
  }).returning();

  const [mechProg] = await db.insert(programs).values({
    name: "Mechanical Engineering",
    code: "MECH",
    departmentId: mechDept.id,
    courseType: "UG",
    entryType: "Regular",
    totalIntake: 60,
  }).returning();

  await db.insert(quotas).values([
    { programId: cseProg.id, quotaName: "KCET", totalSeats: 48, filledSeats: 12 },
    { programId: cseProg.id, quotaName: "COMEDK", totalSeats: 36, filledSeats: 8 },
    { programId: cseProg.id, quotaName: "Management", totalSeats: 36, filledSeats: 5 },
    { programId: eceProg.id, quotaName: "KCET", totalSeats: 24, filledSeats: 6 },
    { programId: eceProg.id, quotaName: "COMEDK", totalSeats: 18, filledSeats: 3 },
    { programId: eceProg.id, quotaName: "Management", totalSeats: 18, filledSeats: 2 },
    { programId: mechProg.id, quotaName: "KCET", totalSeats: 24, filledSeats: 4 },
    { programId: mechProg.id, quotaName: "COMEDK", totalSeats: 18, filledSeats: 2 },
    { programId: mechProg.id, quotaName: "Management", totalSeats: 18, filledSeats: 1 },
  ]);

  await db.insert(applicants).values([
    {
      name: "Arjun Sharma", email: "arjun.sharma@email.com", phone: "9876543210",
      dateOfBirth: "2005-03-15", gender: "Male", category: "GM", address: "42 MG Road, Bangalore",
      qualifyingExam: "KCET", marks: 178, entryType: "Regular", quotaType: "KCET",
      programId: cseProg.id, allotmentNumber: "KCET-2026-4521", admissionMode: "Government",
      documentStatus: "Verified", feeStatus: "Paid", seatAllocated: true,
      admissionConfirmed: true, admissionNumber: "REVA/2026/UG/CSE/KCET/0001",
    },
    {
      name: "Priya Nair", email: "priya.nair@email.com", phone: "9876543211",
      dateOfBirth: "2005-07-22", gender: "Female", category: "OBC", address: "15 Jayanagar, Bangalore",
      qualifyingExam: "COMEDK", marks: 165, entryType: "Regular", quotaType: "COMEDK",
      programId: cseProg.id, allotmentNumber: null, admissionMode: "Management",
      documentStatus: "Submitted", feeStatus: "Pending", seatAllocated: true,
      admissionConfirmed: false, admissionNumber: null,
    },
    {
      name: "Rahul Verma", email: "rahul.verma@email.com", phone: "9876543212",
      dateOfBirth: "2004-11-08", gender: "Male", category: "SC", address: "78 HSR Layout, Bangalore",
      qualifyingExam: "KCET", marks: 152, entryType: "Regular", quotaType: "KCET",
      programId: eceProg.id, allotmentNumber: "KCET-2026-7832", admissionMode: "Government",
      documentStatus: "Pending", feeStatus: "Pending", seatAllocated: false,
      admissionConfirmed: false, admissionNumber: null,
    },
    {
      name: "Sneha Reddy", email: "sneha.reddy@email.com", phone: "9876543213",
      dateOfBirth: "2005-01-30", gender: "Female", category: "GM", address: "23 Koramangala, Bangalore",
      qualifyingExam: "COMEDK", marks: 189, entryType: "Regular", quotaType: "COMEDK",
      programId: cseProg.id, allotmentNumber: null, admissionMode: "Management",
      documentStatus: "Verified", feeStatus: "Paid", seatAllocated: true,
      admissionConfirmed: true, admissionNumber: "REVA/2026/UG/CSE/COMEDK/0001",
    },
    {
      name: "Mohammed Irfan", email: "mohammed.irfan@email.com", phone: "9876543214",
      dateOfBirth: "2005-05-12", gender: "Male", category: "GM", address: "56 Whitefield, Bangalore",
      qualifyingExam: "KCET", marks: 145, entryType: "Regular", quotaType: "Management",
      programId: mechProg.id, allotmentNumber: null, admissionMode: "Management",
      documentStatus: "Pending", feeStatus: "Pending", seatAllocated: false,
      admissionConfirmed: false, admissionNumber: null,
    },
  ]);

  console.log("Database seeded successfully");
}
