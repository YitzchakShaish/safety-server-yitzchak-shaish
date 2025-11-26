import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { checkUserExists, checkUserNotExists } from "../middlewares/checkUserExists.middleware";
import { UserDto } from "../dto/User.dto";
import { validateBody } from "../middlewares/validateBody.middleware";


const router = Router();

router.post("/signup", validateBody(UserDto), checkUserExists, AuthController.signup);
router.post("/login", validateBody(UserDto), checkUserNotExists, AuthController.login);

export default router;
