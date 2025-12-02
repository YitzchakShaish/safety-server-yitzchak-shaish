import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { ReporterProfileDto } from "./ReporterProfile.dto";
import { EventInfoDto } from "./EventInfo.dto";
import { SummaryInfoDto } from "./SummaryInfo.dto";

export class EventReportDto {
    @ValidateNested()
    @Type(() => ReporterProfileDto)
    reporterInfo: ReporterProfileDto;

    @ValidateNested()
    @Type(() => EventInfoDto)
    eventInfo: EventInfoDto;

    @ValidateNested()
    @Type(() => SummaryInfoDto)
    summaryInfo: SummaryInfoDto;
}
