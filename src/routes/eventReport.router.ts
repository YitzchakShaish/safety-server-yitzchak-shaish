import { Router } from "express";
import { validateBody } from "../middlewares/validateBody.middleware";
import { EventReportDto } from "../dto/EventReport.dto";
import { EventReportController } from "../controllers/eventReport.controller";
import { checkAuth, checkRank } from "../middlewares/auth.middleware";


const router = Router();

router.post("/event-report", checkAuth, validateBody(EventReportDto), EventReportController.createReport);

// router.get(
//   "/event-report/:id",
//   checkAuth,
//   EventReportController.getReportById
// );

router.get(
  "/event-reports",
  checkAuth,
  EventReportController.getAllReports
);
export default router;
// checkRank(["סמל", "סמל ראשון", "רב סמל","רב אלוף"]),
