import { hash } from 'bcrypt';
import { Service } from 'typedi';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/httpException';
import { User } from '@interfaces/users.interface';
import { UserModel } from '@models/users.model';
import { CacheItemType } from '@/interfaces/vehicles.interface';
import { VehiclesCacheModel } from '@/models/vehicles.model';
import { EntityManager } from 'typeorm';
import { VehicleMeta } from 'shared/typeorm-entities/Miles/VehicleMeta';
import { VehicleModel } from 'shared/typeorm-entities/Miles/VehicleModel';
import { VehicleType } from 'shared/api-types/api.types';
import { VehicleLastKnown } from 'shared/typeorm-entities/Miles/VehicleLastKnown';
import { MILES_STATUS_CODES, MILES_STATUS_CODES_ARRAY } from 'shared/api-types/api.enums';


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
  private entityManager: EntityManager;
  private VehicleCache: VehiclesCacheModel;
  private refreshInterval: number;
  private cacheExpiration: number;

  constructor(entityManager: EntityManager, cache: VehiclesCacheModel, refreshInterval = 60000, cacheExpiration = refreshInterval) {
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
      const vehiclesLastKnownMapped = vehiclesLastKnown.map(this.mapVehicleMetaToCacheItem);

      this.VehicleCache.saveVehicleTypes(vehicleTypesMapped);
      this.VehicleCache.saveStatuses(vehiclesLastKnownMapped);
    }
  }

  private async fetchVehicleTypesFromDb(): Promise<VehicleModel[]> {
    // todo - expand vehicletype
    return []
  }

  private mapVehicleTypeToCacheItem(vehicleType: VehicleModel): VehicleType {
    return [vehicleType.id, vehicleType.name, vehicleType.size.name, vehicleType.electric]
  }

  private async fetchVehiclesLastKnownFromDb(): Promise<VehicleLastKnown[]> {
    // todo - expand vehicle
    return []
  }

  private mapVehicleMetaToCacheItem(vehicle: VehicleLastKnown): CacheItemType {
    // todo status enum, cache models
    const statusId = MILES_STATUS_CODES_ARRAY.indexOf(vehicle.status);
    if (statusId === -1) throw new Error(`Unknown status code ${vehicle.status}`);
    return [vehicle.milesId, vehicle.vehicle.licensePlate, vehicle.vehicle.modelId, vehicle.status, vehicle.latitude, vehicle.longitude]
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

  private getCachedStatuses(): CacheItemType[] {
    return this.VehicleCache.getAllStatuses();
  }

  public async findAllUser(): Promise<User[]> {
    const users: User[] = UserModel;
    return users;
  }

  public async findUserById(userId: number): Promise<User> {
    const findUser: User = UserModel.find(user => user.id === userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    const findUser: User = UserModel.find(user => user.email === userData.email);
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = { id: UserModel.length + 1, ...userData, password: hashedPassword };

    return createUserData;
  }

  public async updateUser(userId: number, userData: CreateUserDto): Promise<User[]> {
    const findUser: User = UserModel.find(user => user.id === userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const hashedPassword = await hash(userData.password, 10);
    const updateUserData: User[] = UserModel.map((user: User) => {
      if (user.id === findUser.id) user = { id: userId, ...userData, password: hashedPassword };
      return user;
    });

    return updateUserData;
  }

  public async deleteUser(userId: number): Promise<User[]> {
    const findUser: User = UserModel.find(user => user.id === userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const deleteUserData: User[] = UserModel.filter(user => user.id !== findUser.id);
    return deleteUserData;
  }
}
