import React, { useState, useEffect } from 'react';
import { Database, ChevronDown, ChevronRight, Play, GitMerge, Link2 } from 'lucide-react';
import { heap, historyDLL } from '../services/store';
import { MergeSortUtil } from '../ds/MergeSortUtil';
import type { QueueItem, ServedRecord } from '../types';
import { Card, CardBody } from '../components/ui/Card';

export default function DSDemo() {
  const [heapSnapshot, setHeapSnapshot] = useState<QueueItem[]>([]);
  const [dllForward, setDllForward] = useState<ServedRecord[]>([]);
  const [dllReversed, setDllReversed] = useState<ServedRecord[]>([]);
  const [mergeSortTrace, setMergeSortTrace] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'heap' | 'dll' | 'sort'>('heap');

  // Refresh snapshots
  function refresh() {
    setHeapSnapshot(heap.getHeapSnapshot());
    setDllForward(historyDLL.toArray());
    setDllReversed(historyDLL.toArrayReversed());
  }

  useEffect(() => {
    refresh();
  }, []);

  function runMergeSortDemo() {
    const sample = historyDLL.toArray();
    if (sample.length < 2) {
      alert('Serve at least 2 patients first to see merge sort in action!');
      return;
    }

    // Create shuffled copy
    const shuffled = [...sample].sort(() => Math.random() - 0.5);

    const sorted = MergeSortUtil.sortByWaitDesc(shuffled);
    const sortedByTriage = MergeSortUtil.sortByTriageThenWait(shuffled);

    setMergeSortTrace({ shuffled, sorted, sortedByTriage });
  }

  const tabs = [
    { id: 'heap', label: 'Max-Heap', icon: Database },
    { id: 'dll',  label: 'Doubly Linked List', icon: Link2 },
    { id: 'sort', label: 'Merge Sort', icon: GitMerge },
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Database size={24} className="text-slate-600" />
          Data Structure Visualizer
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Live visualization of the custom DS implementations powering TriageQ.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id as any); refresh(); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === id
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* HEAP TAB */}
      {activeTab === 'heap' && (
        <div className="space-y-4">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-900">PatientQueueHeap (Max-Heap)</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Internal array representation — heap[0] is always the max element
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded-lg text-gray-600">
                    n = {heapSnapshot.length}
                  </span>
                  <button onClick={refresh} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-gray-600 font-medium">
                    Refresh
                  </button>
                </div>
              </div>

              {heapSnapshot.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Heap is empty. Register patients to see the heap structure.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Visual Tree */}
                  <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                    <div className="text-xs text-gray-500 mb-2 font-mono">// Heap tree visualization (array indices)</div>
                    <HeapTree items={heapSnapshot} />
                  </div>

                  {/* Array Representation */}
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-2">
                      Internal Array (heap[] — 0-indexed):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {heapSnapshot.map((item, idx) => (
                        <div
                          key={item.queueEntryId}
                          className={`rounded-xl border-2 p-3 text-center min-w-[80px] ${
                            idx === 0
                              ? 'bg-red-50 border-red-400'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="text-xs text-gray-400 font-mono mb-1">heap[{idx}]</div>
                          <div className={`font-black text-sm ${idx === 0 ? 'text-red-600' : 'text-gray-800'}`}>
                            {Math.round(item.score)}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">Q#{item.queueEntryId}</div>
                          {idx === 0 && (
                            <div className="text-xs text-red-500 font-bold mt-0.5">MAX</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Complexity Reference */}
                  <div className="bg-slate-800 rounded-xl p-4 text-white text-xs font-mono space-y-1">
                    <div className="text-slate-400 mb-2 font-sans text-xs font-semibold">Time Complexity Reference:</div>
                    <div><span className="text-green-400">insert()</span>     → O(log n) via bubbleUp()</div>
                    <div><span className="text-blue-400">peek()</span>       → O(1)     heap[0]</div>
                    <div><span className="text-yellow-400">extractMax()</span> → O(log n) via bubbleDown()</div>
                    <div><span className="text-orange-400">updateKey()</span>  → O(log n) bubbleUp() or bubbleDown()</div>
                    <div><span className="text-red-400">remove()</span>      → O(log n) via score=∞ trick + extractMax()</div>
                    <div className="mt-2 text-slate-400">
                      indexMap: HashMap&lt;queueEntryId, heapIndex&gt; for O(1) lookup
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* DLL TAB */}
      {activeTab === 'dll' && (
        <div className="space-y-4">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-900">ServedHistoryDLL (Doubly Linked List)</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Each served patient is a node with prev/next pointers
                  </p>
                </div>
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded-lg text-gray-600">
                  n = {dllForward.length}
                </span>
              </div>

              {dllForward.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  DLL is empty. Serve some patients to populate history.
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Forward traversal */}
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                      <ChevronRight size={12} />
                      Forward Traversal (HEAD → TAIL):
                    </div>
                    <div className="flex items-center gap-1 overflow-x-auto pb-2">
                      <DLLNode label="NULL" isNull />
                      <DLLArrow dir="right" />
                      {dllForward.map((record, idx) => (
                        <React.Fragment key={record.id}>
                          <DLLNode
                            label={record.patient?.fullName?.split(' ')[0] ?? `P${record.patientId}`}
                            sub={`${record.waitingMinutes}m wait`}
                            isHead={idx === 0}
                            isTail={idx === dllForward.length - 1}
                          />
                          {idx < dllForward.length - 1 && <DLLArrow dir="both" />}
                        </React.Fragment>
                      ))}
                      <DLLArrow dir="right" />
                      <DLLNode label="NULL" isNull />
                    </div>
                  </div>

                  {/* Backward traversal */}
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                      <ChevronDown size={12} className="-rotate-90" />
                      Backward Traversal (TAIL → HEAD):
                    </div>
                    <div className="flex items-center gap-1 overflow-x-auto pb-2">
                      <DLLNode label="NULL" isNull />
                      <DLLArrow dir="right" />
                      {dllReversed.map((record, idx) => (
                        <React.Fragment key={record.id}>
                          <DLLNode
                            label={record.patient?.fullName?.split(' ')[0] ?? `P${record.patientId}`}
                            sub={`T${record.triageLevelAtServe}`}
                            isHead={idx === 0}
                            isTail={idx === dllReversed.length - 1}
                          />
                          {idx < dllReversed.length - 1 && <DLLArrow dir="both" />}
                        </React.Fragment>
                      ))}
                      <DLLArrow dir="right" />
                      <DLLNode label="NULL" isNull />
                    </div>
                  </div>

                  {/* Code snippet */}
                  <div className="bg-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 space-y-1">
                    <div className="text-slate-500">// DLL Node structure:</div>
                    <div><span className="text-blue-400">class</span> <span className="text-yellow-400">DLLNode</span> {'{'}</div>
                    <div className="pl-4"><span className="text-green-400">data</span>: ServedRecord;</div>
                    <div className="pl-4"><span className="text-green-400">prev</span>: DLLNode | null;</div>
                    <div className="pl-4"><span className="text-green-400">next</span>: DLLNode | null;</div>
                    <div>{'}'}</div>
                    <div className="mt-2 text-slate-500">// addLast() — O(1):</div>
                    <div>node.prev = <span className="text-purple-400">this</span>.tail;</div>
                    <div><span className="text-purple-400">this</span>.tail.next = node;</div>
                    <div><span className="text-purple-400">this</span>.tail = node;</div>
                  </div>

                  {/* Complexity */}
                  <div className="bg-slate-800 rounded-xl p-4 text-white text-xs font-mono space-y-1">
                    <div className="text-slate-400 mb-2 font-sans text-xs font-semibold">DLL Time Complexities:</div>
                    <div><span className="text-green-400">addLast()</span>     → O(1) — direct tail pointer access</div>
                    <div><span className="text-green-400">addFirst()</span>    → O(1) — direct head pointer access</div>
                    <div><span className="text-blue-400">removeFirst()</span> → O(1)</div>
                    <div><span className="text-blue-400">removeLast()</span>  → O(1)</div>
                    <div><span className="text-yellow-400">toArray()</span>     → O(n) — forward traversal</div>
                    <div><span className="text-yellow-400">toArrayReversed()</span> → O(n) — backward traversal</div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* MERGE SORT TAB */}
      {activeTab === 'sort' && (
        <div className="space-y-4">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-900">MergeSortUtil — Custom Merge Sort</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    O(n log n) always. Stable sort with O(n) auxiliary space.
                  </p>
                </div>
                <button
                  onClick={runMergeSortDemo}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700"
                >
                  <Play size={14} />
                  Run Demo
                </button>
              </div>

              {/* Algorithm pseudocode */}
              <div className="bg-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 mb-4 space-y-0.5">
                <div className="text-slate-500">// MergeSortUtil.mergeSort(arr, comparator)</div>
                <div><span className="text-blue-400">function</span> <span className="text-yellow-400">_sort</span>(arr, lo, hi, comp):</div>
                <div className="pl-4"><span className="text-slate-500">// Base case</span></div>
                <div className="pl-4"><span className="text-purple-400">if</span> lo &gt;= hi: <span className="text-purple-400">return</span></div>
                <div className="pl-4">mid = floor((lo + hi) / 2)</div>
                <div className="pl-4"><span className="text-yellow-400">_sort</span>(arr, lo, mid, comp)      <span className="text-slate-500">// left half</span></div>
                <div className="pl-4"><span className="text-yellow-400">_sort</span>(arr, mid+1, hi, comp)   <span className="text-slate-500">// right half</span></div>
                <div className="pl-4"><span className="text-yellow-400">_merge</span>(arr, lo, mid, hi, comp) <span className="text-slate-500">// merge</span></div>
                <div className="mt-2"><span className="text-blue-400">function</span> <span className="text-yellow-400">_merge</span>(arr, lo, mid, hi, comp):</div>
                <div className="pl-4">left  = arr[lo..mid]     <span className="text-slate-500">// copy to temp</span></div>
                <div className="pl-4">right = arr[mid+1..hi]   <span className="text-slate-500">// copy to temp</span></div>
                <div className="pl-4">i=0, j=0, k=lo</div>
                <div className="pl-4"><span className="text-purple-400">while</span> i &lt; left.len &amp;&amp; j &lt; right.len:</div>
                <div className="pl-8"><span className="text-purple-400">if</span> comp(left[i], right[j]) &lt;= 0: arr[k++] = left[i++]</div>
                <div className="pl-8"><span className="text-purple-400">else</span>: arr[k++] = right[j++]</div>
              </div>

              {mergeSortTrace ? (
                <div className="space-y-4">
                  <TraceStep
                    label="① Input (shuffled)"
                    color="gray"
                    items={mergeSortTrace.shuffled}
                    keyFn={(r: ServedRecord) => `${r.waitingMinutes}m`}
                  />
                  <TraceStep
                    label="② Sorted by Wait (desc)"
                    color="green"
                    items={mergeSortTrace.sorted}
                    keyFn={(r: ServedRecord) => `${r.waitingMinutes}m`}
                  />
                  <TraceStep
                    label="③ Sorted by Triage (asc) + Wait (desc)"
                    color="blue"
                    items={mergeSortTrace.sortedByTriage}
                    keyFn={(r: ServedRecord) => `T${r.triageLevelAtServe}|${r.waitingMinutes}m`}
                  />
                  <div className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
                    <span className="font-semibold">Complexity:</span> O(n log n) where n = {mergeSortTrace.shuffled.length} records
                    → approximately {Math.round(mergeSortTrace.shuffled.length * Math.log2(mergeSortTrace.shuffled.length || 1))} comparisons
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Click "Run Demo" to see merge sort in action with real served records.
                  <br />
                  (Requires at least 2 served patients in history)
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

// ---- Sub-components ----

function HeapTree({ items }: { items: QueueItem[] }) {
  if (items.length === 0) return null;

  // Show up to 7 nodes (3 levels)
  const display = items.slice(0, Math.min(7, items.length));

  return (
    <div className="flex flex-col items-center gap-3 text-white font-mono text-xs min-w-[400px]">
      {/* Level 0 — root */}
      <div className="flex justify-center">
        <HeapNode item={display[0]} idx={0} isRoot />
      </div>

      {/* Level 1 */}
      {display.length > 1 && (
        <>
          <div className="flex justify-center gap-8 w-full relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-3 w-px bg-slate-600" />
          </div>
          <div className="flex justify-center gap-12">
            {display[1] && <HeapNode item={display[1]} idx={1} />}
            {display[2] && <HeapNode item={display[2]} idx={2} />}
          </div>
        </>
      )}

      {/* Level 2 */}
      {display.length > 3 && (
        <div className="flex justify-center gap-4">
          {display[3] && <HeapNode item={display[3]} idx={3} />}
          {display[4] && <HeapNode item={display[4]} idx={4} />}
          {display[5] && <HeapNode item={display[5]} idx={5} />}
          {display[6] && <HeapNode item={display[6]} idx={6} />}
        </div>
      )}

      {items.length > 7 && (
        <div className="text-slate-500 text-center">... +{items.length - 7} more nodes</div>
      )}
    </div>
  );
}

function HeapNode({ item, idx, isRoot }: { item: QueueItem; idx: number; isRoot?: boolean }) {
  return (
    <div className={`rounded-xl border-2 p-2 text-center min-w-[70px] ${
      isRoot
        ? 'border-red-500 bg-red-900/40'
        : 'border-slate-600 bg-slate-700'
    }`}>
      <div className="text-slate-400 text-xs">[{idx}]</div>
      <div className={`font-black text-sm ${isRoot ? 'text-red-400' : 'text-white'}`}>
        {Math.round(item.score)}
      </div>
      <div className="text-slate-400 text-xs">Q#{item.queueEntryId}</div>
    </div>
  );
}

function DLLNode({ label, sub, isHead, isTail, isNull }: any) {
  if (isNull) {
    return (
      <div className="shrink-0 border border-dashed border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-400 font-mono">
        NULL
      </div>
    );
  }

  return (
    <div className={`shrink-0 border-2 rounded-xl px-3 py-2 text-center min-w-[90px] ${
      isHead ? 'border-purple-500 bg-purple-50' : isTail ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
    }`}>
      {isHead && <div className="text-xs font-bold text-purple-500 mb-0.5">HEAD</div>}
      {isTail && <div className="text-xs font-bold text-blue-500 mb-0.5">TAIL</div>}
      <div className="font-semibold text-sm text-gray-800">{label}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function DLLArrow({ dir }: { dir: 'right' | 'both' }) {
  return (
    <div className="shrink-0 text-gray-400 font-mono text-xs flex flex-col items-center">
      {dir === 'both' ? (
        <span>⇄</span>
      ) : (
        <span>→</span>
      )}
    </div>
  );
}

function TraceStep({
  label,
  color,
  items,
  keyFn,
}: {
  label: string;
  color: string;
  items: ServedRecord[];
  keyFn: (r: ServedRecord) => string;
}) {
  const colors: Record<string, string> = {
    gray:  'bg-gray-50 border-gray-200 text-gray-700',
    green: 'bg-green-50 border-green-300 text-green-700',
    blue:  'bg-blue-50 border-blue-300 text-blue-700',
  };

  return (
    <div>
      <div className="text-xs font-semibold text-gray-600 mb-1">{label}</div>
      <div className="flex flex-wrap gap-1">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className={`border rounded-lg px-2 py-1 text-xs font-mono ${colors[color]}`}
          >
            [{idx}] {keyFn(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
