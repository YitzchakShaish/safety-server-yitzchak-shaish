import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";

export function checkAuth(req: Request, res: Response, next: NextFunction) {

    const token =
        req.headers["authorization"]?.split(" ")[1] || // Bearer token
        req.cookies?.token ||
        req.body?.token;

    if (!token) {
        return res.status(401).json({ message: "אין טוקן – התחבר מחדש" });
    }

    try {
        const decoded = verifyToken(token);
        req.user = { id: decoded.id, rank: decoded.rank };

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

export function checkRank(ranks: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !ranks.includes(req.user.rank)) {
        return res.status(403).json({ message: "אין הרשאה לבצע את הפעולה" });
      }

      return next();
    } catch (err) {
      return res.status(403).json({ message: "טוקן לא תקין – אין גישה" });
    }
  };
}
