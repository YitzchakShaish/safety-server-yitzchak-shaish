import jwt from "jsonwebtoken";
import { config } from "../config";


const secretString = config.secretString!

export function generateToken(payload: object, secret: string = secretString): string {
    return jwt.sign(payload, secret, { expiresIn: "1h" });
}

export function verifyToken(token: string, secret: string = secretString): { id: string, rank: string } {
    return jwt.verify(token, secret);
}
