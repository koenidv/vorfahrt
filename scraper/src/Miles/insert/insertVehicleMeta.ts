import { EntityManager } from "typeorm";
import { VehicleMeta } from "../../entity/Miles/VehicleMeta";
import { VehicleCurrent } from "../../entity/Miles/VehicleCurrent";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";

export type VehicleMetaProps = {
  apiVehicle: apiVehicleJsonParsed;
  modelId: number;
  firstCityId: number;
  current: VehicleCurrent;
};

export async function insertVehicleMeta(
  manager: EntityManager,
  props: VehicleMetaProps,
): Promise<VehicleMeta> {
  const meta = new VehicleMeta();
  meta.milesId = props.apiVehicle.idVehicle;
  meta.licensePlate = props.apiVehicle.LicensePlate;
  meta.color = props.apiVehicle.VehicleColor;
  meta.imageUrl = props.apiVehicle.URLVehicleImage;
  meta.isCharity = props.apiVehicle.isCharity;
  meta.modelId = props.modelId;
  meta.firstCityId = props.firstCityId;
  meta.current = props.current;

  return await manager.save(meta);
}