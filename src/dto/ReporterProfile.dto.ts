import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class ReporterProfileDto {
  @IsString({ message: 'יחידה חייבת להיות מחרוזת' })
  @IsNotEmpty({ message: 'יחידה חובה' })
  unit: string;

  @IsString({ message: 'תת-יחידה חייבת להיות מחרוזת' })
  @IsOptional()
  subUnit?: string;

  @IsString({ message: 'תפקיד חייב להיות מחרוזת' })
  @IsNotEmpty({ message: 'שדה תפקיד חובה' })
  position: string;
}
