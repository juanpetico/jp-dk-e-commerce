import { createLogUseCase } from "./audit/use-cases/create-log.js";
import { listLogsUseCase } from "./audit/use-cases/list-logs.js";
import { withAuditUseCase } from "./audit/use-cases/with-audit.js";
import type { AuditAction, AuditEntry, ListLogsParams, ListLogsResult } from "./audit/audit.types.js";

export type { AuditAction, AuditEntry, ListLogsParams, ListLogsResult };

export async function createLog(params: {
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    oldValue?: string | null;
    newValue?: string | null;
    metadata?: object | null;
}): Promise<void> {
    return createLogUseCase(params);
}

export async function withAudit<T>(
    actorId: string,
    entityType: string,
    entityId: string,
    action: AuditAction,
    oldValue: string | null,
    newValue: string | null,
    work: (tx: import("@prisma/client").Prisma.TransactionClient) => Promise<T>,
    metadata?: object
): Promise<T> {
    return withAuditUseCase(actorId, entityType, entityId, action, oldValue, newValue, work, metadata);
}

export async function listLogs(params: ListLogsParams): Promise<ListLogsResult> {
    return listLogsUseCase(params);
}
