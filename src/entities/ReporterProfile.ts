import { Entity, Column, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";
import { EventReport } from "./EventReport";

@Entity()
export class ReporterProfile extends BaseEntity {
  @ManyToOne(() => User, user => user.reporterProfiles)
  user: User;

  @Column()
  unit: string;

  @Column()
  subUnit: string;

  @Column({ nullable: true })
  position: string;

  @OneToMany(() => EventReport, report => report.reporterProfile)
  reports: EventReport[];
}
