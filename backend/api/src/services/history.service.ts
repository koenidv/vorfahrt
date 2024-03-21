import Container, { Service } from 'typedi';
import { FluxTableMetaData, QueryApi } from '@influxdata/influxdb-client';
import { HistoryCacheModel } from '@/models/history.model';
import { MILES_HISTORY_KEYS_ARRAY, MILES_STATUS_CODES_ARRAY } from 'shared/api-types/api.enums';
import { HistoryPoint } from 'shared/api-types/api.types';
import { minifyMilesCachedKeys, minifyMilesStatuses } from '@/utils/minifyUtils';
import { createMinifiedHistoryResponse } from '@/utils/minifyHistory';

/*
 * History output is non-standard csv to save bandwith
 * last update timestamp (seconds)
 * MEASUREMENT_KEY*0, MEASUREMENT_KEY*1, ...
 * STATUSCODE*0, STATUSCODE*1, ...
 * (for each vehicle) milesId, timestamp(seconds), keyId, value (value type depends on key, will be statusId for status)
 * ...
 */

type FilteredFluxResponseRow = [result: string, table: string, time: string, value: string, key: string, vehicleId: string];

@Service()
export class HistoryService {
  private QueryAPI: QueryApi = Container.get("InfluxQueryApi");
  private historyCache: HistoryCacheModel;
  private paginationMaxSeconds: number;
  private refreshIntervalMs: number;
  private cacheExpirationMs: number;
  private refreshInterval: NodeJS.Timeout;
  private lastRefetchComplete: Date;

  constructor(cache: HistoryCacheModel, refreshInterval = 5 * 60000, cacheExpiration = refreshInterval * 4, paginationMaxSeconds = 15 * 60) {
    this.historyCache = cache;
    this.refreshIntervalMs = refreshInterval;
    this.cacheExpirationMs = cacheExpiration;
    this.paginationMaxSeconds = paginationMaxSeconds;
    this.start();
  }

  /**
   * Fetch and cache values and start an interval to refresh the cache
   */
  public async start() {
    this.refreshInterval = setInterval(async () =>
      await this.fetch(this.lastRefetchComplete),
      this.refreshIntervalMs
    );
    await this.fetch();
  }

  /**
   * Stops the refresh interval
   */
  public stop() {
    clearInterval(this.refreshInterval);
  }

  /**
   * Checks if the cache is empty or expired
   * @returns true if cache is empty or expired
   */
  private isCacheExpired(): boolean {
    if (this.historyCache.isEmpty()) return true;
    const now = Date.now();
    return (now - this.historyCache.lastUpdate) > this.cacheExpirationMs;
  }

  /**
   * Fetch and save history values from Influx to cache
   * @param since last update date
   */
  private async fetch(since?: Date): Promise<void> {
    console.log("Fetching history");
    const fluxRanges = this.getFluxRangesPaginated(this.getStartSecondsPassedWithinToday(since));
    for (const query of this.getFluxQueries(fluxRanges)) {
      await this.fetchPage(query);
    }
    this.lastRefetchComplete = new Date();
  }

  private async fetchPage(query: string): Promise<void> {
    console.log("Fetching history page: ", query)
    for await (const row of this.QueryAPI.iterateRows(query)) {
      this.saveRow(row.values as FilteredFluxResponseRow, row.tableMeta);
    }
  }

  /**
   * Generates the flux query to get cached keys from the last update or start of today, whichever is later
   * @param sinceOpt last update date
   * @returns flux query string
   */
  private getFluxQueries(ranges: string[]): string[] {
    const fields = `[${MILES_HISTORY_KEYS_ARRAY.map(key => `"${key}"`).join(",")}]`;
    return ranges.map(range => (`
      from(bucket: "miles")
      |> range(${range})
      |> filter(fn: (r) => r["_measurement"] == "vehicle_data")
      |> filter(fn: (r) => contains(value: r["_field"], set: ${fields}))
      |> drop(columns: ["table", "_measurement", "_start", "_stop", "city", "host", "status", "statusChangedFrom"])
      |> group(columns: ["_field"])
    `));
  }

  private getStartSecondsPassedWithinToday(sinceOpt?: Date): number {
    const today = new Date();
    const todayStartMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const sinceMs = Math.max(
      sinceOpt !== undefined ? sinceOpt.getTime() : 0,
      todayStartMs
    );
    return Math.floor((Date.now() - sinceMs) / 1000);
  }

  private getFluxRangesPaginated(durationSeconds: number): string[] {
    return this.paginateRange(durationSeconds).map(range => this.getFluxRange(range.start, range.stop));
  }

  private paginateRange(durationSeconds: number): { start: number, stop: number }[] {
    const ranges: { start: number, stop: number }[] = [];
    let stopSecondsAgo = 0;
    while (durationSeconds > 0) {
      const range = Math.min(this.paginationMaxSeconds, durationSeconds);
      durationSeconds -= range;
      ranges.push({ start: stopSecondsAgo + range, stop: stopSecondsAgo });
      stopSecondsAgo += range;
    }
    return ranges;
  }

  private getFluxRange(startSecondsAgo: number, stopSecondsAgo: number): string {
    return `start: -${startSecondsAgo}s, stop: -${stopSecondsAgo}s`;
  }

  /**
   * Saves a single row returned by influx
   * @param row 
   * @param tableMeta 
   */
  private saveRow(row: FilteredFluxResponseRow, tableMeta: FluxTableMetaData): void {
    this.historyCache.save([this.parseRow(row, tableMeta)]);
  }

  /**
   * Parses a row returned by influx to a HistoryPoint
   * @param row values from influx as result, table, time, value, key, vehicleId
   * @param tableMeta vehicleMeta describing the types of each column
   * @returns parsed HistoryPoint
   */
  private parseRow(row: FilteredFluxResponseRow, tableMeta: FluxTableMetaData): HistoryPoint {
    const keyId = MILES_HISTORY_KEYS_ARRAY.indexOf(row[4]);
    if (keyId === -1) throw new Error(`Unknown key ${row[4]}`);
    return [
      Number(row[5]),
      new Date(row[2]).getTime() / 1000,
      keyId,
      this.parseValueType(row, tableMeta)
    ]
  }

  /**
   * Identifies the type of the value column and parses it accordingly
   * status strings will be parsed to statusIds
   * @param row values from influx as result, table, time, value, key, vehicleId
   * @param tableMeta vehicleMeta describing the types of each column
   * @returns parsed value from the value column
   */
  private parseValueType(row: FilteredFluxResponseRow, tableMeta: FluxTableMetaData): string | number | boolean {
    const key = row[4];
    if (key === "status") {
      const statusId = MILES_STATUS_CODES_ARRAY.indexOf(row[3]);
      if (statusId === -1) throw new Error(`Unknown status ${row[3]}`);
      return statusId;
    }

    const type = tableMeta.columns[3].dataType;
    if (type === "string") return row[3];
    if (type === "long" || type === "double") return Number(row[3]);
    if (type === "boolean") return row[3] === "true";
    throw new Error(`Unknown data type ${type}`);
  }

  /**
   * Retrieve cached values and minimize them for bandwidth efficiency
   * @returns minified cache for api response
   */
  getCacheMinified(): string {
    if (this.isCacheExpired()) {
      console.error("Tried to get history but cache is expired or empty");
      return null;
    }
    return createMinifiedHistoryResponse(this.getCachedValues(), this.historyCache.lastUpdate / 1000);
  }

  /**
   * Retrieve cached values
   * @returns cached history points
   */
  private getCachedValues(): HistoryPoint[] {
    return this.historyCache.getAll();
  }


}
