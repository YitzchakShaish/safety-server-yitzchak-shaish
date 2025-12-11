import { Entity, Column, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ReporterProfile } from "./ReporterProfile";
import { MilitaryRank } from "../enums/EventEnums";
import { EventReport } from "./EventReport";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column({ type: "text", default: MilitaryRank.Tzurai })
  rank: MilitaryRank;

  @OneToMany(() => EventReport, report => report.reporter)
  reports: EventReport[];

  @OneToMany(() => ReporterProfile, profile => profile.user)
  reporterProfiles: ReporterProfile[];
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  @Column({ type: "int", default: 0 })
  updatesCount: number;

  @Column({ type: "int", default: 0 })
  deletesCount: number;

  @Column({ type: "int", default: 0 })
  reportsCount: number;

}
