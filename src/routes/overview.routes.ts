
import { Router } from "express";
import { getOverviewStatsController } from "../controllers/overview.controller";



const router = Router();

// GET /api/overview
router.get("/overview", getOverviewStatsController);

export default router;
