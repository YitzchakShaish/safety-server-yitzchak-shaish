import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

export const validateBody = (dtoClass: any) => async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body || typeof req.body !== "object") {
        return res.status(400).json({ message: "בקשה ריקה או לא תקינה" });
    }
    const dtoObj = plainToInstance(dtoClass, req.body);
    const errors = await validate(dtoObj);

    if (errors.length > 0) {
        const messages = errors.map(err => Object.values(err.constraints || {})).flat();
        return res.status(400).json({ message: messages.join(", ") });
    }
    return next();
};
