import { IsEnum, IsString, MaxLength } from "class-validator";
import { MilitaryRank } from "../enums/EventEnums";
import { UserRole } from "../enums/UserRole";

export class ManageUserDto {
    @IsEnum(MilitaryRank)
    rank: MilitaryRank;
    @IsEnum(UserRole)
    role: UserRole;
    @IsString()
    @MaxLength(100)
    unit: string;
    @IsString()
    @MaxLength(100)
    position: string;
}
