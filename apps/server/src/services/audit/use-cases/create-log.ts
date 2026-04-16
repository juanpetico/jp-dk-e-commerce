import { Prisma } from "@prisma/client";
import prisma from "../../../config/prisma.js";

export const createLogUseCase = async (params: {
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    oldValue?: string | null;
    newValue?: string | null;
    metadata?: object | null;
}): Promise<void> => {
    await prisma.auditLog.create({
        data: {
            actorId: params.actorId,
            action: params.action,
            entityType: params.entityType,
            entityId: params.entityId,
            oldValue: params.oldValue ?? null,
            newValue: params.newValue ?? null,
            metadata: params.metadata ?? Prisma.JsonNull,
        },
    });
};
