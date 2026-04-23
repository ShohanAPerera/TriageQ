// ============================================================
// TriageQ — Custom Merge Sort Utility
// ============================================================
// Generic merge sort implementation.
// Used in ReportService to sort ServedRecord lists.
//
// Time Complexity:  O(n log n) — always (not adaptive)
// Space Complexity: O(n)       — uses auxiliary arrays during merge
//
// Usage:
//   mergeSort(list, (a, b) => b.waitingMinutes - a.waitingMinutes)
//   mergeSort(list, (a, b) =>
//     a.triageLevelAtServe !== b.triageLevelAtServe
//       ? a.triageLevelAtServe - b.triageLevelAtServe
//       : b.waitingMinutes - a.waitingMinutes
//   )
// ============================================================

export class MergeSortUtil {

  /**
   * Main entry: sorts arr in-place using merge sort — O(n log n)
   * @param arr  The array to sort (mutated in place)
   * @param comp Comparator: negative = a before b, positive = b before a
   */
  static mergeSort<T>(arr: T[], comp: (a: T, b: T) => number): T[] {
    if (arr.length <= 1) return arr;

    // Create a working copy so we don't mutate the original
    const copy = [...arr];
    MergeSortUtil._sort(copy, 0, copy.length - 1, comp);
    return copy;
  }

  // ----------------------------------------------------------
  // Recursive divide: split arr[lo..hi] in half and recurse
  // ----------------------------------------------------------
  private static _sort<T>(
    arr: T[],
    lo: number,
    hi: number,
    comp: (a: T, b: T) => number,
  ): void {
    if (lo >= hi) return;                    // Base case: single element

    const mid = Math.floor((lo + hi) / 2);  // Midpoint

    MergeSortUtil._sort(arr, lo, mid, comp);      // Sort left half
    MergeSortUtil._sort(arr, mid + 1, hi, comp);  // Sort right half
    MergeSortUtil._merge(arr, lo, mid, hi, comp); // Merge sorted halves
  }

  // ----------------------------------------------------------
  // Merge: combine arr[lo..mid] and arr[mid+1..hi] in sorted order
  // Uses temporary left/right arrays — O(n) auxiliary space
  // ----------------------------------------------------------
  private static _merge<T>(
    arr: T[],
    lo: number,
    mid: number,
    hi: number,
    comp: (a: T, b: T) => number,
  ): void {
    // Copy both halves into temporary arrays
    const left  = arr.slice(lo, mid + 1);
    const right = arr.slice(mid + 1, hi + 1);

    let i = 0;        // Pointer into left half
    let j = 0;        // Pointer into right half
    let k = lo;       // Pointer into original array

    // Merge step: pick the smaller element
    while (i < left.length && j < right.length) {
      if (comp(left[i], right[j]) <= 0) {
        arr[k++] = left[i++];   // Left element is smaller or equal
      } else {
        arr[k++] = right[j++];  // Right element is smaller
      }
    }

    // Drain remaining elements from left half
    while (i < left.length) {
      arr[k++] = left[i++];
    }

    // Drain remaining elements from right half
    while (j < right.length) {
      arr[k++] = right[j++];
    }
  }

  /**
   * Convenience: sort by waitingMinutes descending
   */
  static sortByWaitDesc<T extends { waitingMinutes: number }>(arr: T[]): T[] {
    return MergeSortUtil.mergeSort(arr, (a, b) => b.waitingMinutes - a.waitingMinutes);
  }

  /**
   * Convenience: sort by triageLevelAtServe asc, then waitingMinutes desc
   */
  static sortByTriageThenWait<T extends { triageLevelAtServe: number; waitingMinutes: number }>(
    arr: T[],
  ): T[] {
    return MergeSortUtil.mergeSort(arr, (a, b) => {
      if (a.triageLevelAtServe !== b.triageLevelAtServe) {
        return a.triageLevelAtServe - b.triageLevelAtServe; // asc
      }
      return b.waitingMinutes - a.waitingMinutes; // desc
    });
  }
}
