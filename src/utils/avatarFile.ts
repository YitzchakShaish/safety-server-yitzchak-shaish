import fs from "fs";
import path from "path";
import multer from "multer";

export const AVATAR_FIELD_NAME = "avatar";
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const AVATAR_URL_PREFIX = "/uploads/avatars";

export const AVATAR_TYPE_MESSAGE = "ניתן להעלות קובצי תמונה בלבד (JPG, PNG, WEBP או GIF)";
export const AVATAR_SIZE_MESSAGE = "גודל התמונה חורג מהמותר (עד 5MB)";
export const AVATAR_REQUIRED_MESSAGE = "יש לבחור תמונת פרופיל";
export const AVATAR_INVALID_MESSAGE = "הקובץ אינו תמונה תקינה";
export const AVATAR_REJECTED_MESSAGE = "הקובץ אינו תקין";
export const AVATAR_FIELD_MESSAGE = "יש להעלות קובץ תמונה אחד בשדה avatar";
export const AVATAR_UPLOAD_FAILED_MESSAGE = "לא ניתן להעלות את הקובץ";
export const AVATAR_UPDATED_MESSAGE = "תמונת הפרופיל עודכנה בהצלחה";
export const AVATAR_REMOVED_MESSAGE = "תמונת הפרופיל הוסרה";
export const AVATAR_MISSING_MESSAGE = "אין תמונת פרופיל להסרה";

const KNOWN_UPLOAD_MESSAGES = new Set([
    AVATAR_TYPE_MESSAGE,
    AVATAR_SIZE_MESSAGE,
    AVATAR_INVALID_MESSAGE,
    AVATAR_REJECTED_MESSAGE,
]);

const SAFE_FILENAME = /^[A-Za-z0-9.-]+$/;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

type Signature = {
    extensions: string[];
    matches: (buf: Buffer) => boolean;
};

const SIGNATURES: Record<string, Signature> = {
    "image/jpeg": {
        extensions: [".jpg", ".jpeg"],
        matches: (buf) => buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
    },
    "image/png": {
        extensions: [".png"],
        matches: (buf) => buf.length >= 8 && buf.subarray(0, 8).equals(PNG_SIGNATURE),
    },
    "image/gif": {
        extensions: [".gif"],
        matches: (buf) => {
            const header = buf.subarray(0, 6).toString("ascii");
            return header === "GIF87a" || header === "GIF89a";
        },
    },
    "image/webp": {
        extensions: [".webp"],
        matches: (buf) => buf.length >= 12
            && buf.subarray(0, 4).toString("ascii") === "RIFF"
            && buf.subarray(8, 12).toString("ascii") === "WEBP",
    },
};

export function getAvatarDir(): string {
    const dir = path.join(process.cwd(), "public", "uploads", "avatars");
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}

export function normalizeMime(mimetype: string): string {
    return (mimetype || "").split(";")[0].trim().toLowerCase();
}

export function isAllowedAvatarUpload(mimetype: string, originalName: string): boolean {
    const signature = SIGNATURES[normalizeMime(mimetype)];
    if (!signature) return false;
    return signature.extensions.includes(path.extname(originalName || "").toLowerCase());
}

export function isInsideAvatarDir(filePath: string): boolean {
    const root = path.resolve(getAvatarDir());
    const resolved = path.resolve(filePath);
    return resolved.startsWith(root + path.sep);
}

export function avatarPublicUrl(filename: string): string {
    return `${AVATAR_URL_PREFIX}/${filename}`;
}

export function resolveStoredAvatar(avatarUrl: string | null | undefined): string | null {
    if (!avatarUrl || !avatarUrl.startsWith(`${AVATAR_URL_PREFIX}/`)) return null;
    const filename = path.posix.basename(avatarUrl);
    if (!SAFE_FILENAME.test(filename)) return null;
    const root = path.resolve(getAvatarDir());
    const full = path.resolve(root, filename);
    if (!full.startsWith(root + path.sep)) return null;
    return full;
}

export function removeStoredAvatar(avatarUrl: string | null | undefined): void {
    const full = resolveStoredAvatar(avatarUrl);
    if (!full) return;
    try {
        fs.unlinkSync(full);
    } catch (err) {
        console.error("שגיאה במחיקת קובץ:", err);
    }
}

export function removeUploadedAvatar(filePath: string | undefined): void {
    if (!filePath || !isInsideAvatarDir(filePath)) return;
    try {
        fs.unlinkSync(filePath);
    } catch {
        // The file is already gone.
    }
}

export function assertAvatarFile(file: Express.Multer.File): string {
    const storedPath = path.resolve(file.path);
    const filename = path.basename(storedPath);
    if (!isInsideAvatarDir(storedPath) || filename !== file.filename || !SAFE_FILENAME.test(filename)) {
        throw new Error(AVATAR_REJECTED_MESSAGE);
    }
    if (!isAllowedAvatarUpload(file.mimetype, file.originalname)) {
        throw new Error(AVATAR_TYPE_MESSAGE);
    }

    const stat = fs.statSync(storedPath);
    if (!stat.isFile() || stat.size <= 0) throw new Error(AVATAR_INVALID_MESSAGE);
    if (stat.size > AVATAR_MAX_BYTES) throw new Error(AVATAR_SIZE_MESSAGE);

    const descriptor = fs.openSync(storedPath, "r");
    try {
        const buf = Buffer.alloc(16);
        const bytesRead = fs.readSync(descriptor, buf, 0, 16, 0);
        const signature = SIGNATURES[normalizeMime(file.mimetype)];
        if (!signature || !signature.matches(buf.subarray(0, bytesRead))) {
            throw new Error(AVATAR_INVALID_MESSAGE);
        }
    } finally {
        fs.closeSync(descriptor);
    }

    return filename;
}

export function avatarUploadErrorMessage(err: unknown): string {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") return AVATAR_SIZE_MESSAGE;
        if (err.code === "LIMIT_UNEXPECTED_FILE" || err.code === "LIMIT_FILE_COUNT") return AVATAR_FIELD_MESSAGE;
        return AVATAR_UPLOAD_FAILED_MESSAGE;
    }
    if (err instanceof Error && KNOWN_UPLOAD_MESSAGES.has(err.message)) return err.message;
    return AVATAR_UPLOAD_FAILED_MESSAGE;
}
