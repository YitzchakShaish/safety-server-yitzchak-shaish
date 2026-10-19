import { UserService } from "../services/user.service";
import { Request, Response } from "express";
import {
    AVATAR_REMOVED_MESSAGE,
    AVATAR_REQUIRED_MESSAGE,
    AVATAR_UPDATED_MESSAGE,
} from "../utils/avatarFile";

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

function avatarErrorStatus(message: string) {
    return message === "המשתמש לא נמצא" ? 404 : 400;
}

export async function uploadProfilePicture(req: Request, res: Response) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: AVATAR_REQUIRED_MESSAGE });
        }
        const user = await userService.setAvatar(req.user!.id, req.file);
        return res.status(200).json({ message: AVATAR_UPDATED_MESSAGE, data: user });
    } catch (err) {
        const message = err instanceof Error ? err.message : "שגיאה בעדכון תמונת הפרופיל";
        return res.status(avatarErrorStatus(message)).json({ message });
    }
}

export async function removeProfilePicture(req: Request, res: Response) {
    try {
        const user = await userService.removeAvatar(req.user!.id);
        return res.status(200).json({ message: AVATAR_REMOVED_MESSAGE, data: user });
    } catch (err) {
        const message = err instanceof Error ? err.message : "שגיאה בהסרת תמונת הפרופיל";
        return res.status(avatarErrorStatus(message)).json({ message });
    }
}
