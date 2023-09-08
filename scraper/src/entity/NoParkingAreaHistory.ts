import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToOne, JoinColumn } from "typeorm"
import { City } from "./City"
import { Polygon } from "./Polygon"
import { NoParkingArea } from "./NoParkingArea"

@Entity()
export class NoParkingAreaHistory {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => City, city => city.noParkingAreas)
    current: NoParkingArea

    @OneToOne(() => Polygon)
    @JoinColumn()
    data: Polygon
    
    @CreateDateColumn()
    until: Date

}
