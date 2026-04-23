import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Activity,
  TrendingUp,
  AlertTriangle,
  UserPlus,
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import { getAllQueueEntries, getServedHistory, heap, historyDLL } from '../services/store';
import { TRIAGE_LABELS, TRIAGE_BADGE_COLORS } from '../types';
import { Badge } from '../components/ui/Badge';
import { Card, CardBody } from '../components/ui/Card';

export default function Dashboard() {
  const [stats, setStats] = useState({
    waiting: 0,
    deferred: 0,
    served: 0,
    canceled: 0,
    heapSize: 0,
    dllSize: 0,
    criticalWaiting: 0,
  });
  const [topPatient, setTopPatient] = useState<any>(null);
  const [recentServed, setRecentServed] = useState<any[]>([]);

  useEffect(() => {
    const refresh = () => {
      const entries = getAllQueueEntries();
      const waiting   = entries.filter((e) => e.status === 'WAITING').length;
      const deferred  = entries.filter((e) => e.status === 'DEFERRED').length;
      const served    = entries.filter((e) => e.status === 'SERVED').length;
      const canceled  = entries.filter((e) => e.status === 'CANCELED').length;
      const critical  = entries.filter((e) => e.status === 'WAITING' && e.triageLevel === 1).length;

      setStats({
        waiting,
        deferred,
        served,
        canceled,
        heapSize: heap.size(),
        dllSize: historyDLL.size(),
        criticalWaiting: critical,
      });

      const top = heap.peek();
      setTopPatient(top);

      const history = getServedHistory();
      setRecentServed(history.slice(0, 5));
    };

    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toLocaleDateString('en-MY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">{today}</p>
      </div>

      {/* Alert: Critical patients */}
      {stats.criticalWaiting > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <AlertTriangle className="text-red-500 shrink-0" size={20} />
          <div>
            <div className="font-semibold text-red-800">
              {stats.criticalWaiting} Critical Patient{stats.criticalWaiting > 1 ? 's' : ''} Waiting!
            </div>
            <div className="text-sm text-red-600">Triage Level 1 — Immediate attention required.</div>
          </div>
          <Link
            to="/queue"
            className="ml-auto shrink-0 text-sm font-semibold text-red-700 hover:text-red-900 flex items-center gap-1"
          >
            View Queue <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Waiting"
          value={stats.waiting}
          icon={<Clock size={22} className="text-blue-500" />}
          color="bg-blue-50"
          textColor="text-blue-700"
        />
        <StatCard
          label="Deferred"
          value={stats.deferred}
          icon={<Activity size={22} className="text-purple-500" />}
          color="bg-purple-50"
          textColor="text-purple-700"
        />
        <StatCard
          label="Served Today"
          value={stats.served}
          icon={<CheckCircle size={22} className="text-green-500" />}
          color="bg-green-50"
          textColor="text-green-700"
        />
        <StatCard
          label="Canceled"
          value={stats.canceled}
          icon={<XCircle size={22} className="text-red-400" />}
          color="bg-red-50"
          textColor="text-red-700"
        />
      </div>

      {/* DS Status + Next Patient */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Next Patient Card */}
        <Card className="lg:col-span-2">
          <CardBody>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-red-500" />
                Next to Serve
              </h2>
              <Link
                to="/queue"
                className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
              >
                View All <ChevronRight size={12} />
              </Link>
            </div>

            {topPatient ? (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{topPatient.patientId ? `Patient #${topPatient.patientId}` : 'Unknown'}</div>
                    <div className="text-sm text-gray-500 mt-0.5">Queue Entry #{topPatient.queueEntryId}</div>
                    <div className="mt-2">
                      <Badge className={TRIAGE_BADGE_COLORS[topPatient.triageLevel]}>
                        T{topPatient.triageLevel} — {TRIAGE_LABELS[topPatient.triageLevel]}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 font-mono bg-white rounded-lg p-2 border">
                      {topPatient.scoreExplain}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-3xl font-black text-red-600">{Math.round(topPatient.score)}</div>
                    <div className="text-xs text-gray-500 font-medium">Priority Score</div>
                  </div>
                </div>
                <Link
                  to="/queue"
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-sm font-semibold transition-colors"
                >
                  Go to Queue <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle size={40} className="mx-auto mb-2 opacity-30" />
                <p className="font-medium">Queue is empty</p>
                <p className="text-sm">All patients have been served</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* DS Status Card */}
        <Card>
          <CardBody>
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-slate-500" />
              DS Runtime Status
            </h2>
            <div className="space-y-3">
              <DSStatusRow
                label="Max-Heap Size"
                value={stats.heapSize}
                badge="O(log n)"
                color="text-orange-600"
                desc="Active queue entries"
              />
              <DSStatusRow
                label="DLL Size"
                value={stats.dllSize}
                badge="O(1) append"
                color="text-blue-600"
                desc="Served history nodes"
              />
              <div className="pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
                  Heap Preview
                </div>
                {topPatient ? (
                  <div className="font-mono text-xs bg-gray-50 rounded-lg p-2 space-y-1">
                    <div className="text-red-600 font-bold">▼ Root (Max)</div>
                    <div className="text-gray-700">
                      Q#{topPatient.queueEntryId} — Score: {Math.round(topPatient.score)}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 italic">Heap is empty</div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Served + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Served */}
        <Card className="lg:col-span-2">
          <CardBody>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" />
                Recently Served
              </h2>
              <Link
                to="/history"
                className="text-xs text-green-600 hover:text-green-800 font-semibold flex items-center gap-1"
              >
                View All <ChevronRight size={12} />
              </Link>
            </div>
            {recentServed.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">
                No patients served yet today.
              </div>
            ) : (
              <div className="space-y-2">
                {recentServed.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle size={14} className="text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-800 truncate">
                        {r.patient?.fullName ?? `Patient #${r.patientId}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        Waited {r.waitingMinutes} min · Triage {r.triageLevelAtServe}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 shrink-0">
                      {new Date(r.servedTime).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardBody>
            <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <QuickAction
                to="/register"
                icon={<UserPlus size={16} className="text-blue-600" />}
                label="Register Patient"
                desc="Add new walk-in patient"
                color="hover:bg-blue-50 hover:border-blue-200"
              />
              <QuickAction
                to="/queue"
                icon={<ClipboardIcon size={16} className="text-red-600" />}
                label="Serve Next"
                desc="Go to live queue board"
                color="hover:bg-red-50 hover:border-red-200"
              />
              <QuickAction
                to="/history"
                icon={<Clock size={16} className="text-purple-600" />}
                label="View History"
                desc="Browse served records"
                color="hover:bg-purple-50 hover:border-purple-200"
              />
              <QuickAction
                to="/reports"
                icon={<BarChart3 size={16} className="text-green-600" />}
                label="Daily Report"
                desc="Statistics & merge sort"
                color="hover:bg-green-50 hover:border-green-200"
              />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

// ---- Sub-components ----

function StatCard({ label, value, icon, color, textColor }: any) {
  return (
    <Card>
      <CardBody className="!py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
            {icon}
          </div>
          <div>
            <div className={`text-2xl font-black ${textColor}`}>{value}</div>
            <div className="text-xs text-gray-500 font-medium">{label}</div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function DSStatusRow({ label, value, badge, color, desc }: any) {
  return (
    <div className="flex items-center gap-2">
      <div className={`text-2xl font-black ${color} w-10 text-right shrink-0`}>{value}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800">{label}</div>
        <div className="text-xs text-gray-500">{desc}</div>
      </div>
      <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full shrink-0">
        {badge}
      </span>
    </div>
  );
}

function QuickAction({ to, icon, label, desc, color }: any) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 p-3 rounded-xl border border-gray-100 transition-colors ${color}`}
    >
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-200">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800">{label}</div>
        <div className="text-xs text-gray-500">{desc}</div>
      </div>
      <ChevronRight size={14} className="text-gray-400 shrink-0" />
    </Link>
  );
}

function ClipboardIcon({ size, className }: { size: number; className: string }) {
  return <Activity size={size} className={className} />;
}
