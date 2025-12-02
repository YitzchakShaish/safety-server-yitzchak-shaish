import { IsString, IsNotEmpty, IsOptional, IsDateString } from "class-validator";

export class ReporterProfileDto {
  @IsString({ message: 'שם מלא חייב להיות מחרוזת' })
  @IsNotEmpty({ message: 'שם מלא חובה' })
  fullName: string;

  @IsString({ message: 'טלפון חייב להיות מחרוזת' })
  @IsNotEmpty({ message: 'טלפון חובה' })
  phone: string;

  @IsString({ message: 'יחידה חייבת להיות מחרוזת' })
  @IsNotEmpty({ message: 'יחידה חובה' })
  unit: string;

  @IsOptional()
  @IsString({ message: 'תת-יחידה חייבת להיות מחרוזת' })
  subUnit?: string;

  @IsString({ message: 'תפקיד חייב להיות מחרוזת' })
  @IsNotEmpty({ message: 'תפקיד חובה' })
  position: string;

  @IsOptional()
  @IsDateString({}, { message: 'תאריך דיווח חייב להיות תאריך תקין' })
  reportDate?: Date;

  @IsOptional()
  @IsString({ message: 'שעת דיווח חייבת להיות מחרוזת' })
  reportTime?: string;
}
