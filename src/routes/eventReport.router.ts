import { Router } from "express";
import { validateBody } from "../middlewares/validateBody.middleware";
import { EventReportDto } from "../dto/EventReport.dto";
import { EventReportController } from "../controllers/eventReport.controller";
import { checkAuth } from "../middlewares/auth.middleware";


const router = Router();

router.post("/event-report", checkAuth, validateBody(EventReportDto), EventReportController.createReport);


export default router;
