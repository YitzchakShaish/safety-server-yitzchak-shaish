import { AppDataSource } from "../config/datasource";
import { EventReportDto } from "../dto/EventReport.dto";
import { EventReport } from "../entities/EventReport";
import { ReporterProfile } from "../entities/ReporterProfile";
import { DeepPartial } from "typeorm";

export class EventReportService {
    static async create(eventReportDto: EventReportDto, reporterId: string) {
        const eventRepo = AppDataSource.getRepository(EventReport);
        const profileRepo = AppDataSource.getRepository(ReporterProfile);

        let reporterProfile;

        if (eventReportDto.reporterInfo) {
            reporterProfile = await profileRepo.findOne({
                where: {
                    user: { id: reporterId },
                    unit: eventReportDto.reporterInfo.unit,
                    subUnit: eventReportDto.reporterInfo.subUnit,
                    position: eventReportDto.reporterInfo.position
                }
            });

            if (!reporterProfile) {
                reporterProfile = profileRepo.create(eventReportDto.reporterInfo);
                reporterProfile.user = { id: reporterId } as any;
                await profileRepo.save(reporterProfile);
            }
        }

        const eventReport = eventRepo.create({
            reporter: { id: reporterId } ,
            reporterProfile,
            eventInfo: eventReportDto.eventInfo,
            summaryInfo: eventReportDto.summaryInfo,
            createdAt: eventReportDto.reporterInfo.reportDate
        } as DeepPartial<EventReport>);

        await eventRepo.save(eventReport);
        return eventReport;
    }
}
