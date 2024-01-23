// @ts-nocheck

import { Column, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({
    name: "InternalMilesVehiclesQueue",
})
export class InternalQueuedVehicle {

    @PrimaryColumn()
    milesId: number;

    @Column({ type: "decimal" })
    priority: number;

    @Column()
    updated: Date;

}