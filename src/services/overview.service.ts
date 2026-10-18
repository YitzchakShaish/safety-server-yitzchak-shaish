import { EventReport } from "../entities/EventReport";
import { AppDataSource } from "../config/datasource";
import { reportScope, SessionUser } from "../utils/permissions";

export const overviewService = async (user: SessionUser) => {
    const reports = await AppDataSource.getRepository(EventReport).find({ where: reportScope(user) });
    const today = new Date().toDateString();
    return {
        totalEvents: reports.length,
        completedToday: reports.filter(r => r.summaryInfo.eventStatus === "טופל" && new Date(r.updatedAt).toDateString() === today).length,
        openEvents: reports.filter(r => r.summaryInfo.eventStatus !== "טופל").length,
        highPriorityEvents: reports.filter(r => r.eventInfo.eventSeverity === "חמור" && r.summaryInfo.eventStatus !== "טופל").length
    };
};
