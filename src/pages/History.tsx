import React, { useState, useEffect } from 'react';
import { Clock, Search, Filter, Link2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getServedHistory, historyDLL } from '../services/store';
import { TRIAGE_LABELS, TRIAGE_BADGE_COLORS } from '../types';
import type { ServedRecord } from '../types';
import { Badge } from '../components/ui/Badge';
import { Card, CardBody } from '../components/ui/Card';

const PAGE_SIZE = 10;

export default function History() {
  const today = new Date().toISOString().split('T')[0];
  const [dateFilter, setDateFilter] = useState(today);
  const [records, setRecords] = useState<ServedRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [dllStats, setDllStats] = useState({ size: 0, head: null as any, tail: null as any });

  useEffect(() => {
    const all = getServedHistory(dateFilter || undefined);
    setRecords(all);
    setPage(1);

    setDllStats({
      size: historyDLL.size(),
      head: historyDLL.peekHead(),
      tail: historyDLL.peekTail(),
    });
  }, [dateFilter]);

  const filtered = records.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.patient?.fullName?.toLowerCase().includes(term) ||
      r.patient?.clinicRef?.toLowerCase().includes(term) ||
      String(r.patientId).includes(term)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function avgWait() {
    if (!filtered.length) return 0;
    return Math.round(filtered.reduce((s, r) => s + r.waitingMinutes, 0) / filtered.length);
  }

  function maxWait() {
    if (!filtered.length) return 0;
    return Math.max(...filtered.map((r) => r.waitingMinutes));
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Clock size={24} className="text-purple-500" />
          Served History
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Records stored in Doubly Linked List (DLL) + localStorage persistence.
        </p>
      </div>

      {/* DLL Info Banner */}
      <div className="bg-slate-800 rounded-2xl p-4 text-white">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="text-xl">🔗</div>
            <div>
              <div className="font-bold text-sm">Doubly Linked List — In-Memory History</div>
              <div className="text-slate-400 text-xs">
                <code className="bg-slate-700 px-1 rounded">ServedHistoryDLL</code> — addLast() O(1) · forward/backward traversal O(n)
              </div>
            </div>
          </div>

          <div className="flex gap-4 ml-auto">
            <div className="text-center">
              <div className="text-2xl font-black text-purple-400">{dllStats.size}</div>
              <div className="text-slate-400 text-xs">DLL Nodes</div>
            </div>
            <div className="text-center border-l border-slate-700 pl-4">
              <div className="text-xs text-slate-400">HEAD →</div>
              <div className="text-xs text-purple-300 font-mono truncate max-w-[120px]">
                {dllStats.head ? dllStats.head.patient?.fullName?.split(' ')[0] ?? 'Node' : 'null'}
              </div>
            </div>
            <div className="text-center border-l border-slate-700 pl-4">
              <div className="text-xs text-slate-400">← TAIL</div>
              <div className="text-xs text-purple-300 font-mono truncate max-w-[120px]">
                {dllStats.tail ? dllStats.tail.patient?.fullName?.split(' ')[0] ?? 'Node' : 'null'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 flex-1">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name or clinic ref..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
          <Filter size={16} className="text-gray-400 shrink-0" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-sm outline-none text-gray-700"
          />
        </div>

        <button
          onClick={() => setDateFilter('')}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium"
        >
          All Time
        </button>
      </div>

      {/* Summary Stats */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <StatMini label="Patients" value={filtered.length} color="text-blue-600" />
          <StatMini label="Avg Wait" value={`${avgWait()}m`} color="text-orange-600" />
          <StatMini label="Max Wait" value={`${maxWait()}m`} color="text-red-600" />
        </div>
      )}

      {/* Table */}
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <CardBody className="text-center py-12">
            <Clock size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No served records found</p>
            <p className="text-sm text-gray-400 mt-1">
              {dateFilter ? `No patients served on ${dateFilter}` : 'No history yet'}
            </p>
          </CardBody>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Triage</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Arrival</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Served At</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Wait Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((record, idx) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {(page - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900 max-w-[180px] truncate">
                          {record.patient?.fullName ?? `Patient #${record.patientId}`}
                        </div>
                        <div className="text-xs text-gray-400">{record.patient?.clinicRef}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={TRIAGE_BADGE_COLORS[record.triageLevelAtServe]}>
                          T{record.triageLevelAtServe} {TRIAGE_LABELS[record.triageLevelAtServe]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(record.arrivalTime).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(record.servedTime).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold text-sm ${
                          record.waitingMinutes > 30
                            ? 'text-red-600'
                            : record.waitingMinutes > 15
                            ? 'text-orange-500'
                            : 'text-green-600'
                        }`}>
                          {record.waitingMinutes} min
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* DLL Traversal Visualization */}
      {dllStats.size > 0 && (
        <Card>
          <CardBody>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Link2 size={16} className="text-purple-500" />
              DLL Traversal Visualization (First 5 Nodes)
            </h3>
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              <div className="text-xs font-bold text-gray-500 shrink-0">HEAD</div>
              {historyDLL.toArray().slice(0, 5).map((record, idx, arr) => (
                <React.Fragment key={record.id}>
                  <div className="shrink-0 bg-purple-50 border border-purple-200 rounded-xl px-3 py-2 text-xs text-center min-w-[100px]">
                    <div className="font-bold text-purple-700">
                      {record.patient?.fullName?.split(' ')[0] ?? 'P#' + record.patientId}
                    </div>
                    <div className="text-gray-500 mt-0.5">T{record.triageLevelAtServe}</div>
                    <div className="text-gray-400">{record.waitingMinutes}m wait</div>
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="shrink-0 text-purple-400 font-bold text-xs">⟷</div>
                  )}
                </React.Fragment>
              ))}
              {dllStats.size > 5 && (
                <div className="shrink-0 text-gray-400 text-xs ml-1">... +{dllStats.size - 5} more</div>
              )}
              <div className="text-xs font-bold text-gray-500 shrink-0 ml-1">TAIL</div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function StatMini({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <Card>
      <CardBody className="!py-3 text-center">
        <div className={`text-xl font-black ${color}`}>{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </CardBody>
    </Card>
  );
}
