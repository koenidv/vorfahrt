import { EntityManager } from "typeorm";
import { VehicleSize } from "../../entity/Miles/VehicleSize";

/**
 * Finds an existing size by its size name
 * @param em EntityManager instance
 * @param sizeName Size name assigned by Miles, eg "M"
 * @returns VehicleSize entity from postgres or null if not found
 */
export async function findSize(em: EntityManager, sizeName: string): Promise<VehicleSize|null> {
    return await em.findOneBy(VehicleSize, { name: sizeName })
}