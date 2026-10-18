import { ManageUserDto } from "../dto/ManageUser.dto";
import { UserRole } from "../enums/UserRole";
import { UserAudit } from "../entities/UserAudit";
import { AppDataSource } from "../config/datasource";
import { User } from "../entities/User";


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
