import { AppDataSource } from "../config/datasource";
import { User } from "../entities/User";


export class UserService {
    private userRepo = AppDataSource.getRepository(User)


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
