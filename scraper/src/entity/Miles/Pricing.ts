import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { VehicleSize } from "./VehicleSize";

@Entity({
  name: "MilesPricing",
})
export class Pricing {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => VehicleSize, (size) => size.pricing)
  @JoinColumn({ name: "sizeId" })
  size: VehicleSize;
  @Column()
  sizeId: number;

  @Column()
  discounted: boolean;

  @Column({nullable: true})
  discountReason: string; // fixme different discount reasons will currently not get picked up when prices have been seen before

  @Column("decimal")
  priceKm: number;

  @Column("decimal")
  pricePause: number;

  @Column("decimal")
  priceUnlock: number;

  @Column("decimal", { nullable: true })
  pricePreBooking: number;

  @CreateDateColumn()
  added: Date;
}
