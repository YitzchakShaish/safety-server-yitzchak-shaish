import {
    IsString,
    IsNotEmpty,
    IsBoolean,
    IsOptional,
    IsEnum
} from "class-validator";

import { InjuryLevel, EventStatus } from "../enums/EventEnums";

export class SummaryInfoDto {

    @IsOptional()
    @IsEnum(InjuryLevel, { message: 'רמת הפגיעה אינה תקינה' })
    injuryLevel?: InjuryLevel;

    @IsOptional()
    @IsString({ message: 'פרטי הפגיעה חייבים להיות מחרוזת' })
    injuryDetails?: string;

    @IsString({ message: 'המלצות חייבות להיות מחרוזת' })
    @IsNotEmpty({ message: 'המלצות חובה' })
    recommendations: string;

    @IsBoolean({ message: 'ערך האישור חייב להיות אמת/שקר' })
    approval: boolean;

    @IsEnum(EventStatus, { message: 'סטטוס האירוע אינו תקין' })
    @IsNotEmpty({ message: 'סטטוס האירוע חובה' })
    eventStatus: EventStatus;
}
