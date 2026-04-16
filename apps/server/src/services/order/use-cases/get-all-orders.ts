import prisma from "../../../config/prisma.js";
import { buildOrderWhere, orderWithAddressesInclude } from "../order.queries.js";
import type { OrderFilters } from "../order.types.js";

export const getAllOrdersUseCase = async (filters?: OrderFilters) => {
    const where = buildOrderWhere(filters);

    return prisma.order.findMany({
        where,
        include: orderWithAddressesInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
};
