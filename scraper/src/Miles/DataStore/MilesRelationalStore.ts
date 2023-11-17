import { EntityManager } from "typeorm"
import { MilesCityMeta } from "../Miles.types";
import { City } from "../../entity/Miles/City";
import Point from "../utils/Point";
import { VehicleMeta } from "../../entity/Miles/VehicleMeta";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { VehicleSize } from "../../entity/Miles/VehicleSize";
import { VehicleModel } from "../../entity/Miles/VehicleModel";

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
        return await Promise.all(cities.map(city => this.insertCityMeta(city)));
    }

    private async insertCityMeta(data: MilesCityMeta) {
        const city = new City();
        city.milesId = data.milesId;
        city.name = data.name;
        city.location = new Point(data.latitude, data.longitude).toString();
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
        if (!firstCity) throw new Error(`Cannot insert vehicle with city ${vehicle.idCity} before inserting the city`);

        const newVehicle = new VehicleMeta();
        newVehicle.milesId = vehicle.idVehicle;
        newVehicle.licensePlate = vehicle.LicensePlate;
        newVehicle.model = await this.createVehicleModel(vehicle,
            await this.createVehicleSize(vehicle.VehicleType));
        newVehicle.color = vehicle.VehicleColor;
        newVehicle.firstCity = firstCity;
        newVehicle.isCharity = vehicle.isCharity;
        newVehicle.imageUrl = vehicle.URLVehicleImage;

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

    private async createVehicleModel(vehicle: apiVehicleJsonParsed, size: VehicleSize): Promise<VehicleModel {
        const existing = await this.manager.findOne(VehicleModel, { where: { name: vehicle.VehicleType } });

    }
}