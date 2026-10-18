import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/datasource";
import { EventReport } from "../entities/EventReport";
import { UserRole } from "../enums/UserRole";
import { canManageReport } from "../utils/permissions";

export function reportAccess(upload = false) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const id = upload ? req.params.reportId : req.body.id;
        if (typeof id !== "string") return res.status(400).json({ message: "מזהה אירוע חסר" });
        const report = await AppDataSource.getRepository(EventReport).findOneBy({ id });
        if (!report) return res.status(404).json({ message: "האירוע לא נמצא" });
        const user = req.user!;
        const ownUpload = upload && report.reporter.id === user.id && report.summaryInfo.eventStatus === "לא טופל";
        if (!ownUpload && !canManageReport(user, report)) return res.status(403).json({ message: "אין הרשאה לשנות אירוע זה" });
        if (!upload && user.role !== UserRole.Admin) {
            for (const key of ["phone", "position", "unit", "subUnit"] as const) {
                if (req.body.reporterInfo?.[key] !== report.reporterProfile[key]) {
                    return res.status(403).json({ message: "רק מנהל יכול לשנות את פרטי המדווח" });
                }
            }
        }
        return next();
    };
}
