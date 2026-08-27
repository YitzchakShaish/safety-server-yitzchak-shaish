import { Router } from "express";
import { uploadReportImages } from "../controllers/reportImages.controller";
import { upload } from "../config/multer";

const router = Router();

router.post(
  "/:reportId/images",
  upload.array("images", 10), 
  uploadReportImages
);

export default router;
