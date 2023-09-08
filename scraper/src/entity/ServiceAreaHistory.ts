import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToOne, JoinColumn } from "typeorm"
import { City } from "./City"
import { Polygon } from "./Polygon"
import { ServiceArea } from "./ServiceArea"

@Entity()
export class ServiceAreaHistory {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => City, city => city.noParkingAreas)
    current: ServiceArea

    @OneToOne(() => Polygon)
    @JoinColumn()
    data: Polygon
    
    @CreateDateColumn()
    until: Date

}
