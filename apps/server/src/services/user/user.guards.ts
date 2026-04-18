import { AppError } from "../../middleware/error-handler.js";
import { VALID_USER_ROLES, type UserRole } from "./user.types.js";

interface ActorInfo {
    id: string;
    role: string;
}

interface TargetInfo {
    id: string;
    role: string;
    isActive: boolean;
}

export function assertCanMutate(
    actor: ActorInfo,
    target: TargetInfo,
    change: { role?: string; isActive?: boolean }
): void {
    if (actor.id === target.id) {
        throw new AppError("Cannot modify your own account", 403);
    }
    if (actor.role !== "SUPERADMIN") {
        throw new AppError("Forbidden", 403);
    }
    if (change.role !== undefined && !VALID_USER_ROLES.includes(change.role as UserRole)) {
        throw new AppError("Invalid role", 400);
    }
}
