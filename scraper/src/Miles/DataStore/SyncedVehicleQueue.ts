import { EntityManager } from "typeorm";
import { InternalQueuedVehicle } from "../../entity/Miles/InternalQueuedVehicle";
import { VehicleQueue } from "../utils/VehicleQueue";

export enum MilesVehicleQueueAction {
    REGISTER = "REGISTER",
    DEREGISTER = "DEREGISTER",
    CHANGE = "CHANGE"
};

export type MilesVehicleQueueChange = {
    milesId: number
    priority: number
    action: MilesVehicleQueueAction
    timestamp: Date
};

export class SyncedVehicleQueue extends VehicleQueue {
    manager: EntityManager;
    syncIntervalMs: number;
    changes: MilesVehicleQueueChange[] = [];
    private syncInterval: NodeJS.Timeout | null = null

    constructor(manager: EntityManager, syncIntervalMs: number) {
        super();
        this.manager = manager;
        this.syncIntervalMs = syncIntervalMs;
    }

    override insert(vehicleIds: number[], priority: number, duringInit = true) {
        const changed = [];
        for (const vehicleId of vehicleIds) {
            const currentPriority = this.queue.get(vehicleId);
            if (currentPriority === undefined) {
                this.queue.set(vehicleId, priority);
                if (!duringInit)
                    this.changes.push({
                        milesId: vehicleId,
                        priority,
                        action: MilesVehicleQueueAction.REGISTER,
                        timestamp: new Date()
                    });
                changed.push(vehicleId);
                continue;
            }
            if (currentPriority !== priority) {
                this.queue.set(vehicleId, priority);
                if (!duringInit)
                    this.changes.push({
                        milesId: vehicleId,
                        priority,
                        action: MilesVehicleQueueAction.CHANGE,
                        timestamp: new Date()
                    });
                changed.push(vehicleId);
                continue;
            }
        }
        return changed;
    }

    override remove(vehicleIds: number[]) {
        const changed = [];
        for (const vehicleId of vehicleIds) {
            const currentPriority = this.queue.get(vehicleId);
            if (currentPriority === undefined) continue;
            this.queue.delete(vehicleId);
            this.changes.push({
                milesId: vehicleId,
                priority: currentPriority,
                action: MilesVehicleQueueAction.DEREGISTER,
                timestamp: new Date()
            });
            changed.push(vehicleId);
        }
        return changed;
    }

    // todo update update date if vehicle request was executed and is still in invisible state

    start(): this {
        if (this.syncInterval !== null || this.syncIntervalMs === 0) return this;
        this.syncInterval = setInterval(async () => await this.sync(), this.syncIntervalMs);
        return this;
    }

    async sync() {
        await this.syncUpstream()
        await this.syncDownstream()
    }

    async syncUpstream() {
        await this.manager.transaction(async manager => {
            console.log("now syncing", this.changes.length, "changes")
            while (this.changes.length > 0) {
                const thisChange = this.changes.pop();
                if (thisChange === undefined) continue;
                if (thisChange.action === MilesVehicleQueueAction.REGISTER || thisChange.action === MilesVehicleQueueAction.CHANGE) {
                    console.log("registering", thisChange.milesId)
                    await manager.createQueryBuilder()
                        .insert()
                        .into(InternalQueuedVehicle)
                        .values({
                            milesId: thisChange.milesId,
                            priority: thisChange.priority,
                            updated: thisChange.timestamp
                        })
                        .onConflict('("milesId") DO UPDATE SET priority = :priority, updated = :updated WHERE i.updated < :updated')
                        .setParameter("priority", thisChange.priority)
                        .setParameter("updated", thisChange.timestamp)
                        .execute()

                    // todo

                } else if (thisChange.action === MilesVehicleQueueAction.DEREGISTER) {
                    console.log("deregistering", thisChange.milesId)
                    await manager.createQueryBuilder()
                        .delete()
                        .from(InternalQueuedVehicle)
                        .where("milesId = :milesId", { milesId: thisChange.milesId })
                        .andWhere("updated < :timestamp", { timestamp: thisChange.timestamp })
                        .execute();
                }
            }
        });
    }

    async syncDownstream() {

    }

    diff() {

    }



}