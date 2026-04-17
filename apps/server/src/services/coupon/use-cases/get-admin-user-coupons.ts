import prisma from "../../../config/prisma.js";

export const getAdminUserCouponsUseCase = async (userId: string) => {
    return prisma.userCoupon.findMany({
        where: { userId },
        include: { coupon: true },
        orderBy: { assignedAt: "desc" },
    });
};
