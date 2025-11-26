import { Entity, Column } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { UnitActivityType, PersonalActivityType, Category, Location, EventSeverity, EventResult, WeatherCondition } from "../enums/EventEnums";

@Entity()
export class EventInfo extends BaseEntity {
  @Column({ type: "date" })
  eventDate: string;

  @Column()
  eventTime: string;

  @Column("text")
  eventDescription: string;

  @Column({ type: "enum", enum: UnitActivityType })
  unitActivityType: UnitActivityType;

  @Column({ type: "enum", enum: PersonalActivityType })
  personalActivityType: PersonalActivityType;

  @Column({ type: "enum", enum: Category })
  category: Category;

  @Column({ type: "enum", enum: Location })
  location: Location;

  @Column({ type: "enum", enum: EventSeverity })
  eventSeverity: EventSeverity;

  @Column({ type: "enum", enum: EventResult })
  eventResult: EventResult;

  @Column({ type: "enum", enum: WeatherCondition })
  weatherCondition: WeatherCondition;
}
