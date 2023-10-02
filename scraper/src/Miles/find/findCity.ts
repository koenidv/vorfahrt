import { EntityManager } from "typeorm";
import { City } from "../../entity/Miles/City";

/**
 * Finds an existing city by its miles id
 * @param em EntityManager instance
 * @param cityMilesId City id assigned by Miles, eg "BER"
 * @returns City entity from postgres or null if not found
 */
export async function findCity(em: EntityManager, cityMilesId: string): Promise<City|null> {
    return await em.findOneBy(City, { milesId: cityMilesId })
}