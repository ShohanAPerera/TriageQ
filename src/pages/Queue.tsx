import React, { useEffect, useState, useCallback } from 'react';
import {
  Play,
  RefreshCw,
  Edit3,
  Clock,
  XCircle,
  Info,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import {
  getLiveQueue,
  serveNext,
  updateTriage,
  deferPatient,
  cancelPatient,
} from '../services/store';
import {
  TRIAGE_LABELS,
  TRIAGE_BADGE_COLORS,
  STATUS_COLORS,
} from '../types';
import type { QueueEntry, TriageLevel } from '../types';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Card, CardBody } from '../components/ui/Card';

type QueueRow = QueueEntry & { waitingMinutes: number };

export default function QueuePage() {
  const [queue, setQueue] = useState<QueueRow[]>([]);
  const [lastServed, setLastServed] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const [expandedExplain, setExpandedExplain] = useState<number | null>(null);

  // Modals
  const [triageModal, setTriageModal] = useState<{ open: boolean; entry: QueueRow | null }>({ open: false, entry: null });
  const [deferModal, setDeferModal] = useState<{ open: boolean; entry: QueueRow | null }>({ open: false, entry: null });
  const [cancelModal, setCancelModal] = useState<{ open: boolean; entry: QueueRow | null }>({ open: false, entry: null });
  const [serveModal, setServeModal] = useState(false);

  const [newTriageLevel, setNewTriageLevel] = useState<TriageLevel>(3);
  const [deferMinutes, setDeferMinutes] = useState(15);

  const refresh = useCallback(() => {
    const q = getLiveQueue();
    setQueue(q);
    setCountdown(10);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          refresh();
          return 10;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, refresh]);

  function handleServeNext() {
    const result = serveNext();
    if (result) {
      setLastServed(result.served);
      setServeModal(true);
    }
    refresh();
  }

  function handleUpdateTriage() {
    if (!triageModal.entry) return;
    updateTriage(triageModal.entry.id, newTriageLevel);
    setTriageModal({ open: false, entry: null });
    refresh();
  }

  function handleDefer() {
    if (!deferModal.entry) return;
    deferPatient(deferModal.entry.id, deferMinutes);
    setDeferModal({ open: false, entry: null });
    refresh();
  }

  function handleCancel() {
    if (!cancelModal.entry) return;
    cancelPatient(cancelModal.entry.id);
    setCancelModal({ open: false, entry: null });
    refresh();
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Queue Board</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Ordered by priority score (Max-Heap) — {queue.length} patient{queue.length !== 1 ? 's' : ''} in queue
          </p>
        </div>

        <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
          {/* Auto refresh toggle */}
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${
              autoRefresh
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {autoRefresh ? `Auto ${countdown}s` : 'Paused'}
          </button>

          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>

          <button
            onClick={handleServeNext}
            disabled={queue.length === 0}
            className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-red-500/25"
          >
            <Play size={16} className="fill-white" />
            Serve Next
          </button>
        </div>
      </div>

      {/* Empty state */}
      {queue.length === 0 && (
        <Card>
          <CardBody className="text-center py-16">
            <CheckCircle size={48} className="mx-auto mb-3 text-green-400" />
            <p className="text-lg font-semibold text-gray-600">Queue is Empty</p>
            <p className="text-sm text-gray-400 mt-1">All patients have been served or the queue has no active entries.</p>
          </CardBody>
        </Card>
      )}

      {/* Queue Table */}
      {queue.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Rank</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Patient</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Triage</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Arrival</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Wait</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Score</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {queue.map((entry, idx) => (
                  <React.Fragment key={entry.id}>
                    <tr
                      className={`transition-colors ${
                        idx === 0
                          ? 'bg-red-50 hover:bg-red-100'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-4 py-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0
                            ? 'bg-red-600 text-white'
                            : idx === 1
                            ? 'bg-orange-400 text-white'
                            : idx === 2
                            ? 'bg-yellow-400 text-gray-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {idx + 1}
                        </div>
                      </td>

                      {/* Patient */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900 max-w-[150px] truncate">
                          {entry.patient?.fullName ?? `Patient #${entry.patientId}`}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{entry.patient?.clinicRef ?? `Q#${entry.id}`}</div>
                      </td>

                      {/* Triage */}
                      <td className="px-4 py-3">
                        <Badge className={TRIAGE_BADGE_COLORS[entry.triageLevel]}>
                          T{entry.triageLevel} {TRIAGE_LABELS[entry.triageLevel]}
                        </Badge>
                      </td>

                      {/* Arrival */}
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(entry.arrivalTime).toLocaleTimeString()}
                      </td>

                      {/* Wait */}
                      <td className="px-4 py-3">
                        <span className={`font-semibold text-sm ${
                          entry.waitingMinutes > 30
                            ? 'text-red-600'
                            : entry.waitingMinutes > 15
                            ? 'text-orange-600'
                            : 'text-gray-700'
                        }`}>
                          {entry.waitingMinutes}m
                        </span>
                        {entry.waitingMinutes > 30 && (
                          <AlertTriangle size={12} className="inline ml-1 text-red-500" />
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <Badge className={STATUS_COLORS[entry.status]}>
                          {entry.status}
                        </Badge>
                        {entry.status === 'DEFERRED' && entry.deferredUntil && (
                          <div className="text-xs text-purple-500 mt-0.5">
                            Until {new Date(entry.deferredUntil).toLocaleTimeString()}
                          </div>
                        )}
                      </td>

                      {/* Score */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className={`text-base font-black ${
                            idx === 0 ? 'text-red-600' : 'text-gray-800'
                          }`}>
                            {Math.round(entry.lastScore)}
                          </span>
                          <button
                            onClick={() =>
                              setExpandedExplain(
                                expandedExplain === entry.id ? null : entry.id,
                              )
                            }
                            className="text-gray-400 hover:text-blue-500 transition-colors"
                            title="Explain Score"
                          >
                            <Info size={12} />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setTriageModal({ open: true, entry });
                              setNewTriageLevel(entry.triageLevel);
                            }}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                            title="Update Triage"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => {
                              setDeferModal({ open: true, entry });
                              setDeferMinutes(15);
                            }}
                            className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors"
                            title="Defer Patient"
                          >
                            <Clock size={13} />
                          </button>
                          <button
                            onClick={() => setCancelModal({ open: true, entry })}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                            title="Cancel"
                          >
                            <XCircle size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Score Explanation Row */}
                    {expandedExplain === entry.id && (
                      <tr className="bg-blue-50 border-t border-blue-100">
                        <td colSpan={8} className="px-4 py-2">
                          <div className="flex items-start gap-2">
                            <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                            <div className="text-xs font-mono text-blue-700">{entry.scoreExplain}</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Heap Algorithm Info Banner */}
      <div className="bg-slate-800 rounded-2xl p-4 text-white">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🌳</div>
          <div>
            <div className="font-bold text-sm">Max-Heap Priority Queue</div>
            <div className="text-slate-400 text-xs mt-1">
              Above table is rendered from <code className="bg-slate-700 px-1 rounded">PatientQueueHeap.getAllSorted()</code>.
              Scores recomputed on every refresh → aging fairness applied.
              Serve Next calls <code className="bg-slate-700 px-1 rounded">extractMax()</code> in O(log n).
              Update Triage uses <code className="bg-slate-700 px-1 rounded">updateKey()</code> in O(log n).
              Cancel uses <code className="bg-slate-700 px-1 rounded">remove()</code> in O(log n) via index map.
            </div>
          </div>
        </div>
      </div>

      {/* UPDATE TRIAGE MODAL */}
      <Modal
        isOpen={triageModal.open}
        onClose={() => setTriageModal({ open: false, entry: null })}
        title="Update Triage Level"
      >
        {triageModal.entry && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <div className="font-semibold text-gray-800">
                {triageModal.entry.patient?.fullName}
              </div>
              <div className="text-gray-500 text-xs mt-0.5">
                Current: Triage {triageModal.entry.triageLevel} — {TRIAGE_LABELS[triageModal.entry.triageLevel]}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Triage Level
              </label>
              <div className="grid grid-cols-5 gap-2">
                {([1, 2, 3, 4, 5] as TriageLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setNewTriageLevel(level)}
                    className={`p-2 rounded-xl border-2 text-center text-xs font-bold transition-all ${
                      newTriageLevel === level
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg">{level}</div>
                    <div>{TRIAGE_LABELS[level].split('-')[0]}</div>
                  </button>
                ))}
              </div>
              <div className="mt-2 text-xs text-blue-600 bg-blue-50 rounded-lg p-2">
                ⚡ Heap will be updated in O(log n) using <code>updateKey()</code>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setTriageModal({ open: false, entry: null })}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTriage}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
              >
                Update Triage
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* DEFER MODAL */}
      <Modal
        isOpen={deferModal.open}
        onClose={() => setDeferModal({ open: false, entry: null })}
        title="Defer Patient"
      >
        {deferModal.entry && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <div className="font-semibold text-gray-800">
                {deferModal.entry.patient?.fullName}
              </div>
              <div className="text-gray-500 text-xs mt-0.5">
                Patient will receive a -80 priority penalty while deferred.
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Defer for how many minutes?
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={5}
                  max={120}
                  step={5}
                  value={deferMinutes}
                  onChange={(e) => setDeferMinutes(Number(e.target.value))}
                  className="flex-1 accent-purple-600"
                />
                <span className="text-lg font-bold text-purple-600 w-16 text-right">
                  {deferMinutes}m
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5 min</span>
                <span>120 min</span>
              </div>
            </div>

            <div className="text-xs text-purple-600 bg-purple-50 rounded-lg p-2">
              Deferred until: {new Date(Date.now() + deferMinutes * 60000).toLocaleTimeString()}
              <br />
              Score penalty: -80 while active. Auto-restored after deferral ends.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeferModal({ open: false, entry: null })}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDefer}
                className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700"
              >
                Defer Patient
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* CANCEL MODAL */}
      <Modal
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ open: false, entry: null })}
        title="Cancel Queue Entry"
      >
        {cancelModal.entry && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-red-50 rounded-xl p-3">
              <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-red-800">Confirm Cancellation</div>
                <div className="text-sm text-red-600 mt-1">
                  <strong>{cancelModal.entry.patient?.fullName}</strong> will be removed from the queue.
                  This action cannot be undone.
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
              📊 Patient will be removed from heap using <code>remove()</code> in O(log n) via index map.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCancelModal({ open: false, entry: null })}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Keep Patient
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700"
              >
                Cancel Entry
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* SERVE SUCCESS MODAL */}
      <Modal
        isOpen={serveModal}
        onClose={() => setServeModal(false)}
        title="Now Serving"
      >
        {lastServed && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <div className="text-xl font-bold text-gray-900">
                {lastServed.patient?.fullName ?? `Patient #${lastServed.patientId}`}
              </div>
              <div className="text-gray-500 text-sm mt-1">
                {lastServed.patient?.clinicRef}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-blue-600">{lastServed.waitingMinutes}</div>
                <div className="text-xs text-gray-500">Minutes Waited</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-red-600">T{lastServed.triageLevelAtServe}</div>
                <div className="text-xs text-gray-500">{TRIAGE_LABELS[lastServed.triageLevelAtServe]}</div>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              <div>Arrived: {new Date(lastServed.arrivalTime).toLocaleTimeString()}</div>
              <div>Served: {new Date(lastServed.servedTime).toLocaleTimeString()}</div>
              <div className="mt-1 text-green-600">✓ Record added to Doubly Linked List (DLL) history</div>
            </div>

            <button
              onClick={() => setServeModal(false)}
              className="w-full py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
            >
              Done
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
