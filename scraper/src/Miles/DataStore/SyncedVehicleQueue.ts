import { EntityManager } from "typeorm";
import { InternalQueuedVehicle } from "../../entity/Miles/InternalQueuedVehicle";
import { VehicleQueue } from "../utils/VehicleQueue";
import clc from "cli-color";
import _ from "lodash";

export class SyncedVehicleQueue extends VehicleQueue {
    manager: EntityManager;
    syncIntervalMs: number;
    private syncInterval: NodeJS.Timeout | null = null

    constructor(manager: EntityManager, syncIntervalMs: number) {
        super();
        this.manager = manager;
        this.syncIntervalMs = syncIntervalMs;
    }

    override remove(vehicleIds: number[]) {
        return this.insert(vehicleIds, null);
    }

    // todo update updated date if vehicle request was executed and is still in invisible state

    start(): this {
        if (this.syncInterval !== null || this.syncIntervalMs === 0) return this;
        this.syncInterval = setInterval(async () => await this.sync(), this.syncIntervalMs);
        return this;
    }

    async sync() {
        const remoteData = await this.getRemoteData();
        const pushToRemote = this.updateLocalDiffRemote(remoteData);
        await this.syncUpstream(pushToRemote);
    }

    async syncUpstream(ids: number[]) {
        if (ids.length === 0) return;
        let changes = 0;
        await this.manager.transaction(async manager => {
            for (const id of ids) {
                const data = this.queue.get(id);
                if (data === undefined || data.fromInit) continue;
                await manager.createQueryBuilder()
                    .insert()
                    .into(InternalQueuedVehicle)
                    .values({
                        milesId: id,
                        priority: data.priority,
                        updated: data.updated
                    })
                    .onConflict('("milesId") DO UPDATE SET priority = :priority, updated = :updated WHERE "InternalMilesVehiclesQueue".updated < :updated')
                    .setParameter("priority", data.priority)
                    .setParameter("updated", data.updated)
                    .execute()
                changes++;
            }
        });
        if (changes !== 0) console.log(clc.bgBlackBright("SyncedVehicleQueue"), "🡑 Pushed", changes, "changes")
    }

    async getRemoteData() {
        return await this.manager.find(InternalQueuedVehicle)
    }

    updateLocalDiffRemote(remoteData: InternalQueuedVehicle[]): number[] {
        const pushToRemote = [...this.queue.keys()];
        let changes = 0;

        for (const remote of remoteData) {
            const local = this.queue.get(remote.milesId);
            if (local === undefined || local.updated < remote.updated) {
                this.insert([remote.milesId], remote.priority, false);
                changes++;
                const index = pushToRemote.indexOf(remote.milesId);
                if (index !== -1) pushToRemote.splice(index, 1);
            } else if (local.priority === remote.priority || local.fromInit) {
                const index = pushToRemote.indexOf(remote.milesId);
                if (index !== -1) pushToRemote.splice(index, 1);
            }
        }

        if (changes !== 0) console.log(clc.bgBlackBright("SyncedVehicleQueue"), "🡓 Pulled", changes, "changes")
        return pushToRemote;
    }

    async restoreFromSync() {
        const remoteData = await this.getRemoteData();
        this.restoreRemoteData(remoteData);
    }

    restoreRemoteData(remoteData: InternalQueuedVehicle[]) {
        console.log(clc.bgBlackBright("SyncedVehicleQueue"), "🡓 Restored", remoteData.length, "queue items,", remoteData.filter(it => it.priority !== null).length, "active")
        for (const remote of remoteData) {
            this.insert([remote.milesId], remote.priority === null ? null : +remote.priority, true);
        }
    }

}