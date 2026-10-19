import { AppDataSource } from "../config/datasource";
import { User } from "../entities/User";
import { UserRole } from "../enums/UserRole";
import { UserAudit } from "../entities/UserAudit";

async function main() {
    const email = process.argv[2];
    if (!email) throw new Error("Usage: npm run admin:set -- user@example.com");
    await AppDataSource.initialize();
    try {
        await AppDataSource.transaction(async manager => {
            const repo = manager.getRepository(User);
            const user = await repo.findOneBy({ email });
            if (!user) throw new Error("User not found. Register first.");
            const before = { role: user.role };
            user.role = UserRole.Admin;
            await repo.save(user);
            await manager.getRepository(UserAudit).save({ actorId: "local-admin-command", userId: user.id, before, after: { role: user.role } });
        });
        console.log("Administrator assigned successfully.");
    } finally { await AppDataSource.destroy(); }
}
main().catch(err => { console.error(err.message); process.exitCode = 1; });
