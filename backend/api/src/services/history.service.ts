import Container, { Service } from 'typedi';
import { QueryApi } from '@influxdata/influxdb-client';

/*
 * History output is non-standard csv to save bandwith
 * output to be decided
 */

@Service()
export class HistoryService {
  private QueryAPI: QueryApi = Container.get("InfluxQueryApi");
  // private VehicleCache: VehiclesCacheModel;
  private refreshIntervalMs: number;
  private cacheExpirationMs: number;
  private refreshInterval: NodeJS.Timeout;
  private lastRefetchComplete: Date;

  constructor(/*cache: VehiclesCacheModel,*/ refreshInterval = 60000, cacheExpiration = refreshInterval * 4) {
    // this.VehicleCache = cache;
    this.refreshIntervalMs = refreshInterval;
    this.cacheExpirationMs = cacheExpiration;
    this.start();
  }

  public start() {
    this.refreshInterval = setInterval(() =>
      // this.fetchAll(this.lastRefetchComplete), this.refreshIntervalMs
      true
    );
    // this.fetchAll();
    // todo this was only to test influx connection and will be removed later
    this.QueryAPI.collectRows(`
      from(bucket: "system_scraper")
        |> range(start: -15m)
        |> filter(fn: (r) => r["_measurement"] == "miles-map-citylog")
        |> filter(fn: (r) => r["_field"] == "vehicles")
        |> group(columns: ["city"])
        |> aggregateWindow(every: 15m, fn: mean, createEmpty: false)
        |> yield(name: "mean")
    `).then((rows) => {
      rows.forEach(row => {
        console.log(row);
      });
    });
  }

  public stop() {
    clearInterval(this.refreshInterval);
  }


  // private isCacheExpired(): boolean {
  //   if (this.VehicleCache.statusIsEmpty()) return true;
  //   const now = Date.now();
  //   return (now - this.VehicleCache.lastBatchUpdate) > this.cacheExpirationMs;
  // }




}
