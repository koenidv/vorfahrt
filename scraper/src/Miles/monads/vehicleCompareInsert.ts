import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import MilesDatabase from "../MilesDatabase";
import { diffVehicleInfo } from "../compare/diffVehicleInfo";

export async function vehicleCompareInsert(db: MilesDatabase, apiVehicle: apiVehicleJsonParsed) {

    const currentVehicle = await db.getVehicleInfoByMilesId(apiVehicle.idVehicle);

    // if metaId is false, the vehicle has not been seen yet
    if (currentVehicle == null) {
        await db.createVehicle(apiVehicle);
        return;
    }

    const { changes, changedCity, changedPrice } = await diffVehicleInfo(currentVehicle, apiVehicle);

    let newCityId = undefined;
    if (changedCity) {
        const foundCity = await db.getCity(apiVehicle.idCity);
        if (foundCity) {
            newCityId = foundCity.id;
        } else {
            throw new Error(`City ${apiVehicle.idCity} not found. Cities cannot be created from vehicles. Vehicle ${apiVehicle.idVehicle}`)
        }
    }
    let newPricingId = undefined;
    if (changedPrice) {
        const foundPricing = await db.getOrInsertPricing(apiVehicle);
        changes.pricingId = foundPricing.id
    }

    if (changes || newCityId || newPricingId) {
        await db.updateVehicle(
            currentVehicle.current,
            {
                ...changes,
                cityId: newCityId,
                pricingId: newPricingId,
            }
        );
    }

}