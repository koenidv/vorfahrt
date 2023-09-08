import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm"
import { CityToCityPricing } from "./CityToCityPricing"

@Entity({
    name: "MilesVehicleSize"
})
export class VehicleSize {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @OneToMany(() => CityToCityPricing, pricing => pricing.vehicleSize)
    cityToCityPricing: CityToCityPricing[]

    @CreateDateColumn()
    added: Date

}
