import { EntityManager } from "typeorm";
import { VehicleMeta } from "@vorfahrt/shared";

/**
 * This class stores used IDs for vehicles, models, etc.
 * This is to save on database queries, which have shown to be a bottleneck
 * Vehicles, Models, Citites, etc are expected to not be deleted from the database.
 */
export class MilesRelationalCache {
    manager: EntityManager;

    constructor(manager: EntityManager) {
        this.manager = manager;
    }

    /**
     * Vehicle cache: Set of known vehicle IDs 
     */
    knownVehicles = new Set<number>();

    /**
     * This method should be called when a vehicle is registered to avoid unnecessary database queries
     * @param id The miles vehicle ID
     */
    registerVehicleKnown(id: number) {
        this.knownVehicles.add(id);
    }

    /**
     * This method should be called to restore the cache on startup and avoid unnecessary database queries
     * @param ids The miles vehicle IDs
     */
    registerVehiclesKnown(...ids: number[]) {
        ids.forEach(id => this.knownVehicles.add(id));
    }

    /**
     * Checks if a vehicle is known to the cache or database
     * This cache is not invalidated, so its sensitivity might not be 100%
     * @param id The miles vehicle ID
     * @returns Whether the vehicle is known
     */
    async isVehicleKnown(id: number): Promise<boolean> {
        if (this.knownVehicles.has(id)) return true;
        const existsInDb = await this.manager.exists(VehicleMeta, { where: { milesId: id } });
        if (existsInDb) this.knownVehicles.add(id);
        return existsInDb;
    }

}