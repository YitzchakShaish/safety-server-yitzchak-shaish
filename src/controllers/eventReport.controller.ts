import { Request, Response } from "express";

import { EventReportDto } from "../dto/EventReport.dto";
import { EventReportService } from "../services/eventReport.service";

export class EventReportController {
    static async createReport(req: Request, res: Response) {
        try {
            const reporterId = req.user!.id; 
            const eventReportDto: EventReportDto = req.body;

            const report = await EventReportService.create(eventReportDto, reporterId);

            return res.status(201).json(report);

        } catch (err: any) {
            return res.status(500).json({ message: err.message || "שגיאה פנימית בשרת" });
        }
    }
}
