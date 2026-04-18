import prisma from "../../../config/prisma.js";
import { orderWithRelationsInclude } from "../order.queries.js";

export const getUserOrdersUseCase = async (userId: string) => {
    return prisma.order.findMany({
        where: { userId },
        include: orderWithRelationsInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
};
