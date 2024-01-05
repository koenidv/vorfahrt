import { JsonParseBehaviour, MilesClient, applyJsonParseBehaviourToVehicle } from "@koenidv/abfahrt";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { BaseMilesScraper } from "../BaseMilesScraper";

export enum QueryPriority { NORMAL = 0.99, LOW = 0.01 }

export default class MilesScraperVehicles extends BaseMilesScraper<apiVehicleJsonParsed, QueryPriority> {
    private normalQueue: number[] = [];
    private lowQueue: number[] = [];

    register(vehicleIds: number[], priority: QueryPriority): this {
        // fixme duplicate values can be pushed to the same queue (but not to both)
        if (priority === QueryPriority.LOW) {
            this.normalQueue = this.normalQueue.filter(el => !vehicleIds.includes(el));
            this.lowQueue.push(...vehicleIds);
            this.observer.measure("queue-low", this.lowQueue.length);
        } else {
            this.lowQueue = this.lowQueue.filter(el => !vehicleIds.includes(el));
            this.normalQueue.push(...vehicleIds);
            this.observer.measure("queue-normal", this.normalQueue.length);
        }
        return this;
    }

    deregister(vehicleIds: number[]): this {
        const lowQueueLenghtBefore = this.lowQueue.length;
        const normalQueueLenghtBefore = this.normalQueue.length;
        this.lowQueue = this.lowQueue.filter(el => !vehicleIds.includes(el));
        this.normalQueue = this.normalQueue.filter(el => !vehicleIds.includes(el));
        if (this.lowQueue.length !== lowQueueLenghtBefore) this.observer.measure("queue-low", this.lowQueue.length);
        if (this.normalQueue.length !== normalQueueLenghtBefore) this.observer.measure("queue-normal", this.normalQueue.length);
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

        let id: number | undefined;
        let priority: QueryPriority;
        if (random < QueryPriority.LOW * this.lowQueue.length || this.normalQueue.length === 0) {
            id = this.lowQueue.shift() as number;
            this.lowQueue.push(id);
            priority = QueryPriority.LOW;
        } else {
            id = this.normalQueue.shift();
            if (id !== undefined) this.normalQueue.push(id);
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
                .onRequestRetry((_: any, time: number) => this.observer.requestExecuted("API_ERROR", time))
                .execute();

            if (result.ResponseText === "Vehicle ID not found") {
                this.log("Vehicle", vehicleId, "not found and removed from future queue")
                this.deregister(vehicleId);
                this.observer.requestExecuted("NOT_FOUND", result._time);
                return null;
            }

            if (result.Result !== "OK") {
                this.logError("Vehicle", vehicleId, "returned error", result.Result);
                this.logError(result);
                this.observer.requestExecuted("API_ERROR", result._time);
                return null;
            }

            this.observer.requestExecuted("OK", result._time);
            const vehicle = result.Data.vehicle[0]
            const vehicleParsed = applyJsonParseBehaviourToVehicle(vehicle, JsonParseBehaviour.PARSE);

            return vehicleParsed;
        } catch (e) {
            this.logError("Error occurred while scraping a vehicle", e);
            this.observer.requestExecuted("SCRAPER_ERROR", 0);
            return null;
        }
    }

}