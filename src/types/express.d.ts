import { SessionUser } from "../utils/permissions";

declare global {
    namespace Express {
        interface Request {
            user?: SessionUser;
        }
    }
}
