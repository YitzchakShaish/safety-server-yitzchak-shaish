import { AppDataSource } from "../config/datasource";
import { UserDto } from "../dto/User.dto";
import { User } from "../entities/User";


export class AuthService {
  static async signup(userDto: UserDto) {
    const userRepo = AppDataSource.getRepository(User);
    const user = userRepo.create(userDto);
    await userRepo.save(user);
    return user;
  }

  static async login(userDto: UserDto) {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email: userDto.email } });

    if (!user) throw new Error("משתמש לא קיים");
    if (user.fullName !== userDto.fullName) {
      user.fullName = userDto.fullName;
      await userRepo.save(user);
    }

    return user;
  }
}
