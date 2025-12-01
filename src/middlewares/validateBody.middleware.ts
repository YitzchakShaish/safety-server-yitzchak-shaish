import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

export const validateBody = (dtoClass: any) => async (req: Request, res: Response, next: NextFunction) => {

    const formatValidationErrors = (errors: any[], parentPath = ''): string[] => {
        const result: string[] = [];

        for (const err of errors) {
            const path = parentPath ? `${parentPath}.${err.property}` : err.property;

            if (err.constraints) {
                for (const msg of Object.values(err.constraints)) {
                    result.push(`${path}: ${msg}`);
                }
            }

            if (err.children && err.children.length) {
                result.push(...formatValidationErrors(err.children, path));
            }
        }

        return result;
    };

    if (!req.body || typeof req.body !== "object") {
        return res.status(400).json({ message: "בקשה ריקה או לא תקינה" });
    }

    const dtoObj = plainToInstance(dtoClass, req.body);
    const errors = await validate(dtoObj, { whitelist: true, forbidNonWhitelisted: true });

    if (errors.length > 0) {
        const messages = formatValidationErrors(errors);
        return res.status(400).json({ message: messages });
    }

    return next();
};
