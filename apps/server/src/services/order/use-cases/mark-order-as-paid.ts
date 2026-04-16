import prisma from "../../../config/prisma.js";
import { orderWithAddressesInclude } from "../order.queries.js";

export const markOrderAsPaidUseCase = async (orderId: string) => {
    return prisma.order.update({
        where: { id: orderId },
        data: {
            isPaid: true,
            paidAt: new Date(),
            status: "CONFIRMED",
        },
        include: orderWithAddressesInclude,
    });
};
