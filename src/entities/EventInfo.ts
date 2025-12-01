import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import {
  UnitActivityType,
  PersonalActivityType,
  Category,
  Location,
  EventSeverity,
  EventResult,
  WeatherCondition
} from "../enums/EventEnums";

@Entity()
export class EventInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "date" })
  eventDate: string;

  @Column()
  eventTime: string;

  @Column("text")
  eventDescription: string;

  @Column({ type: "text" })
  unitActivityType: UnitActivityType;

  @Column({ type: "text" })
  personalActivityType: PersonalActivityType;

  @Column({ type: "text" })
  category: Category;

  @Column({ type: "text" })
  location: Location;

  @Column({ type: "text" })
  eventSeverity: EventSeverity;

  @Column({ type: "text" })
  eventResult: EventResult;

  @Column({ type: "text" })
  weatherCondition: WeatherCondition;
}
