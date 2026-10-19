import { reportAccess } from "../middlewares/reportAccess.middleware";
import { Router } from "express";
import { uploadReportImages } from "../controllers/reportImages.controller";
import { uploadEventImages } from "../config/multer";
import { checkAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/:reportId/images",
  checkAuth,
  reportAccess(true),
  uploadEventImages,
  uploadReportImages
);

export default router;
