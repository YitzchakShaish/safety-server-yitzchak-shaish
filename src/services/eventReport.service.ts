import { AppDataSource } from "../config/datasource";
import { EventReportDto } from "../dto/EventReport.dto";
import { EventReport } from "../entities/EventReport";
import { ReporterProfile } from "../entities/ReporterProfile";
import { DeepPartial } from "typeorm";
import { updateRankIfNeeded } from "./rank.service";
import { formatEventReportForClient } from "../utils/formatEventReport";
import { EventReportDtoWithId } from "../dto/EventReportWithId.dto";
import { User } from "../entities/User";

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
            reporter: { id: reporterId },
            reporterProfile,
            eventInfo: eventReportDto.eventInfo,
            summaryInfo: eventReportDto.summaryInfo,
            createdAt: eventReportDto.reporterInfo.reportDate
        } as DeepPartial<EventReport>);

        await updateRankIfNeeded(reporterId);
        await eventRepo.save(eventReport);
        return eventReport;
    }
    static async update(eventReportDto: EventReportDtoWithId, reporterId: string) {
        const eventRepo = AppDataSource.getRepository(EventReport);
        const existingReport = await eventRepo.findOne({
            where: { id: eventReportDto.id },
            relations: ["reporterProfile"]
        });
        if (!existingReport) throw new Error("האירוע לא נמצא");


        existingReport.eventInfo = { ...existingReport.eventInfo, ...eventReportDto.eventInfo };
        existingReport.summaryInfo = { ...existingReport.summaryInfo, ...eventReportDto.summaryInfo };
        existingReport.reporterProfile = { ...existingReport.reporterProfile, ...eventReportDto.reporterInfo };
        await AppDataSource.getRepository(User)
            .increment({ id: reporterId }, "updatesCount", 1);

        await eventRepo.save(existingReport);
        return existingReport;
    }
    static async delete(eventReportId: string, reporterId: string) {
        const eventRepo = AppDataSource.getRepository(EventReport);
        const existingReport = await eventRepo.findOneBy({ id: eventReportId });
        if (existingReport) {
            await eventRepo.remove(existingReport);
            await AppDataSource.getRepository(User)
                .increment({ id: reporterId }, "deletesCount", 1);
        }
        if (!existingReport) throw new Error("האירוע לא נמצא");


        return existingReport;
    }

    static async getAll(options: {
        page: number;
        perPage: number;
        filters?: {
            q?: string;
            dateFrom?: string;
            dateTo?: string;
            status?: string;
        };
        user: { id: string; rank: string };
    }) {
        const { page, perPage, filters, user } = options;
        const repo = AppDataSource.getRepository(EventReport);

        const query = repo
            .createQueryBuilder("report")
            .leftJoinAndSelect("report.reporter", "reporter")
            .leftJoinAndSelect("report.reporterProfile", "profile")
            .leftJoinAndSelect("report.eventInfo", "eventInfo")
            .leftJoinAndSelect("report.summaryInfo", "summaryInfo")
            .leftJoinAndSelect("report.images", "images")
            .orderBy("report.createdAt", "DESC");

        if (filters?.dateFrom) {
            query.andWhere("report.createdAt >= :dateFrom", {
                dateFrom: filters.dateFrom,
            });
        }

        if (filters?.dateTo) {
            query.andWhere("report.createdAt <= :dateTo", {
                dateTo: filters.dateTo,
            });
        }

        if (filters?.q) {
            const q = `%${filters.q}%`;

            query.andWhere(`
   eventInfo.category LIKE :q
    OR summaryInfo.eventStatus LIKE :q
    OR profile.subUnit LIKE :q
    OR reporter.fullName LIKE :q
  `, { q });
        }

        if (user.rank === "טוראי") {
            query.andWhere("report.reporterId = :userId", { userId: user.id });
        }

        const total = await query.getCount();
        const data = await query
            .skip((page - 1) * perPage)
            .take(perPage)
            .getMany();

        const formattedData = data.map(formatEventReportForClient);
        return {
            data: formattedData,
            pagination: {
                page,
                perPage,
                total,
                totalPages: Math.ceil(total / perPage),
            },
        };
    }
}
