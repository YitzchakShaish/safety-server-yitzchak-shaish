import { Entity, Column } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { InjuryLevel, EventStatus } from "../enums/EventEnums";

@Entity()
export class SummaryInfo extends BaseEntity {
  @Column({ type: "enum", enum: InjuryLevel })
  injuryLevel: InjuryLevel;

  @Column("text")
  injuryDetails: string;

  @Column("text")
  recommendations: string;

  @Column()
  approval: boolean;

  @Column({ type: "enum", enum: EventStatus })
  eventStatus: EventStatus;
}
