import { AppDataSource } from "../config/datasource";
import { EventImage } from "../entities/EventImage";
import { EventReport } from "../entities/EventReport";


export class ReportImagesService {
  static async saveReportImages(reportId: string, files: Express.Multer.File[]) {
    const reportRepo = AppDataSource.getRepository(EventReport);
    const imgRepo = AppDataSource.getRepository(EventImage);

    const report = await reportRepo.findOne({ where: { id: reportId } });
    if (!report) throw new Error("הדיווח לא נמצא");

    const results: EventImage[] = [];

    for (const file of files) {
      const newImage = imgRepo.create({
        report,
        fileName: file.filename,
        filePath: `http://localhost:3000/uploads/${file.filename}`,
      });

      results.push(await imgRepo.save(newImage));
    }

    return results;
  }
}

