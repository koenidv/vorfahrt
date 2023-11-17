import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
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

  @CreateDateColumn()
  added: Date;
}
