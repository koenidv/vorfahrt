import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import MilesDatabase from "../MilesDatabase";
import { VehicleChangeProps } from "../insert/insertVehicleChange";
import { MilesVehicleStatus } from "@koenidv/abfahrt";
import { VehicleMeta } from "../../entity/Miles/VehicleMeta";
import Point from "../utils/Point";

export async function diffVehicleInfo(currentVehicle: VehicleMeta, apiVehicle: apiVehicleJsonParsed): Promise<VehicleChangeProps> {
    const changes = {} as VehicleChangeProps;
    const current = currentVehicle.current;

    const newStatus = apiVehicle.idVehicleStatus as unknown as typeof MilesVehicleStatus;
    if (newStatus !== current.status) {
        changes.status = newStatus;
    }

    const newLocation = new Point(apiVehicle.Latitude, apiVehicle.Longitude);
    const oldLocation = Point.fromString(current.location);
    if (!newLocation.equalsWithTolerance(oldLocation)) {
        changes.location = newLocation;
    }

    // todo these values should be parsed somewhere else
    if (Number(apiVehicle.FuelPct) !== current.fuelPercent || Number(apiVehicle.RemainingRange) !== current.range) {
        changes.fuelPercent = Number(apiVehicle.FuelPct);
        changes.range = Number(apiVehicle.RemainingRange);
    }

    if (apiVehicle.EVPlugged !== current.charging) {
        changes.charging = apiVehicle.EVPlugged;
        changes.fuelPercent = Number(apiVehicle.FuelPct);
        changes.range = Number(apiVehicle.RemainingRange);
    }

    if (apiVehicle.GSMCoverage !== current.coverageGsm) {
        changes.coverageGsm = apiVehicle.GSMCoverage;
    }
    if (apiVehicle.SatelliteNumber !== current.coverageSatellites) {
        changes.coverageSatellites = apiVehicle.SatelliteNumber;
    }

    // todo handle city and pricing changes



}