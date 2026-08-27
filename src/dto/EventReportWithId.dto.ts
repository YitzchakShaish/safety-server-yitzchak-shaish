import { IsUUID } from "class-validator";
import { EventReportDto } from "./EventReport.dto";

export class EventReportDtoWithId extends EventReportDto {
    @IsUUID("4", { message: "ה-id חייב להיות UUID תקין" })
    id: string
}
