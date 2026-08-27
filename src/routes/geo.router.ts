import { Router } from "express";
import { searchAddressController, reverseGeocodeController } from "../controllers/geo.controller";

const router = Router();

// GET /geo/search?q=
router.get("/geo/search", searchAddressController);

// GET /geo/reverse?lat=&lon=
router.get("/geo/reverse", reverseGeocodeController);

export default router;
