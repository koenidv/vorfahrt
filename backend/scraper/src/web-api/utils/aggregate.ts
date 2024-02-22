import { AggregatedMetric, RequestMetric, RequestStatus, Timestamped } from "../../types";
import { sliceMetrics } from "./slice";
import _ from "lodash/fp";

type byType<T> = keyof (Timestamped & T) | ((value: T) => number);

/**
 * Aggregates metrics by summing them up. **Entries must be sorted by timestamp.**
 * Will only include *complete* aggregate windows, i.e. will return [] if aggregateWindow > endTime-startTime
 * @param data List of objects \<T> with a timestamp property
 * @param by key to aggregate or function to get a number from the object
 * @param aggregateWindow Aggregate window in milliseconds
 * @param endTime The end time of the last aggregate window. If not specified, will use the last entry's timestamp.
 */
export function aggregateSumByCategory<T>(data: (Timestamped & T)[], category: keyof T, value: byType<T>, aggregateWindow: number, startTime?: number, endTime?: number): AggregatedMetric[] {
    return aggregateCategories(_.sumBy, data, category, value, aggregateWindow, startTime, endTime);
}

/**
 * Aggregates metrics by their mean value across a window. **Entries must be sorted by timestamp.**
 * Will only include *complete* aggregate windows, i.e. will return [] if aggregateWindow > endTime-startTime
 * @param data List of objects \<T> with a timestamp property
 * @param value key to aggregate or function to get a number from the object
 * @param aggregateWindow Aggregate window in milliseconds
 * @param endTime The end time of the last aggregate window. If not specified, will use the last entry's timestamp.
 */
export function aggregateMeanByCategory<T>(data: (Timestamped & T)[], category: keyof T, value: byType<T>, aggregateWindow: number, startTime?: number, endTime?: number): AggregatedMetric[] {
    return aggregateCategories(_.meanBy, data, category, value, aggregateWindow, startTime, endTime);
}

/**
 * Aggregates metrics
 * Will only include *complete* aggregate windows, i.e. will return [] if aggregateWindow > endTime-startTime
 * @param aggregateFn Function to aggregate values
 * @param data List of objects \<T> with a timestamp property
 * @param value key to aggregate or function to get a number from the object
 * @param aggregateWindow Aggregate window in milliseconds
 * @param endTime The end time of the last aggregate window. If not specified, will use the last entry's timestamp.
 */
export function aggregateCategories<T>(
    aggregateFn: typeof _.sumBy,
    data: (Timestamped & T)[],
    category: keyof T,
    value: byType<T>,
    aggregateWindow: number,
    startTime?: number,
    endTime?: number
): AggregatedMetric[] {
    if (data.length === 0) return [];

    endTime = endTime ?? data[data.length - 1].timestamp;
    startTime = startTime ?? data[0].timestamp - 1;
    const windows: AggregatedMetric[] = [];

    for (let windowStart = endTime - aggregateWindow; windowStart >= startTime; windowStart -= aggregateWindow) {
        const aggregated = _.flow(
            sliceMetrics(windowStart, windowStart + aggregateWindow),
            _.groupBy(category),
            _.mapValues(aggregateFn(typeof value === "function" ? value : value as string))
        )(data);

        windows.push({
            data: aggregated,
            _start: windowStart + 1,
            _end: windowStart + aggregateWindow,
        });
    }

    return windows;

}