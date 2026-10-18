import { UserRole } from "../enums/UserRole";
import { EventReport } from "../entities/EventReport";

export type SessionUser = { id: string; rank: string; role: UserRole; unit: string };

export function reportScope(user: SessionUser) {
    if (user.role === UserRole.Admin) return {};
    if (user.role === UserRole.SafetyOfficer && user.unit) return { reporterProfile: { unit: user.unit } };
    return { reporter: { id: user.id } };
}

export function canReadReport(user: SessionUser, report: EventReport) {
    return user.role === UserRole.Admin || report.reporter.id === user.id ||
        (user.role === UserRole.SafetyOfficer && !!user.unit && report.reporterProfile.unit === user.unit);
}

export function canManageReport(user: SessionUser, report: EventReport) {
    return user.role === UserRole.Admin ||
        (user.role === UserRole.SafetyOfficer && !!user.unit && report.reporterProfile.unit === user.unit);
}
