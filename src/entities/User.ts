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
  email: string;

  @Column({ type: "text", default: MilitaryRank.Tzurai })
  rank: MilitaryRank;

  @OneToMany(() => EventReport, report => report.reporter)
  reports: EventReport[];

  @OneToMany(() => ReporterProfile, profile => profile.user)
  reporterProfiles: ReporterProfile[];
}
