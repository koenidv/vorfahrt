import Container, { Service } from 'typedi';
import { FluxTableMetaData, QueryApi } from '@influxdata/influxdb-client';
import { HistoryCacheModel } from '@/models/history.model';
import { MILES_HISTORY_KEYS_ARRAY } from 'shared/api-types/api.enums';
import { HistoryPoint } from 'shared/api-types/api.types';

/*
 * History output is non-standard csv to save bandwith
 * output to be decided
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

  public start() {
    this.refreshInterval = setInterval(() =>
      this.fetch(this.lastRefetchComplete), this.refreshIntervalMs
    );
    this.fetch();
  }

  public stop() {
    clearInterval(this.refreshInterval);
  }

  private isCacheExpired(): boolean {
    if (this.historyCache.isEmpty()) return true;
    const now = Date.now();
    return (now - this.historyCache.lastUpdate) > this.cacheExpirationMs;
  }

  private async fetch(since?: Date): Promise<void> {
    console.log("Fetching history");
    for await (const row of this.QueryAPI.iterateRows(this.getFluxQuery(since))) {
      this.saveRow(row.values as FilteredFluxResponseRow, row.tableMeta);
    }
  }

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
   * @param sinceOpt last update time
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

  private saveRow(row: FilteredFluxResponseRow, tableMeta: FluxTableMetaData): void {
    this.historyCache.save([this.parseRow(row, tableMeta)]);
  }

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

  private parseValueType(row: FilteredFluxResponseRow, tableMeta: FluxTableMetaData): string | number | boolean {
    const type = tableMeta.columns[3].dataType;
    if (type === "string") return row[3];
    if (type === "long") return Number(row[3]);
    if (type === "boolean") return row[3] === "true";
    throw new Error(`Unknown data type ${type}`);
  }


}
