import { Timestamped } from "../../types"

/**
 * Efficiently slices metrics by timestamp. **Values must be sorted by timestamp.**
 * @param values List of objects \<T> with a timestamp property, sorted by timestamp
 * @param startTime earliest timestamp to include (inclusive)
 * @param endTime latest timestamp to include (inclusive)
 * @returns List of values \<T> with timestamp between startTime and endTime
 */
export function sliceMetrics<T>(values: (Timestamped & T)[], startTime: number, endTime: number): (Timestamped & T)[] {
    // todo lodash binary search. values are sorted by timestamp
    return values.filter((value) => {
        return value.timestamp >= startTime && value.timestamp <= endTime;
    });
} 