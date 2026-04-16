import prisma from "../../../config/prisma.js";

export const getAllCouponsUseCase = async () => {
    return prisma.coupon.findMany({
        orderBy: { createdAt: "desc" },
    });
};
