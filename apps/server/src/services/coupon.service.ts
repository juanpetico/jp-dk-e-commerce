import prisma from "../config/prisma.js";
import { AppError } from "../middleware/error-handler.js";
import { shopConfigService } from "./shop-config.service.js";
import { createLog } from "./audit.service.js";
import { getAllCouponsUseCase } from "./coupon/use-cases/get-all-coupons.js";
import { createCouponUseCase } from "./coupon/use-cases/create-coupon.js";
import { updateCouponUseCase } from "./coupon/use-cases/update-coupon.js";
import { deleteCouponUseCase } from "./coupon/use-cases/delete-coupon.js";
import type { CouponMutationData, CreateCouponData } from "./coupon/coupon.types.js";

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
        return getAllCouponsUseCase();
    },

    async createCoupon(data: CreateCouponData, actorId: string) {
        return createCouponUseCase(data, actorId);
    },

    async updateCoupon(id: string, data: CouponMutationData, actorId: string) {
        return updateCouponUseCase(id, data, actorId);
    },

    async deleteCoupon(id: string, actorId: string) {
        return deleteCouponUseCase(id, actorId);
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
