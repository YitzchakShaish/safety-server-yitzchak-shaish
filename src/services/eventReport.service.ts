import fs from "fs";
import path from "path";
import { AppDataSource } from "../config/datasource";
import { EventReportDto } from "../dto/EventReport.dto";
import { EventReport } from "../entities/EventReport";
import { ReporterProfile } from "../entities/ReporterProfile";
import { DeepPartial } from "typeorm";
import { UserRole } from "../enums/UserRole";
import { SessionUser, reportScope } from "../utils/permissions";
import { formatEventReportForClient } from "../utils/formatEventReport";
import { EventReportDtoWithId } from "../dto/EventReportWithId.dto";
import { User } from "../entities/User";

export class EventReportService {
    private static eventRepo = AppDataSource.getRepository(EventReport);
    private static profileRepo = AppDataSource.getRepository(ReporterProfile);
    private static userRepo = AppDataSource.getRepository(User);

    static async getById(id: string, userId: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) return null;
        // Resolve access from the current database role.
        const report = await this.eventRepo.findOne({
            where: { id, ...reportScope(user) }
        });
        return report ? formatEventReportForClient(report) : null;
    }

    static async create(eventReportDto: EventReportDto, reporterId: string) {
        const eventRepo = this.eventRepo;
        const profileRepo = this.profileRepo;
        const userRepo = this.userRepo;

        let reporterProfile;

        if (eventReportDto.reporterInfo) {
            const reporterInfo = eventReportDto.reporterInfo;
            // Omitted subUnit must stay in the lookup. TypeORM drops undefined
            // conditions, which would attach another report's profile.
            const subUnit = reporterInfo.subUnit ?? "";
            reporterProfile = await profileRepo.findOne({
                where: {
                    user: { id: reporterId },
                    unit: reporterInfo.unit,
                    subUnit,
                    position: reporterInfo.position
                }
            });

            if (!reporterProfile) {
                reporterProfile = profileRepo.create({ ...reporterInfo, subUnit });
                reporterProfile.user = { id: reporterId } as any;
                await profileRepo.save(reporterProfile);
            }
        }

        const eventReport = eventRepo.create({
            reporter: { id: reporterId },
            reporterProfile,
            eventInfo: eventReportDto.eventInfo,
            summaryInfo: { ...eventReportDto.summaryInfo, eventStatus: "לא טופל" },
            createdAt: eventReportDto.reporterInfo.reportDate
        } as DeepPartial<EventReport>);

        await userRepo.increment({ id: reporterId }, "reportsCount", 1);
        await eventRepo.save(eventReport);

        return eventReport;
    }

    static async update(eventReportDto: EventReportDtoWithId, reporterId: string) {
        const eventRepo = this.eventRepo;
        const userRepo = this.userRepo;

        const existingReport = await eventRepo.findOne({
            where: { id: eventReportDto.id },
            relations: ["reporterProfile"]
        });

        if (!existingReport) throw new Error("האירוע לא נמצא");

        existingReport.eventInfo = { ...existingReport.eventInfo, ...eventReportDto.eventInfo };
        existingReport.summaryInfo = { ...existingReport.summaryInfo, ...eventReportDto.summaryInfo };
        const actor = await userRepo.findOneByOrFail({ id: reporterId });
        if (actor.role === UserRole.Admin) {
            const { phone, position, unit, subUnit } = eventReportDto.reporterInfo;
            // A report profile can be shared: create a snapshot instead of changing other reports.
            existingReport.reporterProfile = this.profileRepo.create({ phone, position, unit, subUnit, user: existingReport.reporter });
        }

        await userRepo.increment({ id: reporterId }, "updatesCount", 1);
        await eventRepo.save(existingReport);
        return existingReport;
    }

    static async delete(eventReportId: string, reporterId: string) {
        const eventRepo = this.eventRepo;
        const userRepo = this.userRepo;

        const existingReport = await eventRepo.findOne({
            where: { id: eventReportId },
            relations: ["images"]
        });

        if (!existingReport) throw new Error("האירוע לא נמצא");

        if (existingReport.images && existingReport.images.length > 0) {
            for (const img of existingReport.images) {
                if (img.filePath) {
                    try {
                        const fullPath = path.join(__dirname, "..", "..", "public", img.filePath);
                        fs.unlinkSync(fullPath);
                    } catch (err) {
                        console.error("שגיאה במחיקת קובץ:", err);
                    }
                }
            }
        }

        await eventRepo.remove(existingReport);
        await userRepo.increment({ id: reporterId }, "deletesCount", 1);
        
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
        user: SessionUser;
    }) {
        const { page, perPage, filters, user } = options;
        const repo = this.eventRepo;

        const query = repo
            .createQueryBuilder("report")
            .leftJoinAndSelect("report.reporter", "reporter")
            .leftJoinAndSelect("report.reporterProfile", "profile")
            .leftJoinAndSelect("report.eventInfo", "eventInfo")
            .leftJoinAndSelect("report.summaryInfo", "summaryInfo")
            .leftJoinAndSelect("report.images", "images")
            .orderBy("report.createdAt", "DESC");

        if (filters?.dateFrom) {
            query.andWhere("date(eventInfo.eventDate) >= date(:dateFrom)", {
                dateFrom: filters.dateFrom,
            });
        }

        if (filters?.dateTo) {
            // dateTo is a calendar day; the next-day bound includes that whole day.
            query.andWhere("date(eventInfo.eventDate) < date(:dateTo, '+1 day')", {
                dateTo: filters.dateTo,
            });
        }

        if (filters?.q) {
            const q = `%${filters.q}%`;

            query.andWhere(`
                (eventInfo.category LIKE :q
                OR summaryInfo.eventStatus LIKE :q
                OR profile.subUnit LIKE :q
                OR reporter.fullName LIKE :q)
            `, { q });
        }

        if (user.role === UserRole.User || (user.role === UserRole.SafetyOfficer && !user.unit)) {
            query.andWhere("report.reporterId = :userId", { userId: user.id });
        }

        if (user.role === UserRole.SafetyOfficer && user.unit) {
            query.andWhere("profile.unit = :unit", { unit: user.unit });
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
