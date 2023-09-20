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

    const changes = diffVehicleInfo(currentVehicle, apiVehicle);
    // todo use those changes
}