import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Tariff } from "./Tariff";

@Entity({
  name: "MilesTariffHistory",
})
export class TariffHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Tariff)
  current: Tariff;

  @Column("decimal")
  price: number;

  @Column("decimal")
  additionalPriceKm: number;

  @CreateDateColumn()
  until: Date;
}
