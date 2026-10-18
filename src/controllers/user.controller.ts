import { UserService } from "../services/user.service";
import { Request, Response } from "express";

const userService = new UserService();



export async function getAllUsers(_req: Request, res: Response) {
  const result = await userService.getAllUsers();

  if (!result.success) {
    return res.status(500).json({
      status: "error",
      message: result.error,
      details: result.details
    });
  }

  return res.status(200).json({
    status: "success",
    data: result.data
  });
}


export async function getUserById(req: Request, res: Response) {
  const id = String(req.params.id);
  const result = await userService.getUserById(id);

  if (!result.success) {
    return res.status(
      result.message === "User not found" ? 404 : 500
    ).json({ status: "error", message: result.message });
  }

  return res.status(200).json({ status: "success", data: result.data });
}

export async function getCurrentUser(req: Request, res: Response) {
    const result = await userService.getUserById(req.user!.id);
    return res.status(result.success ? 200 : 404).json(result);
}

export async function updateUser(req: Request, res: Response) {
    try {
        const user = await userService.updateUser(String(req.params.id), req.user!.id, req.body);
        return res.json({ data: user, message: "פרטי המשתמש עודכנו" });
    } catch (err) {
        return res.status(400).json({ message: err instanceof Error ? err.message : "שגיאה בעדכון משתמש" });
    }
}
