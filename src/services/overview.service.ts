import { EventReport } from "../entities/EventReport";
import { AppDataSource } from "../config/datasource";


export const overviewService = async () => {
    const eventRepo = AppDataSource.getRepository(EventReport);

    const totalEvents = await eventRepo.count();


    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    console.log("Start of Day:", startOfDay);
    console.log("End of Day:", endOfDay);

    const completedToday = await eventRepo
        .createQueryBuilder("event")
        .leftJoin("event.summaryInfo", "summary")
        .where("summary.eventStatus = :status", { status: "טופל" })
        .andWhere("event.updatedAt BETWEEN :start AND :end", { start: startOfDay, end: endOfDay })
        .select("DISTINCT event.id")
        .getCount();


    const openEvents = await eventRepo
        .createQueryBuilder("event")
        .leftJoin("event.summaryInfo", "summary")
        .where("summary.eventStatus != :status", { status: "טופל" })
        .getCount();

    const highPriorityEvents = await eventRepo
        .createQueryBuilder("event")
        .leftJoin("event.eventInfo", "eventInfo")
        .where("eventInfo.EventSeverity = :severity", { severity: "חמור" })
        .getCount();

    return {
        totalEvents,
        completedToday,
        openEvents,
        highPriorityEvents
    };
};
