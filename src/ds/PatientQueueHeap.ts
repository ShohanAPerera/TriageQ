// ============================================================
// TriageQ — Custom Max-Heap Priority Queue
// ============================================================
// Implements a Max-Heap ordered by priority score (descending).
// Tie-breaker: earlier arrivalTime wins (lower timestamp = higher priority).
//
// Time Complexities:
//   insert()      -> O(log n)  via bubbleUp
//   peek()        -> O(1)
//   extractMax()  -> O(log n)  via bubbleDown
//   updateKey()   -> O(log n)  via bubbleUp + bubbleDown
//   remove()      -> O(log n)  via set score=Infinity + extractMax trick
//   size()        -> O(1)
//
// Internal storage: Array<QueueItem> (0-indexed)
// Index tracking:   Map<queueEntryId, heapIndex>
// ============================================================

import type { QueueItem } from '../types';

export class PatientQueueHeap {
  /** Internal heap array (0-indexed) */
  private heap: QueueItem[] = [];

  /** Maps queueEntryId -> current index in heap array */
  private indexMap: Map<number, number> = new Map();

  // ----------------------------------------------------------
  // Comparison: returns true if item[i] should be above item[j]
  // Higher score wins; on tie, earlier arrivalTime wins.
  // ----------------------------------------------------------
  private hasHigherPriority(a: QueueItem, b: QueueItem): boolean {
    if (a.score !== b.score) return a.score > b.score;
    // Tie-break: earlier arrival time = higher priority
    return new Date(a.arrivalTime).getTime() < new Date(b.arrivalTime).getTime();
  }

  // ----------------------------------------------------------
  // Swap two elements and update indexMap
  // ----------------------------------------------------------
  private swap(i: number, j: number): void {
    const tmp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = tmp;

    this.indexMap.set(this.heap[i].queueEntryId, i);
    this.indexMap.set(this.heap[j].queueEntryId, j);
  }

  // ----------------------------------------------------------
  // BubbleUp: restore heap property upward from index i
  // Used after insert or score increase
  // ----------------------------------------------------------
  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.hasHigherPriority(this.heap[i], this.heap[parent])) {
        this.swap(i, parent);
        i = parent;
      } else {
        break;
      }
    }
  }

  // ----------------------------------------------------------
  // BubbleDown: restore heap property downward from index i
  // Used after extractMax or score decrease
  // ----------------------------------------------------------
  private bubbleDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let largest = i;
      const left  = 2 * i + 1;
      const right = 2 * i + 2;

      if (left < n && this.hasHigherPriority(this.heap[left], this.heap[largest])) {
        largest = left;
      }
      if (right < n && this.hasHigherPriority(this.heap[right], this.heap[largest])) {
        largest = right;
      }

      if (largest !== i) {
        this.swap(i, largest);
        i = largest;
      } else {
        break;
      }
    }
  }

  // ----------------------------------------------------------
  // PUBLIC API
  // ----------------------------------------------------------

  /**
   * Insert a new QueueItem into the heap — O(log n)
   */
  insert(item: QueueItem): void {
    const idx = this.heap.length;
    this.heap.push(item);
    this.indexMap.set(item.queueEntryId, idx);
    this.bubbleUp(idx);
  }

  /**
   * Peek at the highest-priority item without removing — O(1)
   */
  peek(): QueueItem | null {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  /**
   * Extract (remove and return) the highest-priority item — O(log n)
   */
  extractMax(): QueueItem | null {
    if (this.heap.length === 0) return null;

    const max = this.heap[0];
    const last = this.heap.pop()!;
    this.indexMap.delete(max.queueEntryId);

    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.indexMap.set(last.queueEntryId, 0);
      this.bubbleDown(0);
    }

    return max;
  }

  /**
   * Update the score of an existing entry — O(log n)
   * Calls bubbleUp + bubbleDown to restore heap property.
   */
  updateKey(queueEntryId: number, newScore: number, newExplain: string, newStatus?: string): void {
    const idx = this.indexMap.get(queueEntryId);
    if (idx === undefined) return;

    const oldScore = this.heap[idx].score;
    this.heap[idx] = {
      ...this.heap[idx],
      score: newScore,
      scoreExplain: newExplain,
      status: (newStatus as any) ?? this.heap[idx].status,
    };

    // Decide whether to bubble up or down
    if (newScore > oldScore) {
      this.bubbleUp(idx);
    } else {
      this.bubbleDown(idx);
    }
  }

  /**
   * Remove an item by queueEntryId — O(log n)
   * Strategy: set score to +Infinity, bubble to root, extractMax.
   */
  remove(queueEntryId: number): boolean {
    const idx = this.indexMap.get(queueEntryId);
    if (idx === undefined) return false;

    // Set score to max so it bubbles to root
    this.heap[idx] = { ...this.heap[idx], score: Infinity };
    this.bubbleUp(idx);
    this.extractMax();
    return true;
  }

  /**
   * Get all items in heap order (for display — sorted copy)
   */
  getAllSorted(): QueueItem[] {
    // Return a sorted copy without modifying the heap
    return [...this.heap].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime();
    });
  }

  /**
   * Check if an entry exists in the heap
   */
  has(queueEntryId: number): boolean {
    return this.indexMap.has(queueEntryId);
  }

  /**
   * Current number of items in heap
   */
  size(): number {
    return this.heap.length;
  }

  /**
   * Clear the heap entirely
   */
  clear(): void {
    this.heap = [];
    this.indexMap.clear();
  }

  /**
   * Get a snapshot of the heap array (for debugging)
   */
  getHeapSnapshot(): QueueItem[] {
    return [...this.heap];
  }
}
