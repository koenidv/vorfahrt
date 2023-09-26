import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { VehicleChangeProps } from "../insert/insertVehicleChange";
import { MilesVehicleStatus } from "@koenidv/abfahrt";
import { VehicleMeta } from "../../entity/Miles/VehicleMeta";
import Point from "../utils/Point";
import { compareDbAndApiPricing } from "./comparePricing";
import { getChangeEventType } from "./getEventChangeType";

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
    if (!currentMeta || !currentMeta.current) throw new Error("Diffed vehicle must have current info");
    
    const changes = {} as VehicleChangeProps;
    let changedCity = false, changedPricing = false;
    const current = currentMeta.current;

    const newStatus = update.idVehicleStatus as unknown as keyof typeof MilesVehicleStatus;
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

    changes.metaId = currentMeta.id;
    changes.event = getChangeEventType(current, changes);

    return {
        changes: changes,
        changedCity: changedCity,
        changedPrice: changedPricing,
    }

}