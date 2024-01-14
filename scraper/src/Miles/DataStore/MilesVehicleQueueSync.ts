import { EntityManager } from "typeorm";
import MilesScraperVehicles from "../Scraping/MilesScraperVehicles";
import { InternalQueuedVehicle } from "../../entity/Miles/InternalQueuedVehicle";

export enum MilesVehicleQueueAction {
    REGISTER = "REGISTER",
    DEREGISTER = "DEREGISTER"
};

export type MilesVehicleQueueChange = {
    milesId: number
    priority: number
    action: MilesVehicleQueueAction
    timestamp: Date
};

export class MilesVehicleQueueSync {
    manager: EntityManager;
    syncIntervalMs: number;
    changes: MilesVehicleQueueChange[] = [];

    private syncedScraper: MilesScraperVehicles;
    private _interval: NodeJS.Timeout | null = null

    constructor(manager: EntityManager, syncIntervalMs: number, syncedScraper: MilesScraperVehicles) {
        this.manager = manager;
        this.syncIntervalMs = syncIntervalMs;
        this.syncedScraper = syncedScraper;
    }

    handleRegistered(vehicleIds: number[], priority: number) {
        this.changes.filter(el => !vehicleIds.includes(el.milesId));
        this.changes.push(...vehicleIds.map(el => ({
            milesId: el,
            priority,
            action: MilesVehicleQueueAction.REGISTER,
            timestamp: new Date()
        })));
    }

    handleDeregistered(vehicleIds: number[]) {
        this.changes.filter(el => !vehicleIds.includes(el.milesId));
        this.changes.push(...vehicleIds.map(el => ({
            milesId: el,
            priority: 0,
            action: MilesVehicleQueueAction.DEREGISTER,
            timestamp: new Date()
        })));
    }

    // todo update update date if vehicle request was executed and is still in invisible state

    start() {
        if (this._interval !== null || this.syncIntervalMs === 0) return;
        this._interval = setInterval(async () => await this.sync(), this.syncIntervalMs);
    }

    async sync() {
        await this.syncUpstream()
        await this.syncDownstream()
    }

    async syncUpstream() {
        await this.manager.transaction(async manager => {
            while (this.changes.length > 0) {
                const thisChange = this.changes.pop();
                if (thisChange === undefined) continue;
                if (thisChange.action === MilesVehicleQueueAction.REGISTER) {

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