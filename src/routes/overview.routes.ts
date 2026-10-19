
import { Router } from "express";
import { getOverviewStatsController } from "../controllers/overview.controller";
import { safetyOverview } from "../services/safetyOverview.service";
import { UserRole } from "../enums/UserRole";
import { checkAuth, checkRole } from "../middlewares/auth.middleware";



const router = Router();

// GET /overview
router.get("/overview", checkAuth, getOverviewStatsController);

router.get("/safety-overview", checkAuth, checkRole([UserRole.Admin, UserRole.SafetyOfficer]), async (req, res) => {
    try {
        const result = await safetyOverview(req.user!, String(req.query.from || ""), String(req.query.to || ""), String(req.query.unit || ""));
        return res.json({ data: result });
    } catch (err) {
        return res.status(400).json({ message: err instanceof Error ? err.message : "שגיאה בטעינת הסקירה" });
    }
});
export default router;
