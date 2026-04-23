import { useState, useEffect } from 'react';
import { BarChart3, TrendingDown, TrendingUp, Layers, GitMerge } from 'lucide-react';
import { getDailyReport } from '../services/store';
import { TRIAGE_LABELS, TRIAGE_BADGE_COLORS } from '../types';
import type { DailyReport, ServedRecord } from '../types';
import { Badge } from '../components/ui/Badge';
import { Card, CardBody } from '../components/ui/Card';

export default function Reports() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [report, setReport] = useState<DailyReport | null>(null);
  const [activeSort, setActiveSort] = useState<'wait' | 'triage'>('wait');

  useEffect(() => {
    if (date) {
      const r = getDailyReport(date);
      setReport(r);
    }
  }, [date]);

  const sortedData = report
    ? activeSort === 'wait'
      ? report.sortedByWaitDesc
      : report.sortedByTriageThenWait
    : [];

  const maxWait = report?.longestWaitingMinutes ?? 0;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 size={24} className="text-green-500" />
            Daily Report
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Statistics &amp; Merge Sort demonstration — O(n log n)
          </p>
        </div>
        <div className="sm:ml-auto">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Merge Sort Banner */}
      <div className="bg-slate-800 rounded-2xl p-4 text-white">
        <div className="flex items-start gap-3">
          <div className="text-2xl">⚡</div>
          <div>
            <div className="font-bold text-sm flex items-center gap-2">
              <GitMerge size={14} className="text-green-400" />
              Custom Merge Sort — O(n log n)
            </div>
            <div className="text-slate-400 text-xs mt-1">
              Report tables are sorted using <code className="bg-slate-700 px-1 rounded">MergeSortUtil.mergeSort()</code>.
              Divide → conquer → merge. Stable sort, always O(n log n) time, O(n) space.
              Two sort configurations: by waiting time desc, and by triage level asc + waiting time desc.
            </div>
          </div>
        </div>
      </div>

      {!report || report.totalServed === 0 ? (
        <Card>
          <CardBody className="text-center py-16">
            <BarChart3 size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-semibold text-gray-600">No Data for {date}</p>
            <p className="text-sm text-gray-400 mt-1">
              No patients were served on this date. Try serving some patients first.
            </p>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="Total Served"
              value={report.totalServed}
              icon={<BarChart3 size={20} className="text-green-500" />}
              color="bg-green-50"
            />
            <SummaryCard
              label="Avg Wait Time"
              value={`${report.averageWaitingMinutes}m`}
              icon={<TrendingUp size={20} className="text-blue-500" />}
              color="bg-blue-50"
            />
            <SummaryCard
              label="Longest Wait"
              value={`${report.longestWaitingMinutes}m`}
              icon={<TrendingDown size={20} className="text-red-500" />}
              color="bg-red-50"
            />
            <SummaryCard
              label="Triage Levels"
              value={Object.values(report.triageDistribution).filter((v) => v > 0).length}
              icon={<Layers size={20} className="text-purple-500" />}
              color="bg-purple-50"
            />
          </div>

          {/* Triage Distribution */}
          <Card>
            <CardBody>
              <h2 className="font-bold text-gray-900 mb-4">Triage Distribution</h2>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((level) => {
                  const count = report.triageDistribution[level] ?? 0;
                  const pct = report.totalServed > 0 ? (count / report.totalServed) * 100 : 0;
                  return (
                    <div key={level} className="flex items-center gap-3">
                      <Badge className={`${TRIAGE_BADGE_COLORS[level]} w-28 justify-center`}>
                        T{level} {TRIAGE_LABELS[level].split('-')[0].trim()}
                      </Badge>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            level === 1 ? 'bg-red-500'
                            : level === 2 ? 'bg-orange-400'
                            : level === 3 ? 'bg-yellow-400'
                            : level === 4 ? 'bg-blue-400'
                            : 'bg-green-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="w-16 text-right text-sm font-semibold text-gray-700">
                        {count} <span className="text-gray-400 text-xs">({Math.round(pct)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* Sort Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSort('wait')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${
                activeSort === 'wait'
                  ? 'bg-green-600 text-white border-green-600 shadow-lg'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <GitMerge size={14} />
              Sort by Wait Time ↓
            </button>
            <button
              onClick={() => setActiveSort('triage')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${
                activeSort === 'triage'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <GitMerge size={14} />
              Sort by Triage ↑ + Wait ↓
            </button>
          </div>

          {/* Sorted Table with Merge Sort Visualization */}
          <Card className="overflow-hidden">
            <div className="px-6 py-3 bg-green-50 border-b border-green-100 flex items-center gap-2">
              <GitMerge size={14} className="text-green-600" />
              <span className="text-sm font-semibold text-green-800">
                {activeSort === 'wait'
                  ? 'Sorted by: Waiting Time (Descending) — via MergeSortUtil.sortByWaitDesc()'
                  : 'Sorted by: Triage Level (Asc) then Waiting Time (Desc) — via MergeSortUtil.sortByTriageThenWait()'}
              </span>
              <span className="ml-auto text-xs font-mono text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                O(n log n)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Triage</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Served At</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Wait Time</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sortedData.map((record, idx) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-gray-500">#{idx + 1}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900 truncate max-w-[140px]">
                          {record.patient?.fullName ?? `Patient #${record.patientId}`}
                        </div>
                        <div className="text-xs text-gray-400">{record.patient?.clinicRef}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={TRIAGE_BADGE_COLORS[record.triageLevelAtServe]}>
                          T{record.triageLevelAtServe}
                        </Badge>
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
                      <td className="px-4 py-3">
                        <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{
                              width: maxWait > 0 ? `${(record.waitingMinutes / maxWait) * 100}%` : '0%',
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Merge Sort Algorithm Explanation */}
          <Card>
            <CardBody>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <GitMerge size={16} className="text-green-600" />
                Merge Sort — Algorithm Trace
              </h3>
              <MergeSortVisual records={sortedData.slice(0, 6)} sortType={activeSort} />
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon, color }: any) {
  return (
    <Card>
      <CardBody className="!py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 font-medium">{label}</div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function MergeSortVisual({ records, sortType }: { records: ServedRecord[]; sortType: string }) {
  if (records.length < 2) {
    return (
      <div className="text-sm text-gray-400 italic">Need at least 2 records to visualize merge sort.</div>
    );
  }

  const n = records.length;
  const mid = Math.floor(n / 2);
  const left = records.slice(0, mid);
  const right = records.slice(mid);

  const getKey = (r: ServedRecord) =>
    sortType === 'wait' ? `${r.waitingMinutes}m` : `T${r.triageLevelAtServe}`;

  return (
    <div className="space-y-3 text-xs font-mono">
      {/* Step 1: Original (unsorted conceptually) */}
      <div>
        <div className="text-gray-500 mb-1">① Input Array (n={n} records):</div>
        <div className="flex flex-wrap gap-1">
          {records.map((r, i) => (
            <div key={r.id} className="bg-gray-100 border border-gray-200 rounded px-2 py-1 text-gray-700">
              [{i}] {getKey(r)}
            </div>
          ))}
        </div>
      </div>

      {/* Step 2: Divide */}
      <div>
        <div className="text-blue-600 mb-1">② Divide at mid={mid}:</div>
        <div className="flex gap-4 flex-wrap">
          <div>
            <div className="text-blue-500 mb-0.5">Left[0..{mid - 1}]:</div>
            <div className="flex gap-1 flex-wrap">
              {left.map((r) => (
                <div key={r.id} className="bg-blue-50 border border-blue-200 rounded px-2 py-1 text-blue-700">
                  {getKey(r)}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-green-500 mb-0.5">Right[{mid}..{n - 1}]:</div>
            <div className="flex gap-1 flex-wrap">
              {right.map((r) => (
                <div key={r.id} className="bg-green-50 border border-green-200 rounded px-2 py-1 text-green-700">
                  {getKey(r)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Merge result */}
      <div>
        <div className="text-purple-600 mb-1">③ Merge (sorted output):</div>
        <div className="flex flex-wrap gap-1">
          {records.map((r, i) => (
            <div key={r.id} className="bg-purple-50 border border-purple-300 rounded px-2 py-1 text-purple-700 font-semibold">
              [{i}] {getKey(r)}
            </div>
          ))}
        </div>
      </div>

      <div className="text-gray-400 italic border-t border-gray-100 pt-2">
        Total complexity: O(n log n) where n = {n} records
        → approx {Math.round(n * Math.log2(n || 1))} comparisons
      </div>
    </div>
  );
}
