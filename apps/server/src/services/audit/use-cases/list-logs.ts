import prisma from "../../../config/prisma.js";
import { buildListLogsWhere } from "../audit.queries.js";
import type { ListLogsParams, ListLogsResult } from "../audit.types.js";

export const listLogsUseCase = async (params: ListLogsParams): Promise<ListLogsResult> => {
    const take = Math.min(params.take ?? 20, 100);
    const skip = params.skip ?? 0;
    const where = buildListLogsWhere(params);

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
                metadata: true,
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
};
