import prisma from "../../../config/prisma.js";
import { activeUserCouponsWhere } from "../coupon.queries.js";

export const getUserCouponsUseCase = async (userId: string) => {
    const now = new Date();

    return prisma.userCoupon.findMany({
        where: activeUserCouponsWhere(userId, now),
        include: {
            coupon: true,
        },
        orderBy: {
            assignedAt: "desc",
        },
    });
};
