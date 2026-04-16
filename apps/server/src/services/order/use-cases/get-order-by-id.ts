import prisma from "../../../config/prisma.js";
import { AppError } from "../../../middleware/error-handler.js";
import { orderWithRelationsInclude } from "../order.queries.js";

export const getOrderByIdUseCase = async (orderId: string, userId?: string) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: orderWithRelationsInclude,
    });

    if (!order) {
        throw new AppError("Order not found", 404);
    }

    if (userId && order.userId !== userId) {
        throw new AppError("Access denied", 403);
    }

    return order;
};
