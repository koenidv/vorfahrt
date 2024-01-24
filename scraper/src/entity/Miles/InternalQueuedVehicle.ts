// @ts-nocheck

import { Column, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({
    name: "InternalMilesVehiclesQueue",
})
export class InternalQueuedVehicle {

    @PrimaryColumn()
    milesId: number;

    @Column({ type: "decimal", nullable: true })
    priority: number | null;

    @Column()
    updated: Date;

}