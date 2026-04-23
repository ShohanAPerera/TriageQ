import type { MedicalNote, Prescription, Invoice } from '../types';

const LS_NOTES = 'triageq_medical_notes';
const LS_PRESCRIPTIONS = 'triageq_prescriptions';
const LS_INVOICES = 'triageq_invoices';

function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveLS<T>(key: string, val: T): void {
  localStorage.setItem(key, JSON.stringify(val));
}

// -------------------------------------------------------------
// MEDICAL NOTES
// -------------------------------------------------------------
export function getPatientNotes(patientId: number): MedicalNote[] {
  const all = loadLS<MedicalNote[]>(LS_NOTES, []);
  return all.filter(n => n.patientId === patientId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addMedicalNote(note: Omit<MedicalNote, 'id' | 'createdAt'>): MedicalNote {
  const newNote: MedicalNote = {
    ...note,
    id: `note_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  const all = loadLS<MedicalNote[]>(LS_NOTES, []);
  all.push(newNote);
  saveLS(LS_NOTES, all);
  return newNote;
}

// -------------------------------------------------------------
// PRESCRIPTIONS
// -------------------------------------------------------------
export function getPatientPrescriptions(patientId: number): Prescription[] {
  const all = loadLS<Prescription[]>(LS_PRESCRIPTIONS, []);
  return all.filter(p => p.patientId === patientId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getPrescriptionById(rxId: string): Prescription | undefined {
  const all = loadLS<Prescription[]>(LS_PRESCRIPTIONS, []);
  return all.find(p => p.id === rxId);
}

export function addPrescription(prescription: Omit<Prescription, 'id' | 'createdAt'>): Prescription {
  const newRx: Prescription = {
    ...prescription,
    id: `rx_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  const all = loadLS<Prescription[]>(LS_PRESCRIPTIONS, []);
  all.push(newRx);
  saveLS(LS_PRESCRIPTIONS, all);
  return newRx;
}

// -------------------------------------------------------------
// INVOICES
// -------------------------------------------------------------
export function getPatientInvoices(patientId: number): Invoice[] {
  const all = loadLS<Invoice[]>(LS_INVOICES, []);
  return all.filter(i => i.patientId === patientId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getInvoiceById(invoiceId: string): Invoice | undefined {
  const all = loadLS<Invoice[]>(LS_INVOICES, []);
  return all.find(i => i.id === invoiceId);
}

export function addInvoice(invoice: Omit<Invoice, 'id' | 'createdAt'>): Invoice {
  const newInv: Invoice = {
    ...invoice,
    id: `inv_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  const all = loadLS<Invoice[]>(LS_INVOICES, []);
  all.push(newInv);
  saveLS(LS_INVOICES, all);
  return newInv;
}

export function markInvoicePaid(invoiceId: string): Invoice | null {
  const all = loadLS<Invoice[]>(LS_INVOICES, []);
  const idx = all.findIndex(i => i.id === invoiceId);
  if (idx === -1) return null;
  all[idx].status = 'PAID';
  saveLS(LS_INVOICES, all);
  return all[idx];
}
