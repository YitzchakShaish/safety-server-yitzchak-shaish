import { Router } from "express";
import { getWeatherController } from "../controllers/weather.controller";

const router = Router();

// GET /weather?lat=&lon=&date=
router.get("/weather", getWeatherController);

export default router;
