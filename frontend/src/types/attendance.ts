import type { Employee } from "./employee";

export type AttendanceRecord = {
  id: number;
  date: string;
  isPresent: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
  notes: string | null;
  employeeId: number;
  employee: Employee;
  createdAt: string;
  updatedAt: string;
};