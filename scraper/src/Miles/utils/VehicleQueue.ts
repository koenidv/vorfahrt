import { QueryPriority } from "../Scraping/MilesScraperVehicles";


export type QueueSizes = { [key: string]: number };

export interface VehicleQueueInterface {
    insert: (vehicleIds: number[], priority: QueryPriority | null, duringInit?: boolean) => number[];
    remove: (vehicleIds: number[]) => number[];
    getQueue: () => { milesId: number, priority: QueryPriority | null }[];
    getQueueSizes: () => QueueSizes;
    getRandom: () => { id: number, priority: QueryPriority } | null;
}

export type QueueItemData = { priority: QueryPriority | null, updated: Date, fromInit?: boolean }

export class VehicleQueue implements VehicleQueueInterface {
    queue = new Map<number, QueueItemData>();

    constructor() { }

    insert(vehicleIds: number[], priority: QueryPriority | null, fromInit?: boolean) {
        const changed = [];
        for (const vehicleId of vehicleIds) {
            const currentData = this.queue.get(vehicleId);
            if (currentData?.priority !== priority) {
                this.queue.set(vehicleId, { priority, updated: new Date(), fromInit });
                changed.push(vehicleId);
                continue;
            }
        }
        return changed;
    }

    remove(vehicleIds: number[]) {
        const changed = [];
        for (const vehicleId of vehicleIds) {
            const currentData = this.queue.get(vehicleId);
            if (currentData === undefined) continue;
            this.queue.delete(vehicleId);
            changed.push(vehicleId);
        }
        return changed;
    }

    getQueue() {
        return [...this.queue.entries()].map(([milesId, data]) => ({ milesId, priority: data.priority }));
    }

    getQueueSizes() {
        let queueSizes: QueueSizes = {}
        const enumKeys = Object.keys(QueryPriority).filter((v) => isNaN(Number(v)))
        for (const [_index, key] of enumKeys.entries()) {
            queueSizes[key] = [...this.queue.values()].filter(el => el.priority === QueryPriority[key as keyof typeof QueryPriority]).length;
        }
        return queueSizes;
    }

    getRandom() {
        const copiedEntries = [...this.queue.entries()];
        const totalPriority = copiedEntries.reduce((acc, [_id, data]) => acc + (data.priority ?? 0), 0);
        const random = Math.random() * totalPriority;
        let current = 0;
        for (const [id, data] of copiedEntries) {
            current += data.priority ?? 0;
            if (current >= random) {
                return { id, priority: data.priority as QueryPriority };
            }
        }
        return null;
    }

}