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

    const targetIndex = Math.min(
        Math.floor(totalActions / 5),
        RANK_ORDER.length - 1
    );

    if (user.rank !== RANK_ORDER[targetIndex]) {
        user.rank = RANK_ORDER[targetIndex];
        await userRepo.save(user);
    }

    return user;
}

