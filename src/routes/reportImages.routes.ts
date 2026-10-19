import { Router } from "express";
import { uploadReportImages } from "../controllers/reportImages.controller";
import { upload } from "../config/multer";
import { checkAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/:reportId/images",
  checkAuth,
  upload.array("images", 10),
  uploadReportImages
);

export default router;
