import prisma from "../../../config/prisma.js";

export const assignCouponToUserUseCase = async (
    userId: string,
    couponCode: string,
    tx?: any
) => {
    const db = tx || prisma;

    const coupon = await db.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
    });

    if (!coupon) {
        console.warn(`Tentativa de asignar cupón inexistente: ${couponCode}`);
        return null;
    }

    const existingAssignment = await db.userCoupon.findUnique({
        where: {
            userId_couponId: {
                userId,
                couponId: coupon.id,
            },
        },
    });

    if (existingAssignment) {
        return { assignment: existingAssignment, isNew: false };
    }

    const newAssignment = await db.userCoupon.create({
        data: {
            userId,
            couponId: coupon.id,
            isUsed: false,
            assignedAt: new Date(),
        },
        include: {
            coupon: true,
        },
    });

    return { assignment: newAssignment, isNew: true };
};
