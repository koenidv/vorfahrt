import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { VehicleChangeProps } from "../insert/insertVehicleChange";
import { MilesVehicleStatus } from "@koenidv/abfahrt";
import { VehicleMeta } from "../../entity/Miles/VehicleMeta";
import Point from "../utils/Point";
import { compareDbAndApiPricing } from "./comparePricing";

export type VehicleDiffProps = {
    current: VehicleMeta;
    update: apiVehicleJsonParsed;  
} 

export type VehicleDiffReturn = {
    changes: VehicleChangeProps;
    changedCity: boolean;
    changedPrice: boolean;
}

export async function diffVehicleInfo(currentMeta: VehicleMeta, update: apiVehicleJsonParsed): Promise<VehicleDiffReturn> {
    const changes = {} as VehicleChangeProps;
    let changedCity = false, changedPricing = false;
    const current = currentMeta.current;

    // todo calculate change event type

    const newStatus = update.idVehicleStatus as unknown as typeof MilesVehicleStatus;
    if (newStatus !== current.status) {
        changes.status = newStatus;
    }

    const newLocation = new Point(update.Latitude, update.Longitude);
    const oldLocation = Point.fromString(current.location);
    if (!newLocation.equalsWithTolerance(oldLocation)) {
        changes.location = newLocation;
    }

    if (update.FuelPct_parsed !== current.fuelPercent || update.RemainingRange_parsed !== current.range) {
        changes.fuelPercent = update.FuelPct_parsed;
        changes.range = update.RemainingRange_parsed;
    }

    if (update.EVPlugged !== current.charging) {
        changes.charging = update.EVPlugged;
        changes.fuelPercent = update.FuelPct_parsed;
        changes.range = update.RemainingRange_parsed;
    }

    if (update.GSMCoverage !== current.coverageGsm) {
        changes.coverageGsm = update.GSMCoverage;
    }
    if (update.SatelliteNumber !== current.coverageSatellites) {
        changes.coverageSatellites = update.SatelliteNumber;
    }

    if (update.idCity !== currentMeta.firstCity.milesId) {
        changedCity = true;
    }

    if (!compareDbAndApiPricing(update, current.pricing)) {
        changedPricing = true;
    }

    return {
        changes: changes,
        changedCity: changedCity,
        changedPrice: changedPricing,
    }

}