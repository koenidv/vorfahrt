import { JsonParseBehaviour, applyJsonParseBehaviourToVehicle } from "@koenidv/abfahrt";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { BaseMilesScraperCycled } from "../BaseMilesScraper";
import { RequestStatus, SOURCE_TYPE, ValueSource } from "../../types";
import { MilesVehicleQueueSync } from "../DataStore/MilesVehicleQueueSync";

export enum QueryPriority { NORMAL = 0.99, LOW = 0.01 }
export interface MilesVehicleSource extends ValueSource { source: SOURCE_TYPE.VEHICLE, priority: QueryPriority }

export default class MilesScraperVehicles extends BaseMilesScraperCycled<apiVehicleJsonParsed, MilesVehicleSource> {
    private normalQueue: number[] = [];
    private lowQueue: number[] = [];

    private onRegister: ((vehicleIds: number[], priority: QueryPriority) => void) | undefined = undefined;
    private onDeregister: ((vehicleIds: number[]) => void) | undefined = undefined;

    register(vehicleIds: number[], priority: QueryPriority): this {
        const notAlreadyInQueue = vehicleIds.filter(el =>
            priority === QueryPriority.LOW
                ? !this.lowQueue.includes(el)
                : !this.normalQueue.includes(el)
        );
        if (notAlreadyInQueue.length === 0) return this;
        if (priority === QueryPriority.LOW) {
            this.normalQueue = this.normalQueue.filter(el => !notAlreadyInQueue.includes(el));
            this.lowQueue.push(...notAlreadyInQueue);
            this.observer.measure("queue-low", this.lowQueue.length);
        } else {
            this.lowQueue = this.lowQueue.filter(el => !notAlreadyInQueue.includes(el));
            this.normalQueue.push(...notAlreadyInQueue);
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

    setOnRegister(listener: (vehicleIds: number[], priority: QueryPriority) => void) {
        if (this.onRegister !== undefined) throw new Error("OnRegister listener already set");
        this.onRegister = listener;
    }

    setOnDeregister(listener: (vehicleIds: number[]) => void) {
        if (this.onDeregister !== undefined) throw new Error("OnDeregister listener already set");
        this.onDeregister = listener;
    }

    getQueue(): { milesId: number, priority: QueryPriority }[] {
        return [...this.normalQueue.map(el => ({ milesId: el, priority: QueryPriority.NORMAL })), ...this.lowQueue.map(el => ({ milesId: el, priority: QueryPriority.LOW }))];
    }

    async cycle(): Promise<{ data: apiVehicleJsonParsed[]; source: MilesVehicleSource; } | null> {
        const next = this.selectNext()
        if (next !== null) {
            const vehicle = await this.fetch(next.id);
            return vehicle === null ? null : {
                data: [vehicle],
                source: { source: SOURCE_TYPE.VEHICLE, priority: next.priority }
            };
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
                .onRequestRetry((_: any, time: number) => this.observer.requestExecuted(RequestStatus.API_ERROR, time, vehicleId))
                .execute();

            if (result.ResponseText === "Vehicle ID not found") {
                this.log("Vehicle", vehicleId, "not found and removed from future queue")
                this.deregister([vehicleId]);
                this.observer.requestExecuted(RequestStatus.NOT_FOUND, result._time, vehicleId);
                return null;
            }

            if (result.Result !== "OK") {
                this.logError("Vehicle", vehicleId, "returned error", result.Result);
                this.logError(result);
                this.observer.requestExecuted(RequestStatus.API_ERROR, result._time, vehicleId);
                return null;
            }

            this.observer.requestExecuted(RequestStatus.OK, result._time, vehicleId);
            const vehicle = result.Data.vehicle[0]
            const vehicleParsed = applyJsonParseBehaviourToVehicle(vehicle, JsonParseBehaviour.PARSE);

            return vehicleParsed;
        } catch (e) {
            this.logError("Error occurred while scraping a vehicle", e);
            this.observer.requestExecuted(RequestStatus.SCRAPER_ERROR, 0, vehicleId);
            return null;
        }
    }

}