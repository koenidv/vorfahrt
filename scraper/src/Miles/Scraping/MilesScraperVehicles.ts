import { JsonParseBehaviour, MilesClient, applyJsonParseBehaviourToVehicle } from "@koenidv/abfahrt";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { BaseMilesScraper } from "../BaseMilesScraper";

export enum QueryPriority { NORMAL = 0.99, LOW = 0.01 }

export default class MilesScraperVehicles extends BaseMilesScraper<apiVehicleJsonParsed> {
    private normalQueue: number[] = [];
    private lowQueue: number[] = [];
    
    private requestsExecuted = 0;
    private responses: ("OK" | "API_ERROR" | "NOT_FOUND" | "SCRAPER_ERROR")[] = [];
    private responseTimes: number[] = [];

    register(vehicleId: number, priority: QueryPriority): this {
        if (priority === QueryPriority.LOW) {
            this.normalQueue = this.normalQueue.filter(el => el !== vehicleId);
            this.lowQueue.push(vehicleId);
        } else {
            this.lowQueue = this.lowQueue.filter(el => el !== vehicleId);
            this.normalQueue.push(vehicleId);
        }
        return this;
    }

    deregister(vehicleId: number): this {
        this.lowQueue = this.lowQueue.filter(el => el !== vehicleId);
        this.normalQueue = this.normalQueue.filter(el => el !== vehicleId);
        return this;
    }

    async cycle(): Promise<{ data: apiVehicleJsonParsed[]; source: QueryPriority; } | null> {
        const next = this.selectNext()
        if (next !== null) {
            const vehicle = await this.fetch(next.id);
            return { data: [vehicle], source: next.priority };
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
            this.requestsExecuted++;
            const start = Date.now();
            const result = await this.abfahrt.vehicles.getVehicleById(vehicleId);
            this.responseTimes.push(Date.now() - start);

            if (result.ResponseText === "Vehicle ID not found") {
                this.log("Vehicle", vehicleId, "not found and removed from future queue")
                this.deregister(vehicleId);
                this.responses.push("NOT_FOUND");
                return;
            }

            if (result.Result !== "OK") {
                this.logError("Vehicle", vehicleId, "returned error", result.Result);
                this.logError(result);
                this.responses.push("API_ERROR");
                return;
            }

            this.responses.push("OK");
            const vehicle = result.Data.vehicle[0]
            const vehicleParsed = applyJsonParseBehaviourToVehicle(vehicle, JsonParseBehaviour.PARSE);

            return vehicleParsed;
        } catch (e) {
            this.responses.push("SCRAPER_ERROR");
            this.logError("Error occurred while scraping a vehicle", e);
            return null;
        }
    }

    popSystemStatus(): { [key: string]: number; } {
        const responsesCount = this.responses.reduce((acc, cur) => {
            acc[cur] = (acc[cur] ?? 0) + 1;
            return acc;
        }, {} as { [key: string]: number });
        const averageResponseTime = this.responseTimes.length ? this.responseTimes.reduce((acc, cur) => acc + cur, 0) / this.responseTimes.length : undefined;
        const requestsExecuted = this.requestsExecuted;

        this.resetSystemStatus();
        return {
            ...responsesCount,
            requestsExecuted,
            averageResponseTime,
            normalQueueCount: this.normalQueue.length,
            lowQueueCount: this.lowQueue.length,
        }
    }

    private resetSystemStatus() {
        this.requestsExecuted = 0;
        this.responses = [];
        this.responseTimes = [];
    }

}