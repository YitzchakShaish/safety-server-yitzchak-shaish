
import { Router } from "express";
import { getOverviewStatsController } from "../controllers/overview.controller";
import { checkAuth } from "../middlewares/auth.middleware";



const router = Router();

// GET /overview
router.get("/overview", checkAuth, getOverviewStatsController);

export default router;
