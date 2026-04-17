import prisma from "../../../config/prisma.js";
import { AppError } from "../../../middleware/error-handler.js";

export const validateCouponUseCase = async (
    code: string,
    userId: string,
    currentTotal: number,
    tx?: any
) => {
    const db = tx || prisma;
    const coupon = await db.coupon.findUnique({
        where: { code: code.toUpperCase() },
    });

    if (!coupon) {
        throw new AppError("El cupón no existe", 404);
    }

    if (!coupon.isActive) {
        throw new AppError("El cupón no está activo", 400);
    }

    const now = new Date();
    if (now < coupon.startDate) {
        throw new AppError("El cupón aún no es válido", 400);
    }

    if (coupon.endDate && now > coupon.endDate) {
        throw new AppError("El cupón ha expirado", 400);
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
        throw new AppError("El cupón ha alcanzado su límite de usos", 400);
    }

    const userOrdersWithCoupon = await db.order.count({
        where: {
            userId,
            couponId: coupon.id,
            status: { not: "CANCELLED" },
        },
    });

    if (userOrdersWithCoupon >= coupon.maxUsesPerUser) {
        throw new AppError("Ya has usado este cupón el máximo de veces permitido", 400);
    }

    if (currentTotal < coupon.minAmount) {
        throw new AppError(`El monto mínimo de compra para este cupón es $${coupon.minAmount}`, 400);
    }

    if (!coupon.isPublic) {
        const userCoupon = await db.userCoupon.findUnique({
            where: {
                userId_couponId: {
                    userId,
                    couponId: coupon.id,
                },
            },
        });

        if (!userCoupon) {
            throw new AppError("Este cupón es privado y no está asignado a tu cuenta", 403);
        }

        if (userCoupon.isUsed) {
            throw new AppError("Ya has utilizado este cupón privado", 400);
        }
    }

    return coupon;
};
