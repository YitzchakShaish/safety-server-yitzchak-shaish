import { Request, Response } from "express";

import { EventReportDto } from "../dto/EventReport.dto";
import { EventReportService } from "../services/eventReport.service";

export class EventReportController {
    static async createReport(req: Request, res: Response) {
        try {
            const reporterId = req.user!.id;
            console.log(reporterId)
            const eventReportDto: EventReportDto = req.body;
            console.log(eventReportDto)

            const report = await EventReportService.create(eventReportDto, reporterId);

            return res.status(201).json({
                message: "דיווח האירוע נשמר בהצלחה",
                data: report
            });

        } catch (err: any) {
            return res.status(500).json({ message: err.message || "שגיאה פנימית בשרת" });
        }
    }
}
