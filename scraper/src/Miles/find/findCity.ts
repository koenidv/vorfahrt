import { EntityManager } from "typeorm";
import { City } from "../../entity/Miles/City";

export async function findCity(em: EntityManager, cityMilesId: string): Promise<City|null> {
    return await em.findOneBy(City, { milesId: cityMilesId })
}