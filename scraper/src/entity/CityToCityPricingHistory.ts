import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToOne, JoinColumn, Table } from "typeorm"
import { City } from "./City"
import { Polygon } from "./Polygon"
import { ServiceArea } from "./ServiceArea"
import { VehicleSize } from "./VehicleSize"
import { CityToCityPricing } from "./CityToCityPricing"

@Entity({
    name: "MilesCityToCityPricingHistory"
})
export class CityToCityPricingHistory {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => CityToCityPricing)
    cityToCity: CityToCityPricing

    @Column("decimal")
    price: number
    
    @CreateDateColumn()
    until: Date

}
