import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm"
import { ServiceArea } from "./ServiceArea"
import { NoParkingArea } from "./NoParkingArea"

@Entity({
    name: "MilesCity"
})
export class City {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    milesId: number

    @Column()
    name: string

    @Column("point")
    location: string

    @ManyToOne(() => ServiceArea, serviceArea => serviceArea.city)
    serviceAreas: ServiceArea
    
    @ManyToOne(() => NoParkingArea, noParkingArea => noParkingArea.city)
    noParkingAreas: NoParkingArea

    @CreateDateColumn()
    added: Date

}
