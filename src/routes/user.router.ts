import { Router } from "express";
import { getAllUsers, getUserById } from "../controllers/user.controller";
import { checkAuth } from "../middlewares/auth.middleware";

const router = Router();

router.get("/get-all", checkAuth, getAllUsers);

router.get("/:id", getUserById);


export default router;