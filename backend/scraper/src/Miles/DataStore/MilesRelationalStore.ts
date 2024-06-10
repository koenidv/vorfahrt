import { EntityManager } from "typeorm";
import { MilesCityMeta, MilesVehicleDetails } from "../Miles.types";
import { City } from "@vorfahrt/shared";
import GeoPoint from "../utils/GeoPoint";
import { VehicleMeta } from "@vorfahrt/shared";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { VehicleSize } from "@vorfahrt/shared";
import { VehicleModel } from "@vorfahrt/shared";
import { MilesVehicleFuelReturn, MilesVehicleTransmissionReturn } from "@koenidv/abfahrt";
import clc from "cli-color";
import { VehicleLastKnown } from "@vorfahrt/shared";
import { RESTORE_NORMAL_STATES, RESTORE_SLOW_STATES } from "./MilesRelationalStore.config";
import { MilesRelationalCache } from "./MilesRelationalCache";

export class MilesRelationalStore {
    manager: EntityManager;
    cache: MilesRelationalCache;

    constructor(manager: EntityManager) {
        this.manager = manager;
        this.cache = new MilesRelationalCache(manager);
    }

    /**
     * Saves cities from UserHello to the database
     * @param cities Array of cities from UserHello
     */
    async insertCitiesMeta(...cities: MilesCityMeta[]) {
        return await Promise.all(cities.map(city => this.createCityMeta(city)));
    }

    async restoreVehicleQueue(): Promise<{ normalQueue: number[], slowQueue: number[], highestId: number }> {
        const normalQueue = (await this.manager.createQueryBuilder()
            .select("v.milesId").from(VehicleLastKnown, "v")
            .where("v.status IN (:...statuses)", { statuses: RESTORE_NORMAL_STATES })
            .getRawMany()
        ).map((el: { v_milesId: string }) => Number(el.v_milesId));
        const slowQueue = (await this.manager.createQueryBuilder()
            .select("v.milesId").from(VehicleLastKnown, "v")
            .where("v.status IN (:...statuses)", { statuses: RESTORE_SLOW_STATES })
            .getRawMany()
        ).map((el: { v_milesId: string }) => Number(el.v_milesId));
        const highestId = Number(
            (await this.manager.createQueryBuilder()
                .select("MAX(v.milesId)", "maxId").from(VehicleLastKnown, "v")
                .getRawOne()
            ).maxId);

        this.cache.registerVehiclesKnown(...normalQueue, ...slowQueue);
        return { normalQueue, slowQueue, highestId };
    }

    private async createCityMeta(data: MilesCityMeta) {
        if (await this.manager.exists(City, { where: { milesId: data.idCity } })) return;

        const city = new City();
        city.milesId = data.idCity;
        city.name = data.name;
        city.location = new GeoPoint(data.location_lat, data.location_long).toString();
        return await this.manager.insert(City, city);
    }

    private async findCity(milesId: string): Promise<City | null> {
        return await this.manager.findOne(City, { where: { milesId } });
    }

    async handleVehicle(vehicle: apiVehicleJsonParsed) {
        await this.createVehicleMeta(vehicle);
        // todo insert damages here
        await this.saveLastKnown(vehicle);
    }

    private async createVehicleMeta(vehicle: apiVehicleJsonParsed) {
        if (await this.cache.isVehicleKnown(vehicle.idVehicle)) return;

        const firstCity = await this.findCity(vehicle.idCity);
        if (!firstCity) {
            console.error(
                clc.bgRedBright("MilesRelationalStore"),
                clc.red(`Skipping vehicle ${vehicle.idVehicle}: City ${vehicle.idCity} not found`));
            return;
        }

        const vehicleDetails = vehicle.JSONFullVehicleDetails;
        if (!vehicleDetails) {
            console.error(
                clc.bgRedBright("MilesRelationalStore"),
                clc.red(`Skipping vehicle ${vehicle.idVehicle} - No details found`));
            return;
        }

        const model = await this.createVehicleModel(
            vehicle,
            await this.createVehicleSize(vehicle.VehicleSize),
            vehicleDetails.vehicleDetails);
        if (model === undefined) return;

        const newVehicle = new VehicleMeta();
        newVehicle.milesId = vehicle.idVehicle;
        newVehicle.licensePlate = vehicle.LicensePlate;
        newVehicle.model = model;
        newVehicle.color = vehicle.VehicleColor;
        newVehicle.firstFoundCity = firstCity;
        newVehicle.isCharity = typeof vehicle.isCharity === "boolean" ? vehicle.isCharity : vehicleDetails.vehicleDescriptors.isCharity;
        newVehicle.image = vehicle.URLVehicleImage
            .replace("https://api.app.miles-mobility.com/static/img/cars/small/", "");

        await this.manager.save(newVehicle);
        this.cache.registerVehicleKnown(vehicle.idVehicle);
    }

    private async createVehicleSize(name: string): Promise<VehicleSize> {
        const existing = await this.manager.findOne(VehicleSize, { where: { name } });
        if (existing) return existing;

        const size = new VehicleSize();
        size.name = name;
        return await this.manager.save(VehicleSize, size);
    }

    private async createVehicleModel(vehicle: apiVehicleJsonParsed, size: VehicleSize, details: MilesVehicleDetails): Promise<VehicleModel | undefined> {
        const existing = await this.manager.findOne(VehicleModel, { where: { name: vehicle.VehicleType } });
        if (existing) return existing;

        const model = new VehicleModel();
        model.name = vehicle.VehicleType;
        model.size = size;
        model.seats = Number(details.find(d => d.key === "vehicle_details_seats")!.value);
        model.electric = vehicle.isElectric;
        model.enginePower = vehicle.EnginePower ?? Number(details.find(d => d.key === "vehicle_details_engine_power")!.value.replace("PS", ""));
        model.transmission = details.find(d => d.key === "vehicle_details_transmission")!.value as keyof typeof MilesVehicleTransmissionReturn;
        model.fuelType = details.find(d => d.key === "vehicle_details_fuel")!.value as keyof typeof MilesVehicleFuelReturn;

        try {
            return await this.manager.save(VehicleModel, model);
        } catch (e) {
            console.error(
                clc.bgRedBright("MilesRelationalStore"),
                clc.red(`Error saving vehicle ${vehicle.idVehicle}: ${e}`));
            return;
        }
    }

    private async saveLastKnown(vehicle: apiVehicleJsonParsed) {
        const lastKnown = new VehicleLastKnown();
        lastKnown.milesId = vehicle.idVehicle;
        lastKnown.status = vehicle.idVehicleStatus.trim();
        lastKnown.latitude = vehicle.Latitude;
        lastKnown.longitude = vehicle.Longitude;
        const charging =
            vehicle.EVPlugged ||
            vehicle.JSONFullVehicleDetails?.vehicleBanner.some(banner => banner.text === "⚡Vehicle plugged") === true;
        lastKnown.charging = charging;
        lastKnown.charge = vehicle.FuelPct_parsed!;
        lastKnown.range = vehicle.RemainingRange_parsed!;
        lastKnown.discounted = vehicle.RentalPrice_discounted_parsed !== null;
        lastKnown.damageCount = vehicle.JSONVehicleDamages?.length ?? 0;
        lastKnown.coverageGsm = vehicle.GSMCoverage!;
        lastKnown.coverageGps = vehicle.SatelliteNumber!;
        return await this.manager.save(VehicleLastKnown, lastKnown);
    }
}