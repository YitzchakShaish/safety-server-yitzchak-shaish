import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";

interface AuthRequest extends Request {
    user?: any;
}

export function checkAuth(req: AuthRequest, res: Response, next: NextFunction) {

    const token =
        req.headers["authorization"]?.split(" ")[1] ||
        req.cookies?.token ||
        req.body?.token;

    if (!token) {
        return res.status(401).json({ message: "Missing token" });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        return next();
    } catch (err) {
        return res.status(403).json({ message: "Token not valid" });
    }
}
