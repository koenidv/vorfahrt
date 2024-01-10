// @ts-nocheck

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({
  name: "MilesCity",
})
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true})
  @Column()
  milesId: string;

  @Column()
  name: string;

  @Column("point")
  location: string;

  @CreateDateColumn({
    precision: 0,
  })
  added: Date;
}
