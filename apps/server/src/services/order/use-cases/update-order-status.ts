import prisma from "../../../config/prisma.js";
import { AppError } from "../../../middleware/error-handler.js";
import { createLog } from "../../audit.service.js";
import { orderWithAddressesInclude } from "../order.queries.js";
import type { OrderStatus } from "../order.types.js";

export const updateOrderStatusUseCase = async (orderId: string, status: OrderStatus, actorId: string) => {
    const current = await prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true },
    });
    if (!current) throw new AppError("Order not found", 404);

    const order = await prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: orderWithAddressesInclude,
    });

    await createLog({
        actorId,
        action: "ORDER_STATUS_CHANGE",
        entityType: "ORDER",
        entityId: orderId,
        oldValue: current.status,
        newValue: status,
    });

    return order;
};
