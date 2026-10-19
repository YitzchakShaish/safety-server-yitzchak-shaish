import multer from "multer";
import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";
import {
    AVATAR_FIELD_NAME,
    AVATAR_MAX_BYTES,
    AVATAR_TYPE_MESSAGE,
    avatarUploadErrorMessage,
    getAvatarDir,
    isAllowedAvatarUpload,
    removeUploadedAvatar,
} from "../utils/avatarFile";

const uploadDir = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${unique}${ext}`);
    },
});

export const upload = multer({ storage });

const avatarStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, getAvatarDir());
    },
    filename: (_req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${unique}${ext}`);
    },
});

const avatarParser = multer({
    storage: avatarStorage,
    limits: { fileSize: AVATAR_MAX_BYTES, files: 1 },
    fileFilter: (_req, file, cb) => {
        if (!isAllowedAvatarUpload(file.mimetype, file.originalname)) {
            cb(new Error(AVATAR_TYPE_MESSAGE));
            return;
        }
        cb(null, true);
    },
});

export function uploadAvatar(req: Request, res: Response, next: NextFunction) {
    avatarParser.single(AVATAR_FIELD_NAME)(req, res, (err?: unknown) => {
        if (!err) return next();
        removeUploadedAvatar(req.file?.path);
        return res.status(400).json({ message: avatarUploadErrorMessage(err) });
    });
}
