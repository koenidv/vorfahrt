import Container, { Service } from 'typedi';
import { FluxTableMetaData, QueryApi } from '@influxdata/influxdb-client';
import { HistoryCacheModel } from '@/models/history.model';
import { MILES_HISTORY_KEYS_ARRAY, MILES_STATUS_CODES_ARRAY } from 'shared/api-types/api.enums';
import { HistoryPoint } from 'shared/api-types/api.types';

/*
 * History output is non-standard csv to save bandwith
 * last update timestamp
 * MEASUREMENT_KEY*0, MEASUREMENT_KEY*1, ...
 * STATUSCODE*0, STATUSCODE*1, ...
 * (for each vehicle) milesId, timestamp, keyId, value (value type depends on key, will be statusId for status)
 * ...
 */

type FilteredFluxResponseRow = [result: string, table: string, time: string, value: string, key: string, vehicleId: string];

@Service()
export class HistoryService {
  private QueryAPI: QueryApi = Container.get("InfluxQueryApi");
  private historyCache: HistoryCacheModel;
  private refreshIntervalMs: number;
  private cacheExpirationMs: number;
  private refreshInterval: NodeJS.Timeout;
  private lastRefetchComplete: Date;

  constructor(cache: HistoryCacheModel, refreshInterval = 60000, cacheExpiration = refreshInterval * 4) {
    this.historyCache = cache;
    this.refreshIntervalMs = refreshInterval;
    this.cacheExpirationMs = cacheExpiration;
    this.start();
  }

  /**
   * Fetch and cache values and start an interval to refresh the cache
   */
  public start() {
    this.refreshInterval = setInterval(() =>
      this.fetch(this.lastRefetchComplete), this.refreshIntervalMs
    );
    this.fetch();
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
    for await (const row of this.QueryAPI.iterateRows(this.getFluxQuery(since))) {
      this.saveRow(row.values as FilteredFluxResponseRow, row.tableMeta);
    }
  }

  /**
   * Generates the flux query to get cached keys from the last update or start of today, whichever is later
   * @param sinceOpt last update date
   * @returns flux query string
   */
  private getFluxQuery(sinceOpt?: Date): string {
    const sinceText = this.getFluxStartWithinToday(sinceOpt);
    const fields = `[${MILES_HISTORY_KEYS_ARRAY.map(key => `"${key}"`).join(",")}]`;
    return `
      from(bucket: "miles")
      |> range(start: ${sinceText})
      |> filter(fn: (r) => r["_measurement"] == "vehicle_data")
      |> filter(fn: (r) => contains(value: r["_field"], set: ${fields}))
      |> drop(columns: ["table", "_measurement", "_start", "_stop", "city", "host", "status", "statusChangedFrom"])
      |> group(columns: ["_field"])
      `
  }

  /**
   * Generates a relative flux time string for the last update or start of today, whichever is later 
   * @param sinceOpt last update date
   * @returns relative flux time: "-<seconds>s"
   */
  private getFluxStartWithinToday(sinceOpt?: Date): string {
    const today = new Date();
    const todayStartMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const sinceMs = Math.max(
      sinceOpt !== undefined ? sinceOpt.getTime() : 0,
      todayStartMs
    );
    const secondsPassed = Math.floor(Date.now() - sinceMs / 1000);
    return `-${secondsPassed}s`;
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
      new Date(row[2]).getTime(),
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
    if (type === "long") return Number(row[3]);
    if (type === "boolean") return row[3] === "true";
    throw new Error(`Unknown data type ${type}`);
  }


}
