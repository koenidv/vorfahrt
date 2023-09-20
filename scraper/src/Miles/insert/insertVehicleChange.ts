import { EntityManager } from "typeorm";
import { MilesVehicleStatus } from "@koenidv/abfahrt";
import { VehicleChange } from "../../entity/Miles/VehicleChange";
import { ChangeEvent } from "../../entity/Miles/_ChangeEventEnum";
import Point from "../utils/Point";

export type VehicleChangeProps = {
  event: ChangeEvent;
  metaId: number;
  status?: typeof MilesVehicleStatus;
  location?: Point;
  lat?: number;
  lng?: number;
  fuelPercent?: number;
  range?: number;
  charging?: boolean;
  coverageGsm?: number;
  coverageSatellites?: number;
  cityId?: number;
  pricingId?: number;
};

export async function insertVehicleChange(
  manager: EntityManager,
  props: VehicleChangeProps,
): Promise<number> {
  const id = await insertPostgres(manager, props);
  return id;
}

async function insertPostgres(
  manager: EntityManager,
  props: VehicleChangeProps,
): Promise<number> {
  const change = new VehicleChange();
  change.vehicleMetaId = props.metaId;
  change.event = props.event;
  change.status = props.status;
  change.location = props.location?.toString();
  change.fuelPercent = props.fuelPercent;
  change.range = props.range;
  change.charging = props.charging;
  change.coverageGsm = props.coverageGsm;
  change.coverageSatellites = props.coverageSatellites;
  change.cityId = props.cityId;
  change.pricingId = props.pricingId;

  const saved = await manager.save(change);
  return saved.id;
}
