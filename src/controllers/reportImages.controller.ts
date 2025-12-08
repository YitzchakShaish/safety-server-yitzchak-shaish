import { Request, Response } from "express";
import { ReportImagesService } from "../services/reportImages.service";


export const uploadReportImages = async (req: Request, res: Response) => {
  try {
    const reportId = req.params.reportId;
    const files = req.files as Express.Multer.File[];

    const savedImages = await ReportImagesService.saveReportImages(reportId, files);

    return res.status(200).json({
      success: true,
      message: "התמונות נשמרו בהצלחה",
      images: savedImages
    });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "אירעה שגיאה בשמירת התמונות",
      error: err.message
    });
  }
};
