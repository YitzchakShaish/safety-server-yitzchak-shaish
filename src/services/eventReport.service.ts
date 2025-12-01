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

        if (eventReportDto.reporterProfile) {
            reporterProfile = await profileRepo.findOne({
                where: {
                    user: { id: reporterId },
                    unit: eventReportDto.reporterProfile.unit,
                    subUnit: eventReportDto.reporterProfile.subUnit,
                    position: eventReportDto.reporterProfile.position
                }
            });

            if (!reporterProfile) {
                reporterProfile = profileRepo.create(eventReportDto.reporterProfile);
                reporterProfile.user = { id: reporterId } as any;
                await profileRepo.save(reporterProfile);
            }
        }

        const eventReport = eventRepo.create({
            reporter: { id: reporterId } ,
            reporterProfile,
            eventInfo: eventReportDto.eventInfo,
            summaryInfo: eventReportDto.summaryInfo,
        } as DeepPartial<EventReport>);

        await eventRepo.save(eventReport);
        return eventReport;
    }
}
