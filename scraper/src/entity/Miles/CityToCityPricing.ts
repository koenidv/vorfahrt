import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { City } from "./City";
import { ServiceArea } from "./ServiceArea";
import { VehicleSize } from "./VehicleSize";

@Entity({
  name: "MilesCityToCityPricing",
})
export class CityToCityPricing {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => VehicleSize, (size) => size.cityToCityPricing)
  @JoinColumn({ name: "sizeId" })
  size: VehicleSize;
  @Column()
  sizeId: number;

  @ManyToOne(() => City)
  @JoinColumn({ name: "originId" })
  orgin: ServiceArea;
  @Column()
  originId: number;

  @ManyToOne(() => City)
  @JoinColumn({ name: "destinationId" })
  destination: ServiceArea;
  @Column()
  destinationId: number;

  @Column("decimal")
  price: number;

  @CreateDateColumn()
  added: Date;
}
