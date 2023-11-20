import { JsonParseBehaviour, MilesClient, applyJsonParseBehaviourToVehicle } from "@koenidv/abfahrt";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { BaseMilesScraper } from "../BaseMilesScraper";

export enum QueryPriority { NORMAL = 0.99, LOW = 0.01 }

export default class MilesScraperVehicles extends BaseMilesScraper<apiVehicleJsonParsed> {
    private normalQueue: number[] = [];
    private lowQueue: number[] = [];

    register(vehicleId: number, priority: QueryPriority): this {
        if (priority === QueryPriority.LOW) {
            this.normalQueue = this.normalQueue.filter(el => el !== vehicleId);
            this.lowQueue.push(vehicleId);
            this.observer.measure(this, "queue-low", this.lowQueue.length);
        } else {
            this.lowQueue = this.lowQueue.filter(el => el !== vehicleId);
            this.normalQueue.push(vehicleId);
            this.observer.measure(this, "queue-normal", this.normalQueue.length);
        }
        return this;
    }

    deregister(vehicleId: number): this {
        this.lowQueue = this.lowQueue.filter(el => el !== vehicleId);
        this.normalQueue = this.normalQueue.filter(el => el !== vehicleId);
        this.observer.measure(this, "queue-low", this.lowQueue.length);
        this.observer.measure(this, "queue-normal", this.normalQueue.length);
        return this;
    }

    async cycle(): Promise<{ data: apiVehicleJsonParsed[]; source: QueryPriority; } | null> {
        const next = this.selectNext()
        if (next !== null) {
            const vehicle = await this.fetch(next.id);
            return vehicle === null ? null : { data: [vehicle], source: next.priority };
        }
        return null;
    }

    private selectNext(): { id: number, priority: QueryPriority } | null {
        const random = Math.random() * (this.normalQueue.length + this.lowQueue.length);

        let id: number;
        let priority: QueryPriority;
        if (random < QueryPriority.LOW * this.lowQueue.length || this.normalQueue.length === 0) {
            id = this.lowQueue.shift();
            this.lowQueue.push(id);
            priority = QueryPriority.LOW;
        } else {
            id = this.normalQueue.shift();
            this.normalQueue.push(id);
            priority = QueryPriority.NORMAL;
        }

        if (id === undefined) {
            this.logWarn("No vehicles in queue: cycle will be skipped")
            return null;
        }
        return { id, priority };
    }


    private async fetch(vehicleId: number): Promise<apiVehicleJsonParsed | null> {
        try {
            const result = await this.abfahrt.createGetVehicle(vehicleId)
                .onRequestRetry((_: any, time: number) => this.observer.requestExecuted(this, "API_ERROR", time))
                .execute();

            if (result.ResponseText === "Vehicle ID not found") {
                this.log("Vehicle", vehicleId, "not found and removed from future queue")
                this.deregister(vehicleId);
                this.observer.requestExecuted(this, "NOT_FOUND", result._time);
                return null;
            }

            if (result.Result !== "OK") {
                this.logError("Vehicle", vehicleId, "returned error", result.Result);
                this.logError(result);
                this.observer.requestExecuted(this, "API_ERROR", result._time);
                return null;
            }

            this.observer.requestExecuted(this, "OK", result._time);
            const vehicle = result.Data.vehicle[0]
            const vehicleParsed = applyJsonParseBehaviourToVehicle(vehicle, JsonParseBehaviour.PARSE);

            return vehicleParsed;
        } catch (e) {
            this.logError("Error occurred while scraping a vehicle", e);
            this.observer.requestExecuted(this, "SCRAPER_ERROR", 0);
            return null;
        }
    }

}