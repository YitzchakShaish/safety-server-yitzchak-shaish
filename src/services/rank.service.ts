
import { User } from "../entities/User";
import { EventReport } from "../entities/EventReport";
import { MilitaryRank } from "../enums/EventEnums";
import { AppDataSource } from "../config/datasource";

const RANK_ORDER = Object.values(MilitaryRank);


export async function updateRankIfNeeded(userId: string) {
    const userRepo = AppDataSource.getRepository(User);
    const reportRepo = AppDataSource.getRepository(EventReport);

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) return;

    const reportsCount = await reportRepo.count({ where: { reporter: { id: userId } } });

    const steps = Math.floor(reportsCount / 5);

    const currentIndex = RANK_ORDER.indexOf(user.rank);
    const newIndex = Math.min(currentIndex + steps, RANK_ORDER.length - 1);

    if (newIndex !== currentIndex) {
        user.rank = RANK_ORDER[newIndex];
        await userRepo.save(user);
    }
    console.log(user)
    return user;
}
