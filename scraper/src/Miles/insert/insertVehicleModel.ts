import { EntityManager } from "typeorm";
import { RedisClientType } from "@redis/client";
import { VehicleModel } from "../../entity/Miles/VehicleModel";
import { MilesVehicleFuelReturn, MilesVehicleTransmissionReturn } from "@koenidv/abfahrt";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";

export type VehicleModelProps = {
  apiVehicle: apiVehicleJsonParsed;
  sizeId: number;
};

export async function insertVehicleModel(
  manager: EntityManager,
  props: VehicleModelProps,
): Promise<VehicleModel> {
  const vehicle = props.apiVehicle;
  const vehicleDetails = vehicle.JSONFullVehicleDetails.vehicleDetails;
  if (!vehicleDetails) throw new Error(`Vehicle details not found for vehicle ${vehicle.idVehicle}`);

  const model = new VehicleModel();
  model.name = vehicle.VehicleType;
  model.seats = Number(vehicleDetails.find(d => d.key === "vehicle_details_seats").value);
  model.electric = vehicle.isElectric;
  model.enginePower = vehicle.EnginePower;
  model.transmission = vehicleDetails.find(d => d.key === "vehicle_details_transmission").value as keyof typeof MilesVehicleTransmissionReturn;
  model.fuelType = vehicleDetails.find(d => d.key === "vehicle_details_fuel").value as keyof typeof MilesVehicleFuelReturn;
  model.sizeId = props.sizeId;

  const saved = await manager.save(model);
  return saved;
}