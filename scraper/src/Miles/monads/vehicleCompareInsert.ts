import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import MilesDatabase from "../MilesDatabase";

export async function vehicleCompareInsert(db: MilesDatabase, apiVehicle: apiVehicleJsonParsed) {

    const metaId = await db.getVehicleMetaId(Number(apiVehicle.idVehicle));

    // if metaId is false, the vehicle has not been seen yet
    if (metaId === false) {
        await db.createVehicle(apiVehicle);
        return;
    }
    
    // otherwise check if the vehicle has changed
    // todo check if vehicle has changed

    const vehicleDetails = apiVehicle.JSONFullVehicleDetails.vehicleDetails;
    
}