// ============================================================
// TriageQ — Custom Doubly Linked List for Served History
// ============================================================
// Mirrors the DB served_record table in memory.
// Supports O(1) append (addLast) and O(n) forward/backward traversal.
//
// Node structure:
//   data: ServedRecord
//   prev: Node | null
//   next: Node | null
//
// Time Complexities:
//   addLast()     -> O(1)
//   addFirst()    -> O(1)
//   removeFirst() -> O(1)
//   removeLast()  -> O(1)
//   toArray()     -> O(n)  (forward traversal)
//   toArrayRev()  -> O(n)  (backward traversal)
//   size()        -> O(1)
// ============================================================

import type { ServedRecord } from '../types';

// DLL Node
class DLLNode {
  data: ServedRecord;
  prev: DLLNode | null = null;
  next: DLLNode | null = null;

  constructor(data: ServedRecord) {
    this.data = data;
  }
}

export class ServedHistoryDLL {
  private head: DLLNode | null = null;
  private tail: DLLNode | null = null;
  private _size: number = 0;

  // ----------------------------------------------------------
  // Add a record to the end of the list — O(1)
  // Called when a patient is served (append served record)
  // ----------------------------------------------------------
  addLast(record: ServedRecord): void {
    const node = new DLLNode(record);

    if (this.tail === null) {
      // List is empty
      this.head = node;
      this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }

    this._size++;
  }

  // ----------------------------------------------------------
  // Add a record to the front of the list — O(1)
  // ----------------------------------------------------------
  addFirst(record: ServedRecord): void {
    const node = new DLLNode(record);

    if (this.head === null) {
      this.head = node;
      this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }

    this._size++;
  }

  // ----------------------------------------------------------
  // Remove from front — O(1)
  // ----------------------------------------------------------
  removeFirst(): ServedRecord | null {
    if (!this.head) return null;
    const data = this.head.data;

    if (this.head === this.tail) {
      this.head = null;
      this.tail = null;
    } else {
      this.head = this.head.next;
      if (this.head) this.head.prev = null;
    }

    this._size--;
    return data;
  }

  // ----------------------------------------------------------
  // Remove from tail — O(1)
  // ----------------------------------------------------------
  removeLast(): ServedRecord | null {
    if (!this.tail) return null;
    const data = this.tail.data;

    if (this.head === this.tail) {
      this.head = null;
      this.tail = null;
    } else {
      this.tail = this.tail.prev;
      if (this.tail) this.tail.next = null;
    }

    this._size--;
    return data;
  }

  // ----------------------------------------------------------
  // Forward traversal — O(n)
  // Returns array of served records from first to last
  // ----------------------------------------------------------
  toArray(): ServedRecord[] {
    const result: ServedRecord[] = [];
    let current = this.head;
    while (current !== null) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  // ----------------------------------------------------------
  // Backward traversal — O(n)
  // Returns array of served records from last to first
  // ----------------------------------------------------------
  toArrayReversed(): ServedRecord[] {
    const result: ServedRecord[] = [];
    let current = this.tail;
    while (current !== null) {
      result.push(current.data);
      current = current.prev;
    }
    return result;
  }

  // ----------------------------------------------------------
  // Find by patient ID — O(n)
  // ----------------------------------------------------------
  findByPatientId(patientId: number): ServedRecord | null {
    let current = this.head;
    while (current !== null) {
      if (current.data.patientId === patientId) return current.data;
      current = current.next;
    }
    return null;
  }

  // ----------------------------------------------------------
  // Filter by date — O(n)
  // ----------------------------------------------------------
  filterByDate(dateStr: string): ServedRecord[] {
    const result: ServedRecord[] = [];
    let current = this.head;
    while (current !== null) {
      const recordDate = current.data.servedTime.split('T')[0];
      if (recordDate === dateStr) result.push(current.data);
      current = current.next;
    }
    return result;
  }

  // ----------------------------------------------------------
  // Load all records (e.g., from DB load on startup)
  // ----------------------------------------------------------
  loadAll(records: ServedRecord[]): void {
    this.head = null;
    this.tail = null;
    this._size = 0;
    for (const r of records) {
      this.addLast(r);
    }
  }

  // ----------------------------------------------------------
  // Current number of nodes — O(1)
  // ----------------------------------------------------------
  size(): number {
    return this._size;
  }

  // ----------------------------------------------------------
  // Peek at head and tail — O(1)
  // ----------------------------------------------------------
  peekHead(): ServedRecord | null {
    return this.head?.data ?? null;
  }

  peekTail(): ServedRecord | null {
    return this.tail?.data ?? null;
  }

  // ----------------------------------------------------------
  // Clear the entire DLL
  // ----------------------------------------------------------
  clear(): void {
    this.head = null;
    this.tail = null;
    this._size = 0;
  }
}
