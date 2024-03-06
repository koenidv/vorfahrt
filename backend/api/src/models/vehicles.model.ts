import { VehicleType, BasicVehicleStatus } from "shared/api-types/api.types";

export class VehiclesCacheModel {
  VehicleTypesModel: Map<number, VehicleType> = new Map();
  VehiclesStatusModel: Map<number, BasicVehicleStatus> = new Map();
  lastBatchUpdate: number;

  vehicleTypesIsEmpty(): boolean {
    return this.VehicleTypesModel.size === 0;
  }

  statusIsEmpty(): boolean {
    return this.VehiclesStatusModel.size === 0;
  }

  getAllVehicleTypes(): VehicleType[] {
    if (this.vehicleTypesIsEmpty()) console.warn("Vehicle types cache is empty");
    return [...this.VehicleTypesModel.values()];
  }

  getAllStatuses(): BasicVehicleStatus[] {
    if (this.statusIsEmpty()) console.warn("Vehicle statuses cache is empty");
    return [...this.VehiclesStatusModel.values()];
  }

  saveVehicleTypes(types: VehicleType[]): void {
    types.forEach(item => {
      if (this.VehicleTypesModel.has(item[0])) console.warn(`Vehicle type ${item[0]} already in cache`);
      this.VehicleTypesModel.set(item[0], item);
    });
  }

  saveStatuses(batch: BasicVehicleStatus[]): void {
    batch.forEach(item => {
      if (!this.VehicleTypesModel.has(item[2])) console.warn(`Vehicle type ${item[2]} not found in cache`);
      this.VehiclesStatusModel.set(item[0], item);
    });
    this.lastBatchUpdate = Date.now();
  }
}