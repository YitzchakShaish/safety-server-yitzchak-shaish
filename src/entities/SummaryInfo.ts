import { Entity, Column } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { InjuryLevel, EventStatus } from "../enums/EventEnums";

@Entity()
export class SummaryInfo extends BaseEntity {
  @Column({ type: "text" })
  injuryLevel: InjuryLevel;

  @Column("text")
  injuryDetails: string;

  @Column("text")
  recommendations: string;

  @Column()
  approval: boolean;

  @Column({ type: "text" })
  eventStatus: EventStatus;
}
