import { JsonParseBehaviour, MilesClient, applyJsonParseBehaviourToVehicle } from "@koenidv/abfahrt";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { BaseMilesScraperCycled } from "../BaseMilesScraper";
import { RequestStatus, SOURCE_TYPE, ValueSource } from "../../types";
import { SystemController } from "../../SystemController";
import { VehicleQueueInterface } from "../utils/VehicleQueue";

export enum QueryPriority {
    HIGH = 999,
    NORMAL = 0.99,
    LOW = 0.01,
}

export interface MilesVehicleSource extends ValueSource { source: SOURCE_TYPE.VEHICLE, priority: QueryPriority }

export default class MilesScraperVehicles extends BaseMilesScraperCycled<apiVehicleJsonParsed, MilesVehicleSource> {
    private queue: VehicleQueueInterface;

    constructor(abfahrt: MilesClient, cyclesMinute: number, scraperId: string, systemController: SystemController, queue: VehicleQueueInterface) {
        super(abfahrt, cyclesMinute, scraperId, systemController);
        this.queue = queue;
    }

    register(vehicleIds: number[], priority: QueryPriority, duringInit?: boolean): this {
        const changed = this.queue.insert(vehicleIds, priority, duringInit);
        if (changed.length !== 0) {
            console.log("smt changed on insert")
        this.measureQueueSizes();
        }
        return this;
    }

    deregister(vehicleIds: number[]): this {
        const changed = this.queue.remove(vehicleIds);
        if (changed.length !== 0) this.measureQueueSizes();
        return this;
    }

    private measureQueueSizes() {
        const queueSizes = this.queue.getQueueSizes();
        for (const [key, value] of Object.entries(queueSizes)) {
            this.observer.measure(`queue-${key}`, value);
        }
    }

    getQueue(): { milesId: number, priority: QueryPriority | null }[] {
        return this.queue.getQueue();
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
        const selected = this.queue.getRandom();
        if (selected === null) {
            this.logWarn("No vehicles in queue: cycle will be skipped")
            return null;
        }
        return selected;
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