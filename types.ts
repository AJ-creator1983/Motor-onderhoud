// ---- Core domain models ----

export interface Motorcycle {
  id: string;
  make: string;
  model: string;
  year: number | null;
  engineSize: number | null; // cc
  currentMileage: number; // km
  name: string | null; // registration or nickname
  purchaseDate: string | null; // YYYY-MM-DD
  purchaseMileage: number | null;
  notes: string | null;
  photoUri: string | null; // reserved for a later phase
  isSample: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MotorcycleInput {
  make: string;
  model: string;
  year: number | null;
  engineSize: number | null;
  currentMileage: number;
  name: string | null;
  purchaseDate: string | null;
  purchaseMileage: number | null;
  notes: string | null;
  photoUri: string | null;
}

export type MaintenanceLocation = 'diy' | 'workshop';

export interface MaintenanceRecord {
  id: string;
  motorcycleId: string;
  typeId: string | null;
  typeName: string;
  date: string; // YYYY-MM-DD
  mileage: number;
  cost: number | null;
  partsUsed: string | null;
  brand: string | null;
  location: MaintenanceLocation | null;
  notes: string | null;
  nextIntervalKm: number | null;
  nextIntervalMonths: number | null;
  isSample: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecordInput {
  motorcycleId: string;
  typeId: string | null;
  typeName: string;
  date: string;
  mileage: number;
  cost: number | null;
  partsUsed: string | null;
  brand: string | null;
  location: MaintenanceLocation | null;
  notes: string | null;
  nextIntervalKm: number | null;
  nextIntervalMonths: number | null;
}

export interface MaintenanceType {
  id: string;
  name: string;
  defaultIntervalKm: number | null;
  defaultIntervalMonths: number | null;
  isCustom: boolean;
  icon: string;
}

// ---- Calculated / derived ----

export type MaintenanceStatus = 'ok' | 'soon' | 'overdue';

export interface UpcomingMaintenanceItem {
  typeId: string | null;
  typeName: string;
  icon: string;
  status: MaintenanceStatus;
  kmRemaining: number | null;
  daysRemaining: number | null;
  dueAtMileage: number | null;
  dueAtDate: string | null;
  hasRecord: boolean; // false if this is projected from purchase date/mileage only
}
