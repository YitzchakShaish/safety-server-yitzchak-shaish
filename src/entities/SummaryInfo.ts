import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { InjuryLevel, EventStatus } from "../enums/EventEnums";

@Entity()
export class SummaryInfo {
  @PrimaryGeneratedColumn()
  id: number;
  
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
