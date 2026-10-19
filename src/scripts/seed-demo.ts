import { AppDataSource } from "../config/datasource";
import { User } from "../entities/User";
import { EventReport } from "../entities/EventReport";
import { ReporterProfile } from "../entities/ReporterProfile";
import { UserRole } from "../enums/UserRole";
import { Category, EventStatus, EventSeverity, MilitaryRank, Location, UnitActivityType, PersonalActivityType, EventResult, WeatherCondition } from "../enums/EventEnums";

async function seed() {
    // Explicit isolated database: this command never connects to the regular database.
    AppDataSource.setOptions({ database: "src/db/demo.sqlite" });
    await AppDataSource.initialize();
    try {
        if (await AppDataSource.getRepository(User).count()) {
            console.log("Demo database already populated; no data changed.");
            return;
        }
        await AppDataSource.transaction(async manager => {
            const users = manager.getRepository(User);
            await users.save(users.create({ fullName: "מנהל הדגמה", email: "admin@safety.demo", role: UserRole.Admin, rank: MilitaryRank.Seren, unit: "יחידת אלון", position: "מנהל מערכת" }));
            await users.save(users.create({ fullName: "קצין בטיחות", email: "officer@safety.demo", role: UserRole.SafetyOfficer, rank: MilitaryRank.Samal, unit: "יחידת אלון", position: "קצין בטיחות" }));
            const reporters: User[] = [];
            for (let i = 0; i < 3; i++) reporters.push(await users.save(users.create({
                fullName: ["ישראל כהן", "דוד לוי", "משה ישראלי"][i], email: `user${i + 1}@safety.demo`,
                role: UserRole.User, unit: ["יחידת אלון", "יחידת ברוש", "יחידת ארז"][i], position: "חייל", reportsCount: 28
            })));
            const descriptions = ["מפגע בטיחות בנתיב הליכה במהלך פעילות שגרתית", "ציוד פגום זוהה בבדיקת בטיחות לפני אימון", "חריגה מכללי הבטיחות במהלך נסיעה ביחידה", "סכנת החלקה סמוך למבנה בעקבות גשם"];
            const categories = [Category.Falls, Category.Work, Category.Roads, Category.Weather];
            for (let i = 0; i < 84; i++) {
                const reporter = reporters[i % 3];
                const date = new Date();
                date.setDate(date.getDate() - Math.floor(i * 90 / 84));
                date.setHours(10, 0, 0, 0);
                const status = i % 5 === 0 ? EventStatus.NotTreated : i % 5 === 1 ? EventStatus.InTreatment : EventStatus.Treated;
                const profile = manager.getRepository(ReporterProfile).create({ user: reporter, unit: reporter.unit, subUnit: "פלוגת הדגמה", phone: "0500000000", position: "חייל" });
                const report = manager.getRepository(EventReport).create({ reporter, reporterProfile: profile,
                    createdAt: date, updatedAt: date,
                    eventInfo: { eventDate: date.toISOString().slice(0, 10), eventTime: "10:00", eventDescription: descriptions[i % 4],
                        category: categories[i % 4], location: Location.Base, unitActivityType: UnitActivityType.Training,
                        personalActivityType: PersonalActivityType.Routine, eventSeverity: i % 7 === 0 ? EventSeverity.High : i % 3 === 0 ? EventSeverity.Medium : EventSeverity.Low,
                        eventResult: EventResult.NoneNoDamage, weatherCondition: WeatherCondition.Clear },
                    summaryInfo: { eventStatus: status, recommendations: "בוצע תדריך בטיחות ונקבע מעקב אחר תיקון הליקוי", approval: true }
                });
                await manager.getRepository(EventReport).save(report);
            }
        });
        console.log("Created 84 fictitious events in demo.sqlite. Accounts: admin@safety.demo, officer@safety.demo, user1@safety.demo (and user2/user3). Start with npm run dev:demo.");
    } finally { await AppDataSource.destroy(); }
}
seed().catch(err => { console.error(err.message); process.exitCode = 1; });
