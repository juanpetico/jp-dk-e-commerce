import prisma from "../../../config/prisma.js";
import { AppError } from "../../../middleware/error-handler.js";
import { invalidateAuthCache } from "../../../middleware/auth.middleware.js";
import { withAudit } from "../../audit.service.js";
import { adminUserListSelect } from "../user.queries.js";
import { assertCanMutate } from "../user.guards.js";

export const toggleUserStatusUseCase = async (
    actorId: string,
    targetId: string,
    newIsActive: boolean,
    deactivationReason?: string
) => {
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

    assertCanMutate(actor, target, { isActive: newIsActive });

    const updatedUser = await withAudit(
        actorId,
        "USER",
        targetId,
        "STATUS_CHANGE",
        String(target.isActive),
        String(newIsActive),
        (tx) =>
            tx.user.update({
                where: { id: targetId },
                data: {
                    isActive: newIsActive,
                    deactivationReason: newIsActive ? null : deactivationReason ?? null,
                },
                select: adminUserListSelect,
            }),
        {
            targetEmail: target.email,
            ...(!newIsActive && deactivationReason ? { deactivationReason } : {}),
        }
    );

    invalidateAuthCache(targetId);
    return updatedUser;
};
