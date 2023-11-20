import { EntityManager } from "typeorm"
import { MilesCityMeta, MilesVehicleDetails } from "../Miles.types";
import { City } from "../../entity/Miles/City";
import GeoPoint from "../utils/GeoPoint";
import { VehicleMeta } from "../../entity/Miles/VehicleMeta";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { VehicleSize } from "../../entity/Miles/VehicleSize";
import { VehicleModel } from "../../entity/Miles/VehicleModel";
import { MilesVehicleFuelReturn, MilesVehicleTransmissionReturn } from "@koenidv/abfahrt";
import clc from "cli-color";

export class MilesRelationalStore {
    manager: EntityManager;

    constructor(manager: EntityManager) {
        this.manager = manager;
    }

    /**
     * Saves cities from UserHello to the database
     * @param cities Array of cities from UserHello
     */
    async insertCitiesMeta(...cities: MilesCityMeta[]) {
        return await Promise.all(cities.map(city => this.createCityMeta(city)));
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
    }

    private async createVehicleMeta(vehicle: apiVehicleJsonParsed) {
        if (await this.vehicleExists(vehicle.idVehicle)) return;

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

        const newVehicle = new VehicleMeta();
        newVehicle.milesId = vehicle.idVehicle;
        newVehicle.licensePlate = vehicle.LicensePlate;
        newVehicle.model = await this.createVehicleModel(
            vehicle,
            await this.createVehicleSize(vehicle.VehicleSize),
            vehicleDetails.vehicleDetails);
        newVehicle.color = vehicle.VehicleColor;
        newVehicle.firstFoundCity = firstCity;
        newVehicle.isCharity = typeof vehicle.isCharity === "boolean" ? vehicle.isCharity : vehicleDetails.vehicleDescriptors.isCharity;
        newVehicle.image = vehicle.URLVehicleImage
            .replace("https://api.app.miles-mobility.com/static/img/cars/small/", "");

        await this.manager.save(newVehicle);
    }

    private async vehicleExists(milesId: number): Promise<boolean> {
        return await this.manager.exists(VehicleMeta, { where: { milesId } });
    }

    private async createVehicleSize(name: string): Promise<VehicleSize> {
        const existing = await this.manager.findOne(VehicleSize, { where: { name } });
        if (existing) return existing;

        const size = new VehicleSize();
        size.name = name;
        return await this.manager.save(VehicleSize, size);
    }

    private async createVehicleModel(vehicle: apiVehicleJsonParsed, size: VehicleSize, details: MilesVehicleDetails): Promise<VehicleModel> {
        const existing = await this.manager.findOne(VehicleModel, { where: { name: vehicle.VehicleType } });
        if (existing) return existing;

        const model = new VehicleModel();
        model.name = vehicle.VehicleType;
        model.size = size;
        model.seats = Number(details.find(d => d.key === "vehicle_details_seats").value);
        model.electric = vehicle.isElectric;
        model.enginePower = vehicle.EnginePower ?? Number(details.find(d => d.key === "vehicle_details_engine_power").value.replace("PS", ""));
        model.transmission = details.find(d => d.key === "vehicle_details_transmission").value as keyof typeof MilesVehicleTransmissionReturn;
        model.fuelType = details.find(d => d.key === "vehicle_details_fuel").value as keyof typeof MilesVehicleFuelReturn;

        try {
            return await this.manager.save(VehicleModel, model);
        } catch (e) {
            console.error(
                clc.bgRedBright("MilesRelationalStore"),
                clc.red(`Error saving vehicle ${vehicle.idVehicle}: ${e}`));
            return;
        }
    }
}