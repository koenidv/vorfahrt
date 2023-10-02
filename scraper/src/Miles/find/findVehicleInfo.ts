import { EntityManager } from "typeorm";
import { VehicleMeta } from "../../entity/Miles/VehicleMeta";

/**
 * Queries information about a vehicle by its milesId, including:
 * - current vehicle state
 * - current pricing
 * - first city
 * - damages
 * @param em EntityManager instance
 * @param milesId Vehicle id assigned by Miles
 * @returns VehicleMeta with expanded current, city, pricing, damages relations; or null if not found
 */
export async function findVehicleInfoByMilesId(em: EntityManager, milesId: number) {
    return em.findOne(VehicleMeta, {
        where: { milesId: milesId },
        relations: {
            current: {
                pricing: true,
            },
            firstCity: true,
            damages: true,
        },
    })
}