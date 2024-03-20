import Container, { Service } from 'typedi';
import { VehiclesCacheModel } from '@models/vehicles.model';
import { EntityManager } from 'typeorm';
import { VehicleModel } from 'shared/typeorm-entities/Miles/VehicleModel';
import { BasicVehicleStatus, VehicleType } from 'shared/api-types/api.types';
import { VehicleLastKnown } from 'shared/typeorm-entities/Miles/VehicleLastKnown';
import { MILES_STATUS_CODES_ARRAY } from 'shared/api-types/api.enums';
import { MoreThan } from 'typeorm';


/*
 * Vehicles output is a bit of a weird format to be very bandwidth efficient. This is what it looks like (as CSV)
 * last update timestamp (seconds)
 * STATUSCODE*0 (referred to as status #0), STATUSCODE*1 (status #1), ...
 * (for vehicle type #0) name, size, image, electric (e/c)
 * (for vehicle type #1) name, size, image, electric (e/c)
 * ...
 * \n
 * (for each vehicle) milesId, licensePlate, type code, status code, latitude, longitude, updated(seconds)
 * ...
 */

@Service()
export class VehicleService {
  private entityManager: EntityManager = Container.get("EntityManager");
  private VehicleCache: VehiclesCacheModel;
  private refreshIntervalMs: number;
  private cacheExpirationMs: number;
  private refreshInterval: NodeJS.Timeout;
  private lastRefetchComplete: Date;

  constructor(cache: VehiclesCacheModel, refreshInterval = 60000, cacheExpiration = refreshInterval * 4) {
    this.VehicleCache = cache;
    this.refreshIntervalMs = refreshInterval;
    this.cacheExpirationMs = cacheExpiration;
    this.start();
  }

  /**
   * Fetch and cache values and start an interval to refresh the cache
   */
  public async start() {
    this.refreshInterval = setInterval(async () =>
      await this.fetchAll(this.lastRefetchComplete), this.refreshIntervalMs
    );
    await this.fetchAll();
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
    if (this.VehicleCache.statusIsEmpty() || this.VehicleCache.vehicleTypesIsEmpty()) return true;
    const now = Date.now();
    return (now - this.VehicleCache.lastBatchUpdate) > this.cacheExpirationMs;
  }

  /**
   * Fetch and save vehicle types and statuses from DB to cache
   * @param since last update date
   */
  async fetchAll(since?: Date): Promise<void> {
    console.log("Fetching vehicle types and statuses")
    const vehicleTypes = await this.fetchVehicleTypesFromDb();
    this.VehicleCache.saveVehicleTypes(vehicleTypes.map(this.mapVehicleTypeToCacheItem));

    const vehiclesLastKnown = await this.fetchVehiclesLastKnownFromDb(since);
    this.VehicleCache.saveStatuses(vehiclesLastKnown.map(this.mapVehicleMetaToBasicStatus));

    this.lastRefetchComplete = new Date();
  }

  /**
   * Fetches vehicle types from DB
   * @returns vehicle types
   */
  private async fetchVehicleTypesFromDb(): Promise<VehicleModel[]> {
    return await this.entityManager.find(VehicleModel, { relations: ["size"] });
  }

  /**
   * Maps vehicle type to cache item
   * @param vehicleType vehicle type entity
   * @returns mapped cache item
   */
  private mapVehicleTypeToCacheItem(vehicleType: VehicleModel): VehicleType {
    return [vehicleType.id, vehicleType.name, vehicleType.size.name, vehicleType.electric]
  }

  /**
   * Fetches vehicle statuses from DB
   * @param since last update date
   * @returns vehicle statuses
   */
  private async fetchVehiclesLastKnownFromDb(since: Date = new Date(0)): Promise<VehicleLastKnown[]> {
    return await this.entityManager.find(VehicleLastKnown, { relations: ["vehicle"], where: { updated: MoreThan(since) } });
  }

  /**
   * Maps vehicle meta to basic status
   * @param vehicle vehicle meta entity
   * @returns mapped basic status
   */
  private mapVehicleMetaToBasicStatus(vehicle: VehicleLastKnown): BasicVehicleStatus {
    const statusId = MILES_STATUS_CODES_ARRAY.indexOf(vehicle.status);
    if (statusId === -1 || statusId === undefined) throw new Error(`Unknown status code ${vehicle.status}`);
    return [vehicle.milesId, vehicle.vehicle.licensePlate, vehicle.vehicle.modelId, statusId, vehicle.latitude, vehicle.longitude, vehicle.updated.getTime() / 1000]
  }

  /**
   * Retrieve cached values and minimize them for bandwidth efficiency,
   * including the last update timestamp
   * @returns minified statuses or null if cache is empty
   */
  public getStatusesMinified(): string | null {
    if (this.isCacheExpired()) {
      console.error("Tried to get minified statuses but cache is expired or empty");
      return null;
    }
    const minified = this.minifyVehicleStatuses(
      this.getCachedVehicles(),
      this.getCachedStatuses()
    )
    return (this.VehicleCache.lastBatchUpdate / 1000) + "\n" + minified;
  }

  /**
   * Minify vehicle types and statuses for bandwidth efficiency, including a list of vehicle statuses
   * @param vehicleTypes vehicle types from cache
   * @param statuses vehicle statuses from cache
   * @returns 
   */
  private minifyVehicleStatuses(vehicleTypes: VehicleType[], statuses: BasicVehicleStatus[]): string {
    const result: string[] = [];
    result.push(MILES_STATUS_CODES_ARRAY.join(","));

    vehicleTypes.forEach(vehicleType => {
      result.push(vehicleType.join(","));
    });

    // push an empty line as indicator for start of status data
    result.push("");

    statuses.forEach(status => {
      result.push(status.join(","));
    });

    return result.join("\n");
  }

  /**
   * Retrieve cached vehicle types
   * @returns vehicle types
   */
  private getCachedVehicles(): VehicleType[] {
    return this.VehicleCache.getAllVehicleTypes();
  }

  /**
   * Retrieve cached vehicle statuses
   * @returns vehicle statuses
   */
  private getCachedStatuses(): BasicVehicleStatus[] {
    return this.VehicleCache.getAllStatuses();
  }

}
