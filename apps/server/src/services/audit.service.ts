import { Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";

export type AuditAction =
    | "ROLE_CHANGE"
    | "STATUS_CHANGE"
    | "PRODUCT_CREATED"
    | "PRODUCT_DELETED"
    | "PRODUCT_PRICE_CHANGE"
    | "PRODUCT_STOCK_CHANGE"
    | "PRODUCT_PUBLISHED"
    | "PRODUCT_UNPUBLISHED"
    | "ORDER_STATUS_CHANGE"
    | "CATEGORY_CREATED"
    | "CATEGORY_DELETED"
    | "STORE_CONFIG_CHANGE";

export interface AuditEntry {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    oldValue: string | null;
    newValue: string | null;
    createdAt: Date;
    actor: {
        id: string;
        name: string | null;
        email: string;
    };
}

export interface ListLogsParams {
    entityType?: string;
    entityId?: string;
    actorId?: string;
    take?: number;
    skip?: number;
}

export interface ListLogsResult {
    items: AuditEntry[];
    total: number;
}

/**
 * Creates a single AuditLog entry. Use this for fire-and-forget logging
 * outside of a transaction.
 */
export async function createLog(params: {
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    oldValue?: string | null;
    newValue?: string | null;
    metadata?: object | null;
}): Promise<void> {
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
}

/**
 * Wraps a mutation inside a Prisma transaction that also creates an AuditLog row.
 * The work function receives the transaction client and must perform the mutation within it.
 */
export async function withAudit<T>(
    actorId: string,
    entityType: string,
    entityId: string,
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
                entityType,
                entityId,
                oldValue,
                newValue,
                metadata: metadata ?? Prisma.JsonNull,
            },
        });
        return result;
    });
}

/**
 * Returns paginated audit log entries ordered newest-first.
 * Supports optional filtering by entityType and actorId.
 */
export async function listLogs(params: ListLogsParams): Promise<ListLogsResult> {
    const take = Math.min(params.take ?? 20, 100);
    const skip = params.skip ?? 0;

    const where: Prisma.AuditLogWhereInput = {
        ...(params.entityType ? { entityType: params.entityType } : {}),
        ...(params.entityId ? { entityId: params.entityId } : {}),
        ...(params.actorId ? { actorId: params.actorId } : {}),
    };

    const [total, items] = await prisma.$transaction([
        prisma.auditLog.count({ where }),
        prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take,
            skip,
            select: {
                id: true,
                action: true,
                entityType: true,
                entityId: true,
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
        }),
    ]);

    return { items, total };
}
