// ============================================================
// TriageQ — Priority Score Algorithm
// ============================================================
// Computes the priority score for a queue entry.
//
// Formula:
//   severityScore = (6 - triageLevel) * 100
//   agingBoost    = waitMinutes * 2
//   deferPenalty  = (now < deferredUntil) ? 80 : 0
//   score         = severityScore + agingBoost - deferPenalty
//
// Key behaviors:
//   - Triage 1 (Critical) -> severity 500 (highest)
//   - Triage 5 (Non-Urgent) -> severity 100 (lowest)
//   - Aging boosts score by 2 per minute waited (fairness)
//   - Deferred patients get -80 penalty while still deferred
// ============================================================

import type { TriageLevel } from '../types';

export interface ScoreResult {
  score: number;
  explain: string;
  severityScore: number;
  agingBoost: number;
  deferPenalty: number;
  waitMinutes: number;
}

/**
 * Compute priority score for a queue entry.
 *
 * @param triageLevel    1–5 (1 = most critical)
 * @param arrivalTime    ISO string of when patient arrived
 * @param deferredUntil  ISO string if deferred, null otherwise
 * @param now            Optional override for "current time" (for testing)
 */
export function computeScore(
  triageLevel: TriageLevel,
  arrivalTime: string,
  deferredUntil: string | null,
  now: Date = new Date(),
): ScoreResult {
  // --- Severity: inverse of triage level ---
  const severityScore = (6 - triageLevel) * 100;

  // --- Aging: minutes waited * 2 ---
  const arrivalMs = new Date(arrivalTime).getTime();
  const waitMinutes = Math.max(0, Math.floor((now.getTime() - arrivalMs) / 60000));
  const agingBoost = waitMinutes * 2;

  // --- Defer penalty: -80 while still in deferral window ---
  let deferPenalty = 0;
  if (deferredUntil) {
    const deferEnd = new Date(deferredUntil).getTime();
    if (now.getTime() < deferEnd) {
      deferPenalty = 80;
    }
  }

  const score = severityScore + agingBoost - deferPenalty;

  const explain =
    `Severity=${severityScore} (Triage ${triageLevel}), ` +
    `Aging=${agingBoost} (${waitMinutes} min × 2), ` +
    `DeferPenalty=${deferPenalty}` +
    ` => Total=${score}`;

  return { score, explain, severityScore, agingBoost, deferPenalty, waitMinutes };
}

/**
 * Check if a deferred patient's deferral window has expired.
 */
export function isDeferralExpired(deferredUntil: string | null, now: Date = new Date()): boolean {
  if (!deferredUntil) return true;
  return now.getTime() >= new Date(deferredUntil).getTime();
}
