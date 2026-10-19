import { ManageUserDto } from "../dto/ManageUser.dto";
import { UserRole } from "../enums/UserRole";
import { UserAudit } from "../entities/UserAudit";
import { AppDataSource } from "../config/datasource";
import { User } from "../entities/User";
import {
    AVATAR_MISSING_MESSAGE,
    assertAvatarFile,
    avatarPublicUrl,
    removeStoredAvatar,
    removeUploadedAvatar,
} from "../utils/avatarFile";


export class UserService {
    private userRepo = AppDataSource.getRepository(User)


    async updateUser(id: string, actorId: string, data: ManageUserDto) {
        return AppDataSource.transaction(async manager => {
            const repo = manager.getRepository(User);
            const actor = await repo.findOneBy({ id: actorId });
            if (actor?.role !== UserRole.Admin) throw new Error("אין הרשאה");
            const user = await repo.findOneBy({ id });
            if (!user) throw new Error("המשתמש לא נמצא");
            if (id === actorId && data.role !== UserRole.Admin) throw new Error("לא ניתן להסיר את הרשאת המנהל של עצמך");
            if (data.role === UserRole.SafetyOfficer && !data.unit.trim()) throw new Error("קצין בטיחות חייב להיות משויך ליחידה");
            const before = { rank: user.rank, role: user.role, unit: user.unit, position: user.position };
            const after = { rank: data.rank, role: data.role, unit: data.unit.trim(), position: data.position.trim() };
            Object.assign(user, after);
            await repo.save(user);
            await manager.getRepository(UserAudit).save({ actorId, userId: id, before, after });
            return user;
        });
    }

    async setAvatar(userId: string, file: Express.Multer.File) {
        let saved = false;
        try {
            const filename = assertAvatarFile(file);
            const nextUrl = avatarPublicUrl(filename);
            let previous: string | null = null;
            const user = await AppDataSource.transaction(async manager => {
                const repo = manager.getRepository(User);
                const found = await repo.findOneBy({ id: userId });
                if (!found) throw new Error("המשתמש לא נמצא");
                previous = found.avatarUrl ?? null;
                found.avatarUrl = nextUrl;
                return repo.save(found);
            });
            saved = true;
            if (previous && previous !== nextUrl) removeStoredAvatar(previous);
            return user;
        } catch (err) {
            if (!saved) removeUploadedAvatar(file.path);
            throw err;
        }
    }

    async removeAvatar(userId: string) {
        let previous: string | null = null;
        const user = await AppDataSource.transaction(async manager => {
            const repo = manager.getRepository(User);
            const found = await repo.findOneBy({ id: userId });
            if (!found) throw new Error("המשתמש לא נמצא");
            if (!found.avatarUrl) throw new Error(AVATAR_MISSING_MESSAGE);
            previous = found.avatarUrl;
            found.avatarUrl = null;
            return repo.save(found);
        });
        removeStoredAvatar(previous);
        return user;
    }

    async getAllUsers() {
        try {
            const users = await this.userRepo.find();
            return { success: true, data: users };
        } catch (err) {
            return { success: false, error: "Unable to fetch users", details: err };
        }
    }

    async getUserById(id: string) {
        try {
            const user = await this.userRepo.findOne({ where: { id } });
            if (!user) {
                return { success: false, message: "User not found" };
            }
            return { success: true, data: user };
        } catch (err) {
            return { success: false, message: "Database or server error" };
        }
    }
}
