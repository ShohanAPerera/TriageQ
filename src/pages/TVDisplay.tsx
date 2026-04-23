import React, { useEffect, useState } from 'react';
import { getLiveQueue, getServedHistory } from '../services/store';
import { TRIAGE_LABELS, TRIAGE_COLORS } from '../types';
import type { QueueEntry, ServedRecord } from '../types';
import { Activity, Clock } from 'lucide-react';

export default function TVDisplay() {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [recentlyServed, setRecentlyServed] = useState<ServedRecord[]>([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Clock tick
    const clockTimer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Initial fetch
    refreshData();

    // Data polling
    const dataTimer = setInterval(() => {
      refreshData();
    }, 3000); // 3 seconds refresh for near real-time feel

    return () => {
      clearInterval(clockTimer);
      clearInterval(dataTimer);
    };
  }, []);

  function refreshData() {
    setQueue(getLiveQueue());
    setRecentlyServed(getServedHistory());
  }

  // Get current serving patient (most recently served today)
  const nowServing = recentlyServed.length > 0 ? recentlyServed[0] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden flex flex-col font-sans">
      {/* Top Header */}
      <header className="px-10 py-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.4)]">
            <Activity size={36} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">TriageQ Viewer</h1>
            <p className="text-xl text-slate-400 font-medium">Outpatient Clinic Waiting Area</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-5xl font-black tracking-tighter">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xl text-slate-400 font-medium">
              {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <Clock size={48} className="text-slate-600" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Column: Now Serving */}
        <section className="w-2/5 p-10 flex flex-col border-r border-slate-800 bg-slate-900/20">
          <h2 className="text-3xl font-bold text-slate-500 uppercase tracking-widest mb-8">
            Now Serving
          </h2>

          {nowServing ? (
            <div className="flex-1 flex flex-col items-center justify-center -mt-10 animate-pulse-slow">
              <div className="text-[10rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 mb-6 drop-shadow-2xl text-center break-words">
                {nowServing.patient?.clinicRef || 'Patient'}
              </div>
              
              <div className={`px-10 py-4 rounded-full text-3xl font-bold uppercase tracking-widest ${TRIAGE_COLORS[nowServing.triageLevelAtServe]} shadow-[0_0_50px_rgba(0,0,0,0.5)]`}>
                Counter A
              </div>
              
              <p className="mt-8 text-2xl text-slate-400 font-medium text-center max-w-md">
                Please proceed to the examination room or triage counter immediately.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-50">
              <Activity size={120} className="text-slate-700 mb-6" />
              <p className="text-3xl font-medium text-slate-600">Waiting for patients...</p>
            </div>
          )}
        </section>

        {/* Right Column: Up Next */}
        <section className="w-3/5 p-10 flex flex-col bg-slate-950">
          <h2 className="text-3xl font-bold text-slate-500 uppercase tracking-widest mb-8 flex justify-between items-center">
            <span>Up Next in Queue</span>
            <span className="text-xl bg-slate-800 text-slate-300 px-4 py-1.5 rounded-full">
              {queue.length} Waiting
            </span>
          </h2>

          <div className="flex-1 overflow-hidden">
            {queue.length > 0 ? (
              <div className="space-y-4">
                {queue.slice(0, 7).map((entry, idx) => (
                  <div 
                    key={entry.id} 
                    className={`flex items-center p-6 rounded-2xl border transition-all ${
                      idx === 0 
                        ? 'bg-slate-800/80 border-slate-700 scale-[1.02] shadow-2xl z-10 relative' 
                        : 'bg-slate-900/50 border-slate-800'
                    }`}
                  >
                    <div className="w-20 font-black text-4xl text-slate-600">
                      #{idx + 1}
                    </div>
                    
                    <div className="flex-1">
                      <div className={`text-5xl font-black ${idx === 0 ? 'text-white' : 'text-slate-300'} tracking-tight`}>
                        {entry.patient?.clinicRef || 'N/A'}
                      </div>
                      {/* Privacy: We do NOT show full name here! */}
                    </div>
                    
                    <div className="text-right flex flex-col items-end justify-center">
                      <div className={`text-2xl font-bold uppercase tracking-widest px-6 py-2 rounded-xl text-center min-w-[200px] ${TRIAGE_COLORS[entry.triageLevel]}`}>
                        {TRIAGE_LABELS[entry.triageLevel]}
                      </div>
                    </div>
                  </div>
                ))}
                
                {queue.length > 7 && (
                  <div className="text-center pt-4 text-xl text-slate-500 font-medium">
                    + {queue.length - 7} more patients waiting
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-40">
                <p className="text-4xl text-slate-600 font-medium tracking-tight">Queue is currently empty</p>
              </div>
            )}
          </div>
        </section>
      </main>
      
      {/* Footer Marquee */}
      <footer className="bg-slate-900 border-t border-slate-800 py-3 overflow-hidden">
        <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] text-slate-400 text-lg font-medium tracking-wide">
          <span className="mx-8">•</span> Welcome to TriageQ Clinic
          <span className="mx-8">•</span> Please prepare your Identity Card or Clinic Reference number when your ID is called
          <span className="mx-8">•</span> If you experience worsening symptoms like chest pain or extreme shortness of breath, please alert the staff immediately
          <span className="mx-8">•</span> Thank you for your patience
        </div>
      </footer>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
