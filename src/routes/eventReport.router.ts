import { Router } from "express";
import { validateBody } from "../middlewares/validateBody.middleware";
import { EventReportDto } from "../dto/EventReport.dto";
import { EventReportController } from "../controllers/eventReport.controller";
import { reportAccess } from "../middlewares/reportAccess.middleware";
import { UserRole } from "../enums/UserRole";
import { checkAuth, checkRole } from "../middlewares/auth.middleware";
import { EventReportDtoWithId } from "../dto/EventReportWithId.dto";


const router = Router();

router.post("/event-report", checkAuth, validateBody(EventReportDto), EventReportController.createReport);
router.put("/event-report", checkAuth, validateBody(EventReportDtoWithId), checkRole([UserRole.Admin, UserRole.SafetyOfficer]), reportAccess(), EventReportController.updateReport);
router.delete("/event-report/:id", checkAuth, checkRole([UserRole.Admin]), EventReportController.deleteReport);

router.get("/event-report/:id", checkAuth, EventReportController.getReportById);

router.get(
  "/event-reports",
  checkAuth,
  EventReportController.getAllReports
);
export default router;
// checkRank(["סמל", "סמל ראשון", "רב סמל","רב אלוף"]),
