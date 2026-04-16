import { Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";

export type AuditAction = "ROLE_CHANGE" | "STATUS_CHANGE";

export interface AuditEntry {
    id: string;
    action: string;
    oldValue: string | null;
    newValue: string | null;
    createdAt: Date;
    actor: {
        id: string;
        name: string | null;
        email: string;
    };
}

/**
 * Wraps a mutation inside a Prisma transaction that also creates an AuditLog row.
 * The work function receives the transaction client and must perform the mutation within it.
 */
export async function withAudit<T>(
    actorId: string,
    targetId: string,
    action: AuditAction,
    oldValue: string | null,
    newValue: string | null,
    work: (tx: Prisma.TransactionClient) => Promise<T>,
    metadata?: object
): Promise<T> {
    return prisma.$transaction(async (tx) => {
        const result = await work(tx);
        await tx.auditLog.create({
            data: {
                action,
                actorId,
                targetUserId: targetId,
                oldValue,
                newValue,
                metadata: metadata ?? Prisma.JsonNull,
            },
        });
        return result;
    });
}

/**
 * Returns paginated audit log entries for a target user, sorted newest-first.
 */
export async function listForUser(
    targetUserId: string,
    limit = 20,
    cursor?: string
): Promise<{ items: AuditEntry[]; nextCursor: string | null }> {
    const take = limit + 1; // fetch one extra to detect next page

    const entries = await prisma.auditLog.findMany({
        where: { targetUserId },
        orderBy: { createdAt: "desc" },
        take,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        select: {
            id: true,
            action: true,
            oldValue: true,
            newValue: true,
            createdAt: true,
            actor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    const hasNextPage = entries.length > limit;
    const items = hasNextPage ? entries.slice(0, limit) : entries;
    const lastItem = items[items.length - 1];
    const nextCursor = hasNextPage && lastItem ? lastItem.id : null;

    return { items, nextCursor };
}
