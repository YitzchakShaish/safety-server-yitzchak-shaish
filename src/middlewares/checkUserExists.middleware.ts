import { Request, Response, NextFunction } from "express";
import { User } from "../entities/User";
import { AppDataSource } from "../config/datasource";

export const checkUserExists = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });

    if (user) {
        return res.status(409).json({ message: "משתמש כבר קיים" });
    }
    return next();
};

export const checkUserNotExists = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });

    if (!user) {
        return res.status(404).json({ message: "משתמש לא קיים" });
    }
    return next();
};
