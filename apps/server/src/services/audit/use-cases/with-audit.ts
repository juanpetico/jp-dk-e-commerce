import { Prisma } from "@prisma/client";
import prisma from "../../../config/prisma.js";
import type { AuditAction } from "../audit.types.js";

export const withAuditUseCase = async <T>(
    actorId: string,
    entityType: string,
    entityId: string,
    action: AuditAction,
    oldValue: string | null,
    newValue: string | null,
    work: (tx: Prisma.TransactionClient) => Promise<T>,
    metadata?: object
): Promise<T> => {
    return prisma.$transaction(async (tx) => {
        const result = await work(tx);
        await tx.auditLog.create({
            data: {
                action,
                actorId,
                entityType,
                entityId,
                oldValue,
                newValue,
                metadata: metadata ?? Prisma.JsonNull,
            },
        });
        return result;
    });
};
