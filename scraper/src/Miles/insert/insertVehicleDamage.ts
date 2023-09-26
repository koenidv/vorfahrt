import { EntityManager } from "typeorm";
import { RedisClientType } from "@redis/client";
import { VehicleDamage } from "../../entity/Miles/VehicleDamage";
import { VehicleMeta } from "../../entity/Miles/VehicleMeta";

export type VehicleDamageProps = {
  vehicleMeta: VehicleMeta,
  title: string,
  damages: string[],
};

export async function insertVehicleDamage(
  manager: EntityManager,
  props: VehicleDamageProps,
): Promise<VehicleDamage> {
  const damage = new VehicleDamage();
  damage.vehicle = props.vehicleMeta;
  damage.title = props.title;
  damage.damages = props.damages;

  const saved = await manager.save(damage);
  return saved;
}