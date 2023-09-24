import { EntityManager } from "typeorm";
import { VehicleCurrent } from "../../entity/Miles/VehicleCurrent";
import { VehicleChangeProps } from "./insertVehicleChange";

export async function updateVehicleCurrent(
  manager: EntityManager,
  current: VehicleCurrent,
  props: VehicleChangeProps,
): Promise<number> {
    current.status = props.status ?? current.status;
    current.location = props.location?.toString() ?? current.location;
    current.fuelPercent = props.fuelPercent ?? current.fuelPercent;
    current.range = props.range ?? current.range;
    current.charging = props.charging ?? current.charging;
    current.coverageGsm = props.coverageGsm ?? current.coverageGsm;
    current.coverageSatellites = props.coverageSatellites ?? current.coverageSatellites;
    current.cityId = props.cityId ?? current.cityId;
    current.pricingId = props.pricingId ?? current.pricingId;
  
    const saved = await manager.save(current);
    return saved.id;
}