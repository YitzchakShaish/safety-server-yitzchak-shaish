import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { UserDto } from "../dto/User.dto";
import { generateToken } from "../utils/auth";


export async function signup(req: Request, res: Response) {
    const userDto: UserDto = req.body;
    try {
        const user = await AuthService.signup(userDto);
        return res.status(201).json({ message: "המשתמש נוצר בהצלחה", user });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
}

export async function login(req: Request, res: Response) {
    const userDto: UserDto = req.body;
    try {
        const user = await AuthService.login(userDto);
        const token = generateToken({ id: user.id, rank: user.rank, email: user.email });
        res.cookie('token', token, { httpOnly: true, });
        return res.status(200).json({ message: "התחברת בהצלחה", user, token });
    } catch (err: any) {
        return res.status(404).json({ message: err.message });
    }
}

