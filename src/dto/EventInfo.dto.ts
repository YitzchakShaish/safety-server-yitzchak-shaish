import {
  IsString,
  IsNotEmpty,
  IsEnum
} from "class-validator";

import {
  UnitActivityType,
  PersonalActivityType,
  Category,
  Location,
  EventSeverity,
  EventResult,
  WeatherCondition
} from "../enums/EventEnums";
import { IsPastOrPresentDate } from "../validators/isPastOrPresentDate.validator";

export class EventInfoDto {
  @IsString({ message: 'תאריך האירוע חייב להיות מחרוזת' })
  @IsNotEmpty({ message: 'תאריך האירוע חובה' })
  @IsPastOrPresentDate({ message: 'תאריך האירוע לא יכול להיות בעתיד' })
  eventDate: string;

  @IsString({ message: 'שעת האירוע חייבת להיות מחרוזת' })
  @IsNotEmpty({ message: 'שעת האירוע חובה' })
  eventTime: string;

  @IsString({ message: 'תיאור האירוע חייב להיות מחרוזת' })
  @IsNotEmpty({ message: 'תיאור האירוע חובה' })
  eventDescription: string;

  @IsEnum(UnitActivityType, { message: 'ערך לא תקין עבור סוג פעילות יחידה' })
  @IsNotEmpty({ message: 'סוג פעילות יחידה הוא שדה חובה' })
  unitActivityType: UnitActivityType;

  @IsEnum(PersonalActivityType, { message: 'ערך לא תקין עבור סוג פעילות אישית' })
  @IsNotEmpty({ message: 'סוג פעילות אישית הוא שדה חובה' })
  personalActivityType: PersonalActivityType;

  @IsEnum(Category, { message: 'ערך לא תקין עבור קטגוריה' })
  @IsNotEmpty({ message: 'קטגוריה היא שדה חובה' })
  category: Category;

  @IsEnum(Location, { message: 'ערך לא תקין עבור מיקום' })
  @IsNotEmpty({ message: 'מיקום הוא שדה חובה' })
  location: Location;

  @IsEnum(EventSeverity, { message: 'ערך לא תקין עבור חומרת האירוע' })
  @IsNotEmpty({ message: 'חומרת האירוע היא שדה חובה' })
  eventSeverity: EventSeverity;

  @IsEnum(EventResult, { message: 'ערך לא תקין עבור תוצאת האירוע' })
  @IsNotEmpty({ message: 'תוצאת האירוע היא שדה חובה' })
  eventResult: EventResult;

  @IsEnum(WeatherCondition, { message: 'ערך לא תקין עבור מצב מזג האוויר' })
  @IsNotEmpty({ message: 'מצב מזג האוויר הוא שדה חובה' })
  weatherCondition: WeatherCondition;
}
