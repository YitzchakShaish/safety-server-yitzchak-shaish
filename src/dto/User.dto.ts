import { IsString, Length, IsEmail, IsNotEmpty } from "class-validator";

export class UserDto {
  @IsString()
  @IsNotEmpty({ message: "שם מלא חובה" })
  @Length(2, 20, { message: "השם חייב להיות בין 2 ל‑20 תווים" })
  fullName!: string;

  @IsEmail({}, { message: "אימייל לא תקין" })
  @IsNotEmpty({ message: "אימייל חובה" })
  email!: string;
}
