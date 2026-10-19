import { AppDataSource } from "../config/datasource";
import { EventReport } from "../entities/EventReport";
import { reportScope, SessionUser } from "../utils/permissions";

export function validDate(value: string) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

export async function safetyOverview(user: SessionUser, from: string, to: string, unit = "") {
    if (!validDate(from) || !validDate(to) || from > to) throw new Error("טווח התאריכים אינו תקין");
    const accessible = await AppDataSource.getRepository(EventReport).find({ where: reportScope(user) });
    const units = [...new Set(accessible.map(r => r.reporterProfile.unit))].sort();
    const reports = accessible.filter(r => r.eventInfo.eventDate >= from && r.eventInfo.eventDate <= to && (!unit || r.reporterProfile.unit === unit));
    const categories: Record<string, number> = {};
    const weeks: Record<string, { total: number; severe: number }> = {};
    const start = new Date(`${from}T00:00:00Z`);
    const end = new Date(`${to}T00:00:00Z`);
    if ((end.getTime() - start.getTime()) / 86400000 > 366) throw new Error("ניתן לבחור טווח של עד שנה");
    for (let day = new Date(start); day <= end; day.setUTCDate(day.getUTCDate() + 7)) weeks[day.toISOString().slice(0, 10)] = { total: 0, severe: 0 };
    for (const report of reports) {
        const info = report.eventInfo;
        categories[info.category] = (categories[info.category] || 0) + 1;
        const offset = Math.floor((Date.parse(info.eventDate) - start.getTime()) / (7 * 86400000));
        const key = new Date(start.getTime() + offset * 7 * 86400000).toISOString().slice(0, 10);
        weeks[key].total++;
        if (info.eventSeverity === "חמור") weeks[key].severe++;
    }
    return { from, to, unit, units,
        total: reports.length,
        severe: reports.filter(r => r.eventInfo.eventSeverity === "חמור").length,
        open: reports.filter(r => r.summaryInfo.eventStatus !== "טופל").length,
        treated: reports.filter(r => r.summaryInfo.eventStatus === "טופל").length,
        categories: Object.entries(categories).map(([label, value]) => ({ label, value })),
        weeks: Object.entries(weeks).map(([date, values]) => ({ date, ...values })),
        events: reports.filter(r => r.summaryInfo.eventStatus !== "טופל" || r.eventInfo.eventSeverity === "חמור")
            .sort((a, b) => b.eventInfo.eventDate.localeCompare(a.eventInfo.eventDate))
            .map(r => ({ id: r.id, date: r.eventInfo.eventDate, unit: r.reporterProfile.unit,
                category: r.eventInfo.category, severity: r.eventInfo.eventSeverity, status: r.summaryInfo.eventStatus,
                description: r.eventInfo.eventDescription }))
    };
}
