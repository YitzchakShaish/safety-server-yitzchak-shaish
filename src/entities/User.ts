import { Entity, Column, OneToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { ReporterProfile } from "./ReporterProfile";
import { MilitaryRank } from "../enums/EventEnums";
import { EventReport } from "./EventReport";

@Entity()
export class User extends BaseEntity {
  @Column()
  fullName: string;

  @Column()
  phone: string;

  @Column({ type: "enum", enum: MilitaryRank, default: MilitaryRank.Tzurai })
  rank: MilitaryRank;

  @OneToMany(() => EventReport, report => report.reporter)
  reports: EventReport[];

  @OneToMany(() => ReporterProfile, profile => profile.user)
  reporterProfiles: ReporterProfile[];
}
