import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { UserDto } from "../dto/User.dto";


export class AuthController {
  static async signup(req: Request, res: Response) {
    const userDto: UserDto = req.body;
    try {
      const user = await AuthService.signup(userDto);
      return res.status(201).json({ message: "המשתמש נוצר בהצלחה", user });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    const userDto: UserDto = req.body;
    try {
      const user = await AuthService.login(userDto);
      return res.status(200).json({ message: "התחברת בהצלחה", user });
    } catch (err: any) {
      return res.status(404).json({ message: err.message });
    }
  }
}
