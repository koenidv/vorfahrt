import { AggregatedMetric, RequestMetric, RequestStatus, Timestamped } from "../../types";
import { sliceMetrics } from "./slice";
import _ from "lodash";

type byType<T> = keyof (Timestamped & T) | ((value: T) => number);

/**
 * Aggregates metrics by summing them up. **Entries must be sorted by timestamp.**
 * @param data List of objects \<T> with a timestamp property
 * @param by key to aggregate or function to get a number from the object
 * @param aggregateWindow Aggregate window in milliseconds
 * @param endTime The end time of the last aggregate window. If not specified, will use the last entry's timestamp.
 */
export function aggregateSumBy<T>(data: (Timestamped & T)[], by: byType<T>, aggregateWindow: number, endTime?: number): AggregatedMetric[] {
    return aggregateBy(_.sumBy, data, by, aggregateWindow, endTime);
}

/**
 * Aggregates metrics by their mean value across a window. **Entries must be sorted by timestamp.**
 * @param data List of objects \<T> with a timestamp property
 * @param by key to aggregate or function to get a number from the object
 * @param aggregateWindow Aggregate window in milliseconds
 * @param endTime The end time of the last aggregate window. If not specified, will use the last entry's timestamp.
 */
export function aggregateMeanBy<T>(data: (Timestamped & T)[], by: byType<T>, aggregateWindow: number, endTime?: number): AggregatedMetric[] {
    return aggregateBy(_.meanBy, data, by, aggregateWindow, endTime);
}

/**
 * Aggregates metrics
 * @param aggregateFn Function to aggregate values
 * @param data List of objects \<T> with a timestamp property
 * @param by key to aggregate or function to get a number from the object
 * @param aggregateWindow Aggregate window in milliseconds
 * @param endTime The end time of the last aggregate window. If not specified, will use the last entry's timestamp.
 */
export function aggregateBy<T>(
    aggregateFn: typeof _.sumBy,
    data: (Timestamped & T)[],
    by: byType<T>,
    aggregateWindow: number,
    endTime?: number
): AggregatedMetric[] {
    if (data.length === 0) return [];

    endTime = endTime || data[data.length - 1].timestamp;
    const startTime = data[0].timestamp-1;
    const windows: AggregatedMetric[] = [];

    for (let windowStart = endTime - aggregateWindow; windowStart >= startTime; windowStart -= aggregateWindow) {
        const end = windowStart + aggregateWindow;
        const values = sliceMetrics(data, windowStart, end);
        const aggregatedValue = aggregateFn(values, typeof by === "function" ? by : by as string);
        windows.push({
            value: aggregatedValue,
            _start: windowStart+1,
            _end: end,
        });
    }

    return windows;

}