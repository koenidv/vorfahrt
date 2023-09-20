import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({
  name: "MilesPolygon",
})
export class Polygon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("polygon")
  data: string;

  @CreateDateColumn()
  added: Date;
}
