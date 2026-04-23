// ============================================================
// TriageQ — Central In-Memory Store (simulates Spring Boot backend)
// ============================================================
// This module acts as the "database + service layer" for the
// React frontend demo. It implements:
//
//  - Patient persistence (localStorage)
//  - QueueEntry persistence (localStorage)
//  - ServedRecord persistence (localStorage)
//  - PatientQueueHeap (custom max-heap) for live queue
//  - ServedHistoryDLL (custom doubly linked list) for history
//  - MergeSortUtil for report generation
//
// All mutations go through this store to maintain consistency
// between the heap, DLL, and persisted state.
// ============================================================

import { PatientQueueHeap } from '../ds/PatientQueueHeap';
import { ServedHistoryDLL } from '../ds/ServedHistoryDLL';
import { MergeSortUtil }    from '../ds/MergeSortUtil';
import { computeScore, isDeferralExpired } from './scoreService';
import type {
  Patient,
  QueueEntry,
  ServedRecord,
  RegisterFormData,
  TriageLevel,
  DailyReport,
  QueueItem,
} from '../types';

// ============================================================
// LocalStorage Keys
// ============================================================
const LS_PATIENTS  = 'triageq_patients';
const LS_QUEUE     = 'triageq_queue';
const LS_SERVED    = 'triageq_served';
const LS_PID  = 'triageq_pid';
const LS_QID  = 'triageq_qid';
const LS_SID  = 'triageq_sid';

// ============================================================
// Helper: load/save from localStorage
// ============================================================
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

function nextId(key: string): number {
  const current = loadLS<number>(key, 0);
  const next = current + 1;
  saveLS(key, next);
  return next;
}

// ============================================================
// Internal: Save/Update a single queue entry
// ============================================================
function _saveQueueEntry(entry: QueueEntry): void {
  const all = loadLS<QueueEntry[]>(LS_QUEUE, []);
  const idx = all.findIndex((q) => q.id === entry.id);
  if (idx >= 0) {
    all[idx] = entry;
  } else {
    all.push(entry);
  }
  saveLS(LS_QUEUE, all);
}

// ============================================================
// In-Memory Data Structures
// ============================================================
export const heap = new PatientQueueHeap();
export const historyDLL = new ServedHistoryDLL();

// ============================================================
// Load persisted data into heap and DLL on module init
// ============================================================
function initializeDataStructures(): void {
  const queueEntries = loadLS<QueueEntry[]>(LS_QUEUE, []);
  heap.clear();

  const activeEntries = queueEntries.filter(
    (q) => q.status === 'WAITING' || q.status === 'DEFERRED',
  );

  const now = new Date();
  for (const entry of activeEntries) {
    const result = computeScore(entry.triageLevel, entry.arrivalTime, entry.deferredUntil, now);
    const item: QueueItem = {
      queueEntryId: entry.id,
      patientId: entry.patientId,
      triageLevel: entry.triageLevel,
      arrivalTime: entry.arrivalTime,
      status: entry.status,
      deferredUntil: entry.deferredUntil,
      score: result.score,
      scoreExplain: result.explain,
    };
    heap.insert(item);
  }

  const servedRecords = loadLS<ServedRecord[]>(LS_SERVED, []);
  historyDLL.loadAll(servedRecords);
}

initializeDataStructures();

// ============================================================
// PATIENT OPERATIONS
// ============================================================

export function getAllPatients(): Patient[] {
  return loadLS<Patient[]>(LS_PATIENTS, []);
}

export function getPatientById(id: number): Patient | undefined {
  return getAllPatients().find((p) => p.id === id);
}

// ============================================================
// QUEUE OPERATIONS
// ============================================================

export function getAllQueueEntries(): QueueEntry[] {
  return loadLS<QueueEntry[]>(LS_QUEUE, []);
}

export function getQueueEntryById(id: number): QueueEntry | undefined {
  return getAllQueueEntries().find((q) => q.id === id);
}

// ============================================================
// RECOMPUTE SCORES & REBUILD HEAP
// ============================================================
export function recomputeAndRebuildHeap(): void {
  const now = new Date();
  const allQueue = loadLS<QueueEntry[]>(LS_QUEUE, []);
  heap.clear();

  for (const entry of allQueue) {
    if (entry.status !== 'WAITING' && entry.status !== 'DEFERRED') continue;

    let status = entry.status;
    let deferredUntil = entry.deferredUntil;

    if (status === 'DEFERRED' && isDeferralExpired(deferredUntil, now)) {
      status = 'WAITING';
      deferredUntil = null;
      entry.status = 'WAITING';
      entry.deferredUntil = null;
      _saveQueueEntry(entry);
    }

    const result = computeScore(entry.triageLevel, entry.arrivalTime, deferredUntil, now);
    entry.lastScore = result.score;
    entry.scoreExplain = result.explain;
    _saveQueueEntry(entry);

    const item: QueueItem = {
      queueEntryId: entry.id,
      patientId: entry.patientId,
      triageLevel: entry.triageLevel,
      arrivalTime: entry.arrivalTime,
      status,
      deferredUntil,
      score: result.score,
      scoreExplain: result.explain,
    };
    heap.insert(item);
  }
}

// ============================================================
// GET LIVE QUEUE (sorted by heap priority)
// ============================================================
export function getLiveQueue(): Array<QueueEntry & { waitingMinutes: number }> {
  recomputeAndRebuildHeap();

  const now = new Date();
  const sortedItems = heap.getAllSorted();
  const allQueue = loadLS<QueueEntry[]>(LS_QUEUE, []);

  return sortedItems.map((item) => {
    const entry = allQueue.find((q) => q.id === item.queueEntryId)!;
    const waitingMinutes = Math.max(
      0,
      Math.floor((now.getTime() - new Date(entry.arrivalTime).getTime()) / 60000),
    );
    return {
      ...entry,
      lastScore: item.score,
      scoreExplain: item.scoreExplain,
      waitingMinutes,
    };
  });
}

// ============================================================
// REGISTER PATIENT
// ============================================================
export function registerPatient(form: RegisterFormData): {
  patient: Patient;
  queueEntry: QueueEntry;
  scoreResult: ReturnType<typeof computeScore>;
} {
  const patientId = nextId(LS_PID);
  const patient: Patient = {
    id: patientId,
    clinicRef: form.clinicRef.trim(),
    fullName: form.fullName.trim(),
    age: form.age,
    symptoms: form.symptoms.trim(),
    createdAt: new Date().toISOString(),
  };

  const patients = loadLS<Patient[]>(LS_PATIENTS, []);
  patients.push(patient);
  saveLS(LS_PATIENTS, patients);

  const arrivalTime = new Date().toISOString();
  const scoreResult = computeScore(form.triageLevel, arrivalTime, null);

  const queueId = nextId(LS_QID);
  const queueEntry: QueueEntry = {
    id: queueId,
    patientId,
    patient,
    triageLevel: form.triageLevel,
    arrivalTime,
    status: 'WAITING',
    deferredUntil: null,
    lastScore: scoreResult.score,
    scoreExplain: scoreResult.explain,
  };

  _saveQueueEntry(queueEntry);

  const item: QueueItem = {
    queueEntryId: queueId,
    patientId,
    triageLevel: form.triageLevel,
    arrivalTime,
    status: 'WAITING',
    deferredUntil: null,
    score: scoreResult.score,
    scoreExplain: scoreResult.explain,
  };
  heap.insert(item);

  console.log(
    `[TriageQ] Registered patient #${patientId} (${patient.fullName}) — ` +
    `Queue #${queueId} — Score: ${scoreResult.score}`,
  );

  return { patient, queueEntry, scoreResult };
}

// ============================================================
// SERVE NEXT PATIENT
// ============================================================
export function serveNext(): { served: ServedRecord; queueEntry: QueueEntry } | null {
  recomputeAndRebuildHeap();

  const top = heap.extractMax();
  if (!top) return null;

  const now = new Date();
  const arrivalMs = new Date(top.arrivalTime).getTime();
  const waitingMinutes = Math.max(0, Math.floor((now.getTime() - arrivalMs) / 60000));

  const allQueue = loadLS<QueueEntry[]>(LS_QUEUE, []);
  const entry = allQueue.find((q) => q.id === top.queueEntryId);
  if (!entry) return null;

  entry.status = 'SERVED';
  _saveQueueEntry(entry);

  const servedId = nextId(LS_SID);
  const patient = getPatientById(top.patientId) ?? entry.patient;
  const servedRecord: ServedRecord = {
    id: servedId,
    patientId: top.patientId,
    patient,
    triageLevelAtServe: top.triageLevel,
    arrivalTime: top.arrivalTime,
    servedTime: now.toISOString(),
    waitingMinutes,
  };

  const allServed = loadLS<ServedRecord[]>(LS_SERVED, []);
  allServed.push(servedRecord);
  saveLS(LS_SERVED, allServed);

  historyDLL.addLast(servedRecord);

  console.log(
    `[TriageQ] Served patient #${top.patientId} (${patient.fullName}) — ` +
    `Waited ${waitingMinutes} min — Score was ${top.score}`,
  );

  return { served: servedRecord, queueEntry: entry };
}

// ============================================================
// UPDATE TRIAGE LEVEL
// ============================================================
export function updateTriage(queueEntryId: number, newLevel: TriageLevel): QueueEntry | null {
  const allQueue = loadLS<QueueEntry[]>(LS_QUEUE, []);
  const entry = allQueue.find((q) => q.id === queueEntryId);
  if (!entry || (entry.status !== 'WAITING' && entry.status !== 'DEFERRED')) return null;

  entry.triageLevel = newLevel;

  const now = new Date();
  const result = computeScore(newLevel, entry.arrivalTime, entry.deferredUntil, now);
  entry.lastScore = result.score;
  entry.scoreExplain = result.explain;

  _saveQueueEntry(entry);
  heap.updateKey(queueEntryId, result.score, result.explain);

  console.log(
    `[TriageQ] Updated triage for queue #${queueEntryId} to level ${newLevel} — ` +
    `New score: ${result.score}`,
  );

  return entry;
}

// ============================================================
// DEFER PATIENT
// ============================================================
export function deferPatient(queueEntryId: number, deferMinutes: number): QueueEntry | null {
  const allQueue = loadLS<QueueEntry[]>(LS_QUEUE, []);
  const entry = allQueue.find((q) => q.id === queueEntryId);
  if (!entry || (entry.status !== 'WAITING' && entry.status !== 'DEFERRED')) return null;

  const now = new Date();
  const deferredUntil = new Date(now.getTime() + deferMinutes * 60000).toISOString();
  entry.status = 'DEFERRED';
  entry.deferredUntil = deferredUntil;

  const result = computeScore(entry.triageLevel, entry.arrivalTime, deferredUntil, now);
  entry.lastScore = result.score;
  entry.scoreExplain = result.explain;

  _saveQueueEntry(entry);
  heap.updateKey(queueEntryId, result.score, result.explain, 'DEFERRED');

  console.log(
    `[TriageQ] Deferred queue #${queueEntryId} for ${deferMinutes} min ` +
    `until ${deferredUntil}`,
  );

  return entry;
}

// ============================================================
// CANCEL PATIENT
// ============================================================
export function cancelPatient(queueEntryId: number): QueueEntry | null {
  const allQueue = loadLS<QueueEntry[]>(LS_QUEUE, []);
  const entry = allQueue.find((q) => q.id === queueEntryId);
  if (!entry || (entry.status !== 'WAITING' && entry.status !== 'DEFERRED')) return null;

  entry.status = 'CANCELED';
  _saveQueueEntry(entry);
  heap.remove(queueEntryId);

  console.log(`[TriageQ] Canceled queue entry #${queueEntryId}`);

  return entry;
}

// ============================================================
// SERVED HISTORY
// ============================================================
export function getServedHistory(dateFilter?: string): ServedRecord[] {
  const allServed = loadLS<ServedRecord[]>(LS_SERVED, []);
  if (!dateFilter) return [...allServed].reverse();
  return allServed
    .filter((s) => s.servedTime.startsWith(dateFilter))
    .reverse();
}

// ============================================================
// DAILY REPORT
// ============================================================
export function getDailyReport(date: string): DailyReport {
  const allServed = loadLS<ServedRecord[]>(LS_SERVED, []);
  const dayRecords = allServed.filter((s) => s.servedTime.startsWith(date));

  const totalServed = dayRecords.length;
  const averageWaitingMinutes =
    totalServed === 0
      ? 0
      : Math.round(dayRecords.reduce((sum, r) => sum + r.waitingMinutes, 0) / totalServed);
  const longestWaitingMinutes =
    totalServed === 0
      ? 0
      : Math.max(...dayRecords.map((r) => r.waitingMinutes));

  const triageDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of dayRecords) {
    triageDistribution[r.triageLevelAtServe] =
      (triageDistribution[r.triageLevelAtServe] || 0) + 1;
  }

  // Custom merge sort — O(n log n)
  const sortedByWaitDesc = MergeSortUtil.sortByWaitDesc(dayRecords);
  const sortedByTriageThenWait = MergeSortUtil.sortByTriageThenWait(dayRecords);

  return {
    date,
    totalServed,
    averageWaitingMinutes,
    longestWaitingMinutes,
    triageDistribution,
    sortedByWaitDesc,
    sortedByTriageThenWait,
  };
}

// ============================================================
// GET ALL QUEUE WITH WAITING MINUTES
// ============================================================
export function getAllQueueEntriesEnriched(): Array<QueueEntry & { waitingMinutes: number }> {
  const now = new Date();
  return getAllQueueEntries().map((entry) => ({
    ...entry,
    waitingMinutes: Math.max(
      0,
      Math.floor((now.getTime() - new Date(entry.arrivalTime).getTime()) / 60000),
    ),
  }));
}

// ============================================================
// RESET ALL DATA
// ============================================================
export function resetAllData(): void {
  localStorage.removeItem(LS_PATIENTS);
  localStorage.removeItem(LS_QUEUE);
  localStorage.removeItem(LS_SERVED);
  localStorage.removeItem(LS_PID);
  localStorage.removeItem(LS_QID);
  localStorage.removeItem(LS_SID);
  heap.clear();
  historyDLL.clear();
}

// ============================================================
// SEED DEMO DATA
// ============================================================
export function seedDemoData(): void {
  const existing = loadLS<QueueEntry[]>(LS_QUEUE, []);
  if (existing.length > 0) return;

  const demos: Array<RegisterFormData & { minutesAgo: number }> = [
    { clinicRef: 'IC-1001', fullName: 'Ahmad Bin Razali',      age: 65, symptoms: 'Severe chest pain, shortness of breath',    triageLevel: 1, minutesAgo: 30 },
    { clinicRef: 'IC-1002', fullName: 'Siti Norhaiza',         age: 42, symptoms: 'High fever 39.8°C, difficulty breathing',    triageLevel: 2, minutesAgo: 25 },
    { clinicRef: 'IC-1003', fullName: 'Tan Mei Ling',          age: 28, symptoms: 'Deep laceration on right arm, bleeding',     triageLevel: 2, minutesAgo: 20 },
    { clinicRef: 'IC-1004', fullName: 'Rajesh Kumar',          age: 35, symptoms: 'Persistent vomiting, dehydration signs',    triageLevel: 3, minutesAgo: 15 },
    { clinicRef: 'IC-1005', fullName: 'Nurul Ain Binti Yusof', age: 19, symptoms: 'Mild fever, headache, body aches',          triageLevel: 4, minutesAgo: 10 },
    { clinicRef: 'IC-1006', fullName: 'David Lim Kah Wai',    age: 55, symptoms: 'Routine BP check and medication refill',    triageLevel: 5, minutesAgo: 5  },
  ];

  const now = Date.now();

  for (const d of demos) {
    const form: RegisterFormData = {
      clinicRef: d.clinicRef,
      fullName: d.fullName,
      age: d.age,
      symptoms: d.symptoms,
      triageLevel: d.triageLevel,
    };

    registerPatient(form);

    const allQ = loadLS<QueueEntry[]>(LS_QUEUE, []);
    const lastEntry = allQ[allQ.length - 1];
    if (lastEntry) {
      lastEntry.arrivalTime = new Date(now - d.minutesAgo * 60 * 1000).toISOString();
      _saveQueueEntry(lastEntry);
    }
  }

  recomputeAndRebuildHeap();
  console.log('[TriageQ] Demo data seeded successfully.');
}
