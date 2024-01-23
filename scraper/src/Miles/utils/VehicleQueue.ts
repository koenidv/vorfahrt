import { QueryPriority } from "../Scraping/MilesScraperVehicles";

export type QueueSizes = { [key: string]: number };

export interface VehicleQueueInterface {
    insert: (vehicleIds: number[], priority: QueryPriority) => number[];
    remove: (vehicleIds: number[]) => number[];
    getQueue: () => { milesId: number, priority: QueryPriority }[];
    getQueueSizes: () => QueueSizes;
    getRandom: () => { id: number, priority: QueryPriority } | null;
}

export class VehicleQueue implements VehicleQueueInterface {
    queue = new Map<number, number>();

    constructor() { }

    insert(vehicleIds: number[], priority: number) {
        const changed = [];
        for (const vehicleId of vehicleIds) {
            const currentPriority = this.queue.get(vehicleId);
            if (currentPriority !== priority) {
                this.queue.set(vehicleId, priority);
                changed.push(vehicleId);
                continue;
            }
        }
        return changed;
    }

    remove(vehicleIds: number[]) {
        const changed = [];
        for (const vehicleId of vehicleIds) {
            const currentPriority = this.queue.get(vehicleId);
            if (currentPriority === undefined) continue;
            this.queue.delete(vehicleId);
            changed.push(vehicleId);
        }
        return changed;
    }

    getQueue() {
        return [...this.queue.entries()].map(([milesId, priority]) => ({ milesId, priority }));
    }

    getQueueSizes() {
        let queueSizes: QueueSizes = {}
        const stringKeys = Object.keys(QueryPriority).filter((v) => isNaN(Number(v)))
        for (const [_index, key] of stringKeys.entries()) {
            queueSizes[key] = [...this.queue.values()].filter(el => el === QueryPriority[key as keyof typeof QueryPriority]).length;
        }
        return queueSizes;
    }

    getRandom() {
        const totalPriority = [...this.queue.values()].reduce((a, b) => a + b, 0);
        const random = Math.random() * totalPriority;
        let current = 0;
        for (const [id, priority] of this.queue.entries()) {
            current += priority;
            if (current >= random) return { id, priority };
        }
        return null;
    }

}