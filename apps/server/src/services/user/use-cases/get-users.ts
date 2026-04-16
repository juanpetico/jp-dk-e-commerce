import prisma from "../../../config/prisma.js";
import { adminUserListSelect, buildUsersWhere } from "../user.queries.js";
import type { UserListParams } from "../user.types.js";

export const getUsersUseCase = async (params: UserListParams) => {
    const limit = params.limit ?? 20;
    const take = limit + 1;
    const where = buildUsersWhere(params);

    const users = await prisma.user.findMany({
        where,
        take,
        ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
        orderBy: { createdAt: "desc" },
        select: adminUserListSelect,
    });

    const hasNextPage = users.length > limit;
    const items = hasNextPage ? users.slice(0, limit) : users;
    const lastItem = items[items.length - 1];
    const nextCursor = hasNextPage && lastItem ? lastItem.id : null;

    return { users: items, nextCursor };
};
