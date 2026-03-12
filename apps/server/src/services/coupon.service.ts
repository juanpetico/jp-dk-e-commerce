import prisma from "../config/prisma.js";
import { AppError } from "../middleware/error-handler.js";
import { shopConfigService } from "./shop-config.service.js";

export const couponService = {
    async validateCoupon(code: string, userId: string, currentTotal: number, tx?: any) {
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
    },

    async getAllCoupons() {
        return await prisma.coupon.findMany({
            orderBy: { createdAt: "desc" },
        });
    },

    async createCoupon(data: any) {
        const startDate = data.startDate ? new Date(data.startDate) : new Date();
        startDate.setHours(0, 0, 0, 0);

        let endDate = null;
        if (data.endDate) {
            endDate = new Date(data.endDate);
            endDate.setHours(23, 59, 59, 999);
        }

        return await prisma.coupon.create({
            data: {
                ...data,
                startDate,
                endDate,
            },
        });
    },

    async updateCoupon(id: string, data: any) {
        const updateData: any = { ...data };

        if (data.startDate) {
            const startDate = new Date(data.startDate);
            startDate.setHours(0, 0, 0, 0);
            updateData.startDate = startDate;
        }

        if (data.endDate) {
            const endDate = new Date(data.endDate);
            endDate.setHours(23, 59, 59, 999);
            updateData.endDate = endDate;
        } else if (data.endDate === null) {
            updateData.endDate = null;
        }

        const oldCoupon = await prisma.coupon.findUnique({
            where: { id }
        });

        const coupon = await prisma.coupon.update({
            where: { id },
            data: updateData,
        });

        // Sync with shop config if this is an automated coupon
        await shopConfigService.syncConfigFromCoupon(coupon, oldCoupon?.code);

        return coupon;
    },

    async deleteCoupon(id: string) {
        return await prisma.coupon.delete({
            where: { id },
        });
    },

    async assignCouponToUser(userId: string, couponCode: string, tx?: any) {
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
                coupon: true
            }
        });

        return { assignment: newAssignment, isNew: true };
    },

    async getUserCoupons(userId: string) {
        const now = new Date();

        return await prisma.userCoupon.findMany({
            where: {
                userId,
                isUsed: false,
                coupon: {
                    isActive: true,
                    startDate: { lte: now },
                    OR: [
                        { endDate: null },
                        { endDate: { gte: now } }
                    ]
                }
            },
            include: {
                coupon: true
            },
            orderBy: {
                assignedAt: 'desc'
            }
        });
    },
};
