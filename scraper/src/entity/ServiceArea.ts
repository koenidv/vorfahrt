import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToOne, JoinColumn } from "typeorm"
import { City } from "./City"
import { Polygon } from "./Polygon"

@Entity()
export class ServiceArea {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => City, city => city.serviceAreas)
    city: City

    @OneToOne(() => Polygon)
    @JoinColumn()
    data: Polygon

    @CreateDateColumn()
    added: Date
    
}
