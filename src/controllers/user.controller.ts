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
