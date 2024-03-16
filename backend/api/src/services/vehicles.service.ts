import { hash } from 'bcrypt';
import Container, { Service } from 'typedi';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { UserModel } from '@models/users.model';
import { VehiclesCacheModel } from '@models/vehicles.model';
import { EntityManager } from 'typeorm';
import { VehicleModel } from 'shared/typeorm-entities/Miles/VehicleModel';
import { BasicVehicleStatus, VehicleType } from 'shared/api-types/api.types';
import { VehicleLastKnown } from 'shared/typeorm-entities/Miles/VehicleLastKnown';
import { MILES_STATUS_CODES_ARRAY } from 'shared/api-types/api.enums';


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
  private refreshInterval: number;
  private cacheExpiration: number;

  constructor(cache: VehiclesCacheModel, refreshInterval = 60000, cacheExpiration = refreshInterval) {
    this.VehicleCache = cache;
    this.refreshInterval = refreshInterval;
    this.cacheExpiration = cacheExpiration;
  }

  private isCacheExpired(): boolean {
    if (this.VehicleCache.statusIsEmpty()) return true;
    const now = Date.now();
    return (now - this.VehicleCache.lastBatchUpdate) > this.cacheExpiration;
  }

  private async refetchIfCacheExpired(): Promise<boolean> {
    if (!this.isCacheExpired()) {
      return false;
    } else {
      // todo refetch cache
      const vehicleTypes = await this.fetchVehicleTypesFromDb();
      const vehicleTypesMapped = vehicleTypes.map(this.mapVehicleTypeToCacheItem);
      const vehiclesLastKnown = await this.fetchVehiclesLastKnownFromDb();
      const vehiclesLastKnownMapped = vehiclesLastKnown.map(this.mapVehicleMetaToBasicStatus);

      this.VehicleCache.saveVehicleTypes(vehicleTypesMapped);
      this.VehicleCache.saveStatuses(vehiclesLastKnownMapped);
    }
  }

  // todo private
  async fetchVehicleTypesFromDb(): Promise<VehicleModel[]> {
    return await this.entityManager.find(VehicleModel, { relations: ["size"] });
  }

  private mapVehicleTypeToCacheItem(vehicleType: VehicleModel): VehicleType {
    return [vehicleType.id, vehicleType.name, vehicleType.size.name, vehicleType.electric]
  }

  private async fetchVehiclesLastKnownFromDb(): Promise<VehicleLastKnown[]> {
    return await this.entityManager.find(VehicleLastKnown, { relations: ["vehicle"] });
  }

  private mapVehicleMetaToBasicStatus(vehicle: VehicleLastKnown): BasicVehicleStatus {
    // todo status enum, cache models
    const statusId = MILES_STATUS_CODES_ARRAY.indexOf(vehicle.status);
    if (statusId === -1) throw new Error(`Unknown status code ${vehicle.status}`);
    return [vehicle.milesId, vehicle.vehicle.licensePlate, vehicle.vehicle.modelId, statusId, vehicle.latitude, vehicle.longitude, vehicle.updated.getTime()]
  }


  public async getAllMinified(): Promise<string> {
    const result: string[] = [];
    result.push(MILES_STATUS_CODES_ARRAY.join(","));
    
    const vehicleTypes = this.getCachedVehicles();
    vehicleTypes.forEach(vehicleType => {
      result.push(vehicleType.join(","));
    });
    
    // push an empty line as indicator for start of status data
    result.push("");
    
    const statuses = this.getCachedStatuses();
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
