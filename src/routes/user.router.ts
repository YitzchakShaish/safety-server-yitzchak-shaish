import { Router } from "express";
import { getAllUsers, getUserById, getCurrentUser, updateUser } from "../controllers/user.controller";
import { checkAuth, checkRole } from "../middlewares/auth.middleware";
import { UserRole } from "../enums/UserRole";
import { validateBody } from "../middlewares/validateBody.middleware";
import { ManageUserDto } from "../dto/ManageUser.dto";

const router = Router();
router.use(checkAuth);
router.get("/me", getCurrentUser);
router.get("/get-all", checkRole([UserRole.Admin]), getAllUsers);
router.get("/:id", checkRole([UserRole.Admin]), getUserById);
router.put("/:id", checkRole([UserRole.Admin]), validateBody(ManageUserDto), updateUser);
export default router;
