import { Prisma } from "@prisma/client";
import type { ListLogsParams } from "./audit.types.js";

export const buildListLogsWhere = (params: ListLogsParams): Prisma.AuditLogWhereInput => {
    const createdAtFilter: Prisma.DateTimeFilter | undefined =
        params.createdFrom || params.createdTo
            ? {
                  ...(params.createdFrom ? { gte: params.createdFrom } : {}),
                  ...(params.createdTo ? { lte: params.createdTo } : {}),
              }
            : undefined;

    const actorSearchFilter: Prisma.AuditLogWhereInput | undefined = params.actorQuery
        ? {
              actor: {
                  is: {
                      OR: [
                          { name: { contains: params.actorQuery, mode: "insensitive" } },
                          { email: { contains: params.actorQuery, mode: "insensitive" } },
                      ],
                  },
              },
          }
        : undefined;

    if (params.userId) {
        return {
            AND: [
                {
                    OR: [
                        { entityId: params.userId, entityType: "USER" },
                        { actorId: params.userId },
                    ],
                },
                ...(actorSearchFilter ? [actorSearchFilter] : []),
                ...(createdAtFilter ? [{ createdAt: createdAtFilter }] : []),
            ],
        };
    }

    return {
        ...(params.entityType ? { entityType: params.entityType } : {}),
        ...(params.entityId ? { entityId: params.entityId } : {}),
        ...(params.actorId ? { actorId: params.actorId } : {}),
        ...(actorSearchFilter ?? {}),
        ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
    };
};
