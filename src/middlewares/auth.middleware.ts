import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";

export function checkAuth(req: Request, res: Response, next: NextFunction) {

    const token =
        req.headers["authorization"]?.split(" ")[1] || // Bearer token
        req.cookies?.token ||
        req.body?.token;
    console.log(token)

    if (!token) {
        return res.status(401).json({ message: "אין טוקן – התחבר מחדש" });
    }

    try {
        const decoded = verifyToken(token);
        req.user = { id: decoded.id };

        return next();
    } catch (err) {
        return res.status(403).json({ message: "טוקן לא תקין – אין גישה" });
    }
}
