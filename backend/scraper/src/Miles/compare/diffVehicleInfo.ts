// import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
// import { VehicleChangeProps } from "../insert/insertVehicleChange";
// import { MilesVehicleStatus } from "@koenidv/abfahrt";
// import { VehicleMeta } from "../../entity/Miles/VehicleMeta";
// import Point from "../utils/Point";
// import { getChangeEventType } from "./getEventChangeType";
// import { VehicleDamage } from "../../entity/Miles/VehicleDamage";

// export type VehicleDiffProps = {
//     current: VehicleMeta;
//     update: apiVehicleJsonParsed;
// }

// export type VehicleDiffReturn = {
//     changes: VehicleChangeProps;
//     changedCity: boolean;
//     changedPrice: boolean;
//     addedDamages: VehicleDamage[];
// }

// export async function diffVehicleInfo(currentMeta: VehicleMeta, update: apiVehicleJsonParsed): Promise<VehicleDiffReturn> {
//     if (!currentMeta || !currentMeta.current) throw new Error("Diffed vehicle must have current info");

//     const changes = {} as VehicleChangeProps;
//     let changedCity = false, changedPricing = false;
//     const addedDamages = [] as VehicleDamage[];
//     const current = currentMeta.current;

//     const newStatus = update.idVehicleStatus as unknown as keyof typeof MilesVehicleStatus;
//     if (newStatus !== current.status) {
//         changes.status = newStatus;
//     }

//     const newLocation = new Point(update.Latitude, update.Longitude);
//     const oldLocation = Point.fromString(current.location);
//     if (!newLocation.equalsWithTolerance(oldLocation)) {
//         changes.location = newLocation;
//     }

//     if (update.FuelPct_parsed !== current.fuelPercent || update.RemainingRange_parsed !== current.range) {
//         changes.fuelPercent = update.FuelPct_parsed;
//         changes.range = update.RemainingRange_parsed;
//     }

//     if (update.EVPlugged !== current.charging) {
//         changes.charging = update.EVPlugged;
//         changes.fuelPercent = update.FuelPct_parsed;
//         changes.range = update.RemainingRange_parsed;
//     }

//     if (update.GSMCoverage !== current.coverageGsm) {
//         changes.coverageGsm = update.GSMCoverage;
//     }
//     if (update.SatelliteNumber !== current.coverageSatellites) {
//         changes.coverageSatellites = update.SatelliteNumber;
//     }

//     changes.metaId = currentMeta.id;
//     changes.event = getChangeEventType(current, changes);

//     for (const damage of update.JSONVehicleDamages as VehicleDamage[]) {
//         const alreadySeen = currentMeta.damages.some((currentDamage) =>
//             currentDamage.title === damage.title &&
//             JSON.stringify(currentDamage.damages) === JSON.stringify(damage.damages)
//         );

//         if (!alreadySeen) {
//             addedDamages.push(damage);
//         }
//     }

//     return {
//         changes: changes,
//         changedCity: changedCity,
//         changedPrice: changedPricing,
//         addedDamages: addedDamages,
//     }

// }