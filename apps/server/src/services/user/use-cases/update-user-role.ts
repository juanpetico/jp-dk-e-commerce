import prisma from "../../../config/prisma.js";
import { AppError } from "../../../middleware/error-handler.js";
import { invalidateAuthCache } from "../../../middleware/auth.middleware.js";
import { withAudit } from "../../audit.service.js";
import { adminUserListSelect } from "../user.queries.js";
import { assertCanMutate } from "../user.guards.js";
import type { UserRole } from "../user.types.js";

export const updateUserRoleUseCase = async (actorId: string, targetId: string, newRole: string) => {
    const actor = await prisma.user.findUnique({
        where: { id: actorId },
        select: { id: true, role: true },
    });
    if (!actor) throw new AppError("Actor not found", 404);

    const target = await prisma.user.findUnique({
        where: { id: targetId },
        select: { id: true, role: true, isActive: true, email: true },
    });
    if (!target) throw new AppError("User not found", 404);

    assertCanMutate(actor, target, { role: newRole });

    const updatedUser = await withAudit(
        actorId,
        "USER",
        targetId,
        "ROLE_CHANGE",
        target.role,
        newRole,
        (tx) =>
            tx.user.update({
                where: { id: targetId },
                data: { role: newRole as UserRole },
                select: adminUserListSelect,
            }),
        {
            targetEmail: target.email,
        }
    );

    invalidateAuthCache(targetId);
    return updatedUser;
};
