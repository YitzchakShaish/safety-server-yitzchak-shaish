import { Request, Response } from "express";
import { overviewService } from "../services/overview.service";

export const getOverviewStatsController = async (req: Request, res: Response) => {
  try {
    const stats = await overviewService(req.user!);
    
    res.status(200).json({
      success: true,
      status: 200,
      message: "נתוני המערכת נטענו בהצלחה",
      data: stats
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      status: 500,
      message: err.message || "שגיאה בטעינת נתוני המערכת",
      data: null
    });
  }
};
