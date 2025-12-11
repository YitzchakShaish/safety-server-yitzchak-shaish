import { User } from "../entities/User";
import { MilitaryRank } from "../enums/EventEnums";
import { AppDataSource } from "../config/datasource";

const RANK_ORDER = Object.values(MilitaryRank);

export async function updateRankIfNeeded(user: User) {
    const userRepo = AppDataSource.getRepository(User);

    if (!user) return;

    const totalActions =
        (user.reportsCount || 0) +
        (user.updatesCount || 0) +
        (user.deletesCount || 0);
    const steps = Math.floor(totalActions / 5);

    const currentIndex = RANK_ORDER.indexOf(user.rank);
    const newIndex = Math.min(currentIndex + steps, RANK_ORDER.length - 1);

    if (newIndex !== currentIndex) {
        user.rank = RANK_ORDER[newIndex];
        await userRepo.save(user);
    }

    return user;
}
