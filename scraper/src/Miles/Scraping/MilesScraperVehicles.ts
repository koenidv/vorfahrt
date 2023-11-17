import { JsonParseBehaviour, MilesClient, applyJsonParseBehaviourToVehicle } from "@koenidv/abfahrt";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";

export enum QueryPriority { NORMAL = 0.99, LOW = 0.01 }

export default class MilesScraperVehicles {
    client: MilesClient;
    requestsPerSecond: number;

    normalQueue: number[] = [];
    lowQueue: number[] = [];

    interval = null;

    listeners: ((vehicle: apiVehicleJsonParsed, priority: QueryPriority) => {})[] = [];

    constructor(client: MilesClient, requestsPerSecond) {
        this.client = client;
        this.requestsPerSecond = requestsPerSecond;
        console.log(`Initialized MilesScraperVehicles with ${this.requestsPerSecond}rps`)
    }

    start() {
        this.interval = setInterval(() => {
            const { id, priority } = this.selectNext();
            this.execute(id, priority);
        }, 1000 / this.requestsPerSecond);
    }

    stop() {
        clearInterval(this.interval);
    }

    addListener(listener: (vehicle: apiVehicleJsonParsed, priority: QueryPriority) => {}) {
        this.listeners.push(listener);
    }

    register(vehicleId: number, priority: QueryPriority) {
        if (priority === QueryPriority.LOW) {
            this.normalQueue = this.normalQueue.filter(el => el !== vehicleId);
            this.lowQueue.push(vehicleId);
        } else {
            this.lowQueue = this.lowQueue.filter(el => el !== vehicleId);
            this.normalQueue.push(vehicleId);
        }
    }

    deregister(vehicleId: number) {
        this.lowQueue = this.lowQueue.filter(el => el !== vehicleId);
        this.normalQueue = this.normalQueue.filter(el => el !== vehicleId);
    }

    private selectNext(): { id: number, priority: QueryPriority } {
        const random = Math.random() * (this.normalQueue.length + this.lowQueue.length);

        let id: number;
        let priority: QueryPriority;
        if (random < QueryPriority.LOW * this.lowQueue.length) {
            id = this.lowQueue.shift();
            this.lowQueue.push(id);
            priority = QueryPriority.LOW;
        } else {
            id = this.normalQueue.shift();
            this.normalQueue.push(id);
            priority = QueryPriority.NORMAL;
        }

        if (id === undefined) throw new Error("No next vehicle found");
        return { id, priority };
    }


    private async execute(vehicleId: number, priority: QueryPriority) {
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

        this.listeners.forEach(listener => listener(vehicleParsed,));
    }

}