import { AppDataSource } from "../config/datasource";
import { User } from "../entities/User";
import { UserRole } from "../enums/UserRole";
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";

export async function checkAuth(req: Request, res: Response, next: NextFunction) {

    const token =
        req.headers["authorization"]?.split(" ")[1] || // Bearer token
        req.cookies?.token ||
        req.body?.token;

    if (!token) {
        return res.status(401).json({ message: "אין טוקן – התחבר מחדש" });
    }

    try {
        const decoded = verifyToken(token);
        const user = await AppDataSource.getRepository(User).findOne({ where: { id: decoded.id } });
        if (!user) return res.status(401).json({ message: "יש להתחבר מחדש" });
        req.user = { id: user.id, rank: user.rank, role: user.role, unit: user.unit };

        return next();
    } catch (err) {
        const expired = err instanceof Error && err.name === "TokenExpiredError";
        res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
        return res.status(401).json({
            code: expired ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
            message: expired ? "תוקף ההתחברות פג – יש להתחבר מחדש" : "ההתחברות אינה תקפה – יש להתחבר מחדש"
        });
    }
}

export function checkRole(roles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "אין הרשאה לבצע את הפעולה" });
        }
        return next();
    };
}
