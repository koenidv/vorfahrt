import { EntityManager } from "typeorm";
import { VehicleModel } from "../../entity/Miles/VehicleModel";

/**
 * Finds an existing vehicle model by its name
 * @param em EntityManager instance
 * @param modelName model name assigned by Miles, eg "VW_POLO"
 * @returns VehicleModel entity from postgres or null if not found
 */
export async function findModel(em: EntityManager, modelName: string): Promise<VehicleModel|null> {
    return await em.findOneBy(VehicleModel, { name: modelName })
}