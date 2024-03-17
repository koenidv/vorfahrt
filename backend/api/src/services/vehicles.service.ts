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
 * STATUSCODE*1 (referred to as status #0), STATUSCODE*2 (status #1), ...
 * (for vehicle type #0) name, size, image, electric (e/c)
 * (for vehicle type #1) name, size, image, electric (e/c)
 * ...
 * \n
 * (for each vehicle) milesId, licensePlate, type code, status code, latitude, longitude
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

  public start() {
    this.refreshInterval = setInterval(() =>
      this.fetchAll(this.lastRefetchComplete), this.refreshIntervalMs
    );
    this.fetchAll();
  }

  public stop() {
    clearInterval(this.refreshInterval);
  }


  private isCacheExpired(): boolean {
    if (this.VehicleCache.statusIsEmpty()) return true;
    const now = Date.now();
    return (now - this.VehicleCache.lastBatchUpdate) > this.cacheExpirationMs;
  }


  async fetchAll(since?: Date): Promise<void> {
    console.log("Fetching vehicle types and statuses")
    const vehicleTypes = await this.fetchVehicleTypesFromDb();
    this.VehicleCache.saveVehicleTypes(vehicleTypes.map(this.mapVehicleTypeToCacheItem));

    const vehiclesLastKnown = await this.fetchVehiclesLastKnownFromDb(since);
    this.VehicleCache.saveStatuses(vehiclesLastKnown.map(this.mapVehicleMetaToBasicStatus));

    this.lastRefetchComplete = new Date();
  }

  private async fetchVehicleTypesFromDb(): Promise<VehicleModel[]> {
    return await this.entityManager.find(VehicleModel, { relations: ["size"] });
  }

  private mapVehicleTypeToCacheItem(vehicleType: VehicleModel): VehicleType {
    return [vehicleType.id, vehicleType.name, vehicleType.size.name, vehicleType.electric]
  }

  private async fetchVehiclesLastKnownFromDb(since: Date = new Date(0)): Promise<VehicleLastKnown[]> {
    return await this.entityManager.find(VehicleLastKnown, { relations: ["vehicle"], where: { updated: MoreThan(since) } });
  }

  private mapVehicleMetaToBasicStatus(vehicle: VehicleLastKnown): BasicVehicleStatus {
    const statusId = MILES_STATUS_CODES_ARRAY.indexOf(vehicle.status);
    if (statusId === -1 || statusId === undefined) throw new Error(`Unknown status code ${vehicle.status}`);
    return [vehicle.milesId, vehicle.vehicle.licensePlate, vehicle.vehicle.modelId, statusId, vehicle.latitude, vehicle.longitude, vehicle.updated.getTime()]
  }



  public getStatusesMinified(): string | null {
    if (this.isCacheExpired()) {
      console.error("Tried to get minified statuses but cache is expired or empty");
      return null;
    }
    return this.minifyVehicleStatuses(
      this.getCachedVehicles(),
      this.getCachedStatuses()
    )
  }

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

  private getCachedVehicles(): VehicleType[] {
    return this.VehicleCache.getAllVehicleTypes();
  }

  private getCachedStatuses(): BasicVehicleStatus[] {
    return this.VehicleCache.getAllStatuses();
  }

}
