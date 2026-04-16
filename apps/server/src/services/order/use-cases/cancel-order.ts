import prisma from "../../../config/prisma.js";
import { AppError } from "../../../middleware/error-handler.js";
import { getOrderByIdUseCase } from "./get-order-by-id.js";

export const cancelOrderUseCase = async (orderId: string, userId?: string) => {
    const order = await getOrderByIdUseCase(orderId, userId);

    if (order.status === "CANCELLED") {
        throw new AppError("Order is already cancelled", 400);
    }

    if (order.status === "DELIVERED") {
        throw new AppError("Cannot cancel delivered order", 400);
    }

    return prisma.$transaction(async (tx: any) => {
        for (const item of order.items) {
            await tx.productVariant.update({
                where: {
                    productId_size: {
                        productId: item.productId,
                        size: item.size,
                    },
                },
                data: {
                    stock: {
                        increment: item.quantity,
                    },
                },
            });
        }

        return tx.order.update({
            where: { id: orderId },
            data: { status: "CANCELLED" },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: true,
                                category: true,
                                variants: true,
                            },
                        },
                    },
                },
            },
        });
    });
};
