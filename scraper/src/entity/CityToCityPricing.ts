import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToOne, JoinColumn, Table } from "typeorm"
import { City } from "./City"
import { Polygon } from "./Polygon"
import { ServiceArea } from "./ServiceArea"
import { VehicleSize } from "./VehicleSize"

@Entity({
    name: "MilesCityToCityPricing"
})
export class CityToCityPricing {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => VehicleSize, size => size.cityToCityPricing)
    size: VehicleSize

    @ManyToOne(() => City)
    orgin: ServiceArea

    @ManyToOne(() => City)
    destination: ServiceArea

    @Column("decimal")
    price: number
    
    @CreateDateColumn()
    added: Date

}
