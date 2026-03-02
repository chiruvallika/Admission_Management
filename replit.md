# Admission Management & CRM System

## Overview
A web-based Admission Management system for colleges to configure programs/quotas, manage applicants, allocate seats without quota violations, generate admission numbers, and track documents/fees.

## Tech Stack
- **Frontend**: React + TypeScript, Wouter routing, TanStack Query, Shadcn UI, Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Storage**: JSON file-based storage (data/db.json)
- **Build**: Vite

## Architecture
- `shared/schema.ts` - TypeScript interfaces and Zod validation schemas
- `server/storage.ts` - JSON file-based storage layer (reads/writes data/db.json)
- `server/routes.ts` - REST API endpoints
- `server/seed.ts` - Seed data initialization
- `client/src/App.tsx` - Root app with sidebar navigation
- `client/src/pages/` - Page components (dashboard, institutions, campuses, departments, programs, academic-years, seat-matrix, applicants)
- `client/src/components/app-sidebar.tsx` - Navigation sidebar

## Key Features
1. **Master Setup**: Institution, Campus, Department, Program, Academic Year CRUD
2. **Seat Matrix**: Quota configuration per program (KCET, COMEDK, Management, J&K) with intake validation
3. **Applicant Management**: Create applicants with 14 fields, document/fee tracking
4. **Seat Allocation**: Allocation with quota enforcement (no overbooking)
5. **Admission Confirmation**: Generates immutable admission number (format: INST/YEAR/TYPE/CODE/QUOTA/SEQ), only when fee is paid
6. **Dashboard**: Statistics, quota fill rates, pending documents/fees lists

## Business Rules
- Base quota total must not exceed program intake
- Seat allocation blocked when quota full
- Admission confirmed only after fee marked as Paid
- Admission number is unique and immutable (generated once)
- Seat counters update in real time via query invalidation
