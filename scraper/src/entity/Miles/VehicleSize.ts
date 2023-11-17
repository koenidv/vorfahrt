import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { VehicleModel } from "./VehicleModel";

@Entity({
  name: "MilesVehicleSize",
})
export class VehicleSize {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index({ unique: true })
  name: string;

  @OneToMany(() => VehicleModel, (model) => model.size)
  models: VehicleModel[];

  @CreateDateColumn({
    precision: 0,
  })
  added: Date;
}
