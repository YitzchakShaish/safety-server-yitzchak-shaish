import { Router } from "express";
import { login, signup } from "../controllers/auth.controller";
import { checkUserExists, checkUserNotExists } from "../middlewares/checkUserExists.middleware";
import { UserDto } from "../dto/User.dto";
import { validateBody } from "../middlewares/validateBody.middleware";


const router = Router();

router.post("/signup", checkUserExists, validateBody(UserDto), signup);
router.post("/login", checkUserNotExists, validateBody(UserDto), login);

export default router;
