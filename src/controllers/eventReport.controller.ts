import { Request, Response } from "express";

import { EventReportDto } from "../dto/EventReport.dto";
import { EventReportService } from "../services/eventReport.service";
import { AppDataSource } from "../config/datasource";
import { User } from "../entities/User";

export class EventReportController {

  static async createReport(req: Request, res: Response) {
    try {
      const reporterId = req.user!.id;
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id: reporterId } });
      console.log(reporterId)
      const eventReportDto: EventReportDto = req.body;
      console.log(eventReportDto)

      const report = await EventReportService.create(eventReportDto, reporterId);

      return res.status(201).json({
        message: "דיווח האירוע נשמר בהצלחה",
        data: report,
        user
      });

    } catch (err: any) {
      return res.status(500).json({ message: err.message || "שגיאה פנימית בשרת" });
    }
  }


  static async getAllReports(req: Request, res: Response) {
    try {
      const {
        page = "1",
        perPage = "10",
        q,
        dateFrom,
        dateTo
      } = req.query;


      const pageNum = parseInt(page as string, 10);
      const perPageNum = parseInt(perPage as string, 10);


      const filters = {
        q: q ? String(q) : undefined,
        dateFrom: dateFrom ? String(dateFrom) : undefined,
        dateTo: dateTo ? String(dateTo) : undefined,
      };

  
      const reports = await EventReportService.getAll({ page: pageNum, perPage: perPageNum, filters, user: req.user! });

      return res.status(200).json({
        message: "רשימת הדיווחים התקבלה בהצלחה",
        data: reports.data,
        pagination: reports.pagination,
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || "שגיאה פנימית בשרת" });
    }
  }
}


