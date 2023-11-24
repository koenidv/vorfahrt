import _ from "lodash";
import { Timestamped } from "../../types"

/**
 * Efficiently slices metrics by timestamp. **Values must be sorted by timestamp.**
 * @param values List of objects \<T> with a timestamp property, sorted by timestamp
 * @param startTime earliest timestamp to include (inclusive)
 * @param endTime latest timestamp to include (inclusive)
 * @returns List of values \<T> with timestamp between startTime and endTime
 */
export function sliceMetricsValues<T>(values: (Timestamped & T)[], startTime: number, endTime: number): (Timestamped & T)[] {
    const startIndex = _.sortedIndexBy(values, { timestamp: startTime }, "timestamp");
    const endIndex = _.sortedLastIndexBy(values, { timestamp: endTime }, "timestamp");
    return values.slice(startIndex, endIndex);
}

export const sliceMetrics =
    (start: number, end: number) =>
        <T>(values: (Timestamped & T)[]) =>
            sliceMetricsValues(values, start, end);