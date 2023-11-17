import { JsonParseBehaviour, MilesClient, applyJsonParseBehaviourToVehicle } from "@koenidv/abfahrt";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";

export enum QueryPriority { NORMAL = 0.99, LOW = 0.01 }

export default class MilesScraperVehicles {
    client: MilesClient;
    requestsPerSecond: number;

    normalQueue: number[] = [];
    lowQueue: number[] = [];

    interval = null;

    listeners: ((vehicle: apiVehicleJsonParsed) => {})[] = [];

    constructor(client: MilesClient, requestsPerSecond) {
        this.client = client;
        this.requestsPerSecond = requestsPerSecond;
        console.log(`Initialized MilesScraperVehicles with ${this.requestsPerSecond}rps`)
    }

    start() {
        this.interval = setInterval(() => {
            this.execute(this.selectNext());
        }, 1000 / this.requestsPerSecond);
    }

    stop() {
        clearInterval(this.interval);
    }

    addListener(listener: (vehicle: apiVehicleJsonParsed) => {}) {
        this.listeners.push(listener);
    }

    register(vehicleId: number, priority: QueryPriority) {
        if (priority === QueryPriority.LOW) {
            this.lowQueue.push(vehicleId);
        } else {
            this.normalQueue.push(vehicleId);
        }
    }

    deregister(vehicleId: number) {
        this.lowQueue = this.lowQueue.filter(el => el !== vehicleId);
        this.normalQueue = this.normalQueue.filter(el => el !== vehicleId);
    }

    private selectNext(): number {
        const random = Math.random() * (this.normalQueue.length + this.lowQueue.length);

        let next: number;
        if (random < QueryPriority.LOW * this.lowQueue.length) {
            next = this.lowQueue.shift();
            this.lowQueue.push(next);
        } else {
            next = this.normalQueue.shift();
            this.normalQueue.push(next);
        }

        if (next === undefined) throw new Error("No next vehicle found");
        return next;
    }


    private async execute(vehicleId: number) {
        console.log("Fetching single vehicle", vehicleId)
        const result = await this.client.vehicles.getVehicleById(vehicleId);

        if (result.ResponseText === "Vehicle ID not found") {
            console.info("Vehicle", vehicleId, "not found and removed from future queue")
            this.deregister(vehicleId);
            return;
        }

        if (result.Result !== "OK") {
            console.warn("Vehicle", vehicleId, "returned error", result.Result);
            console.warn(result);
            return;
        }


        const vehicle = result.Data.vehicle[0]
        const vehicleParsed = applyJsonParseBehaviourToVehicle(vehicle, JsonParseBehaviour.PARSE);

        this.listeners.forEach(listener => listener(vehicleParsed));
    }

}