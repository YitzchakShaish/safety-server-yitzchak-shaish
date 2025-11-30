import { Entity, Column, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { EventReport } from "./EventReport";

@Entity()
export class ReporterProfile {
  @PrimaryGeneratedColumn()
  id: number;
  
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
