import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({
  name: "MilesPricing",
})
@Index(["discounted", "discountReason", "priceKm", "pricePause", "priceUnlock", "pricePreBooking"], { unique: true })
export class Pricing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  discounted: boolean;

  @Column({nullable: true})
  discountReason: string;

  @Column("decimal")
  priceKm: number;

  @Column("decimal")
  pricePause: number;

  @Column("decimal")
  priceUnlock: number;

  @Column("decimal")
  pricePreBooking: number;

  @CreateDateColumn()
  added: Date;
}
