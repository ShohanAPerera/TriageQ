// ============================================================
// TriageQ — Core Type Definitions
// ============================================================

export type TriageLevel = 1 | 2 | 3 | 4 | 5;

export type QueueStatus = 'WAITING' | 'DEFERRED' | 'SERVING' | 'SERVED' | 'CANCELED';

export type UserRole = 'Admin' | 'Staff';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  pin: string; // 4-digit PIN
  createdAt: string;
}

export interface Patient {
  id: number;
  clinicRef: string;       // Clinic Ref / NIC
  fullName: string;
  age: number;
  symptoms: string;
  createdAt: string;       // ISO string
}

export interface QueueEntry {
  id: number;
  patientId: number;
  patient: Patient;
  triageLevel: TriageLevel;
  arrivalTime: string;     // ISO string
  status: QueueStatus;
  deferredUntil: string | null;  // ISO string or null
  lastScore: number;
  scoreExplain: string;
}

export interface ServedRecord {
  id: number;
  patientId: number;
  patient: Patient;
  triageLevelAtServe: TriageLevel;
  arrivalTime: string;
  servedTime: string;
  waitingMinutes: number;
}

export interface DailyReport {
  date: string;
  totalServed: number;
  averageWaitingMinutes: number;
  longestWaitingMinutes: number;
  triageDistribution: Record<number, number>;
  sortedByWaitDesc: ServedRecord[];
  sortedByTriageThenWait: ServedRecord[];
}

// QueueItem used internally by heap
export interface QueueItem {
  queueEntryId: number;
  patientId: number;
  triageLevel: TriageLevel;
  arrivalTime: string;
  status: QueueStatus;
  deferredUntil: string | null;
  score: number;
  scoreExplain: string;
}

// Registration form data
export interface RegisterFormData {
  clinicRef: string;
  fullName: string;
  age: number;
  symptoms: string;
  triageLevel: TriageLevel;
}

export const TRIAGE_LABELS: Record<number, string> = {
  1: 'Critical',
  2: 'Emergency',
  3: 'Urgent',
  4: 'Semi-Urgent',
  5: 'Non-Urgent',
};

export const TRIAGE_COLORS: Record<number, string> = {
  1: 'bg-red-600 text-white',
  2: 'bg-orange-500 text-white',
  3: 'bg-yellow-400 text-gray-900',
  4: 'bg-blue-400 text-white',
  5: 'bg-green-500 text-white',
};

export const TRIAGE_BADGE_COLORS: Record<number, string> = {
  1: 'bg-red-100 text-red-800 border border-red-300',
  2: 'bg-orange-100 text-orange-800 border border-orange-300',
  3: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  4: 'bg-blue-100 text-blue-800 border border-blue-300',
  5: 'bg-green-100 text-green-800 border border-green-300',
};

export const STATUS_COLORS: Record<QueueStatus, string> = {
  WAITING:  'bg-blue-100 text-blue-800 border border-blue-300',
  DEFERRED: 'bg-purple-100 text-purple-800 border border-purple-300',
  SERVING:  'bg-teal-100 text-teal-800 border border-teal-300',
  SERVED:   'bg-gray-100 text-gray-600 border border-gray-300',
  CANCELED: 'bg-red-100 text-red-600 border border-red-300',
};

// ============================================================
// Clinical & Finance Types
// ============================================================

export interface MedicalNote {
  id: string;
  patientId: number;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface PrescriptionItem {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  id: string;
  patientId: number;
  authorName: string;
  items: PrescriptionItem[];
  instructions: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number; // qty * unitPrice
}

export interface Invoice {
  id: string;
  patientId: number;
  authorName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  status: 'UNPAID' | 'PAID';
  createdAt: string;
}
