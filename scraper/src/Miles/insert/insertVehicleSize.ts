import { EntityManager, Point } from "typeorm";
import { VehicleSize } from "../../entity/Miles/VehicleSize";


export async function insertVehicleSize(
  manager: EntityManager,
  sizeName: string,
): Promise<VehicleSize> {
  const size = new VehicleSize();
  size.name = sizeName;

  const saved = await manager.save(size);
  return saved;
}