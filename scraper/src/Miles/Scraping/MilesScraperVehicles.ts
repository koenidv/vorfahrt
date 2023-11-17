import { MilesClient } from "@koenidv/abfahrt";

export enum QueryPriority { NORMAL = 0.99, LOW = 0.01 }

export default class MilesScraperVehicles {
    client: MilesClient;
    requestsPerSecond: number;

    normalQueue: number[] = [];
    lowQueue: number[] = [];

    interval = null;

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
        const random = Math.random();

        let next: number;
        if (random < QueryPriority.LOW) {
            next = this.lowQueue.shift();
            this.lowQueue.push(next);
        } else {
            next = this.normalQueue.shift();
            this.normalQueue.push(next);
        }

        if (!next) throw new Error("No next vehicle found");
        return next;
    }


    private async execute(vehicleId: number) {
        console.log("executing", vehicleId)
        // todo deregister vehicle if not found
    }

}