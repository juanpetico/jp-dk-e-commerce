import prisma from "../config/prisma.js";
import { AppError } from "../middleware/error-handler.js";
import { shopConfigService } from "./shop-config.service.js";
import { createLog } from "./audit.service.js";

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

    async createCoupon(data: any, actorId: string) {
        const startDate = data.startDate ? new Date(data.startDate) : new Date();
        startDate.setHours(0, 0, 0, 0);

        let endDate = null;
        if (data.endDate) {
            endDate = new Date(data.endDate);
            endDate.setHours(23, 59, 59, 999);
        }

        const coupon = await prisma.coupon.create({
            data: {
                ...data,
                startDate,
                endDate,
            },
        });

        await createLog({
            actorId,
            action: "COUPON_CREATED",
            entityType: "COUPON",
            entityId: coupon.id,
            newValue: coupon.code,
            metadata: { description: coupon.description, type: coupon.type, value: coupon.value },
        });

        return coupon;
    },

    async updateCoupon(id: string, data: any, actorId: string) {
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

        if (oldCoupon) {
            const TRACKED = ['code', 'value', 'type', 'isActive', 'description', 'minAmount', 'maxUses', 'isPublic'] as const;
            const oldFields: Record<string, unknown> = {};
            const newFields: Record<string, unknown> = {};
            for (const key of TRACKED) {
                if (String(oldCoupon[key]) !== String(coupon[key])) {
                    oldFields[key] = oldCoupon[key];
                    newFields[key] = coupon[key];
                }
            }
            if (Object.keys(newFields).length > 0) {
                await createLog({
                    actorId,
                    action: "COUPON_UPDATED",
                    entityType: "COUPON",
                    entityId: coupon.id,
                    oldValue: JSON.stringify(oldFields),
                    newValue: JSON.stringify(newFields),
                    metadata: { couponCode: coupon.code },
                });
            }
        }

        return coupon;
    },

    async deleteCoupon(id: string, actorId: string) {
        const coupon = await prisma.coupon.findUnique({ where: { id } });

        const result = await prisma.coupon.delete({
            where: { id },
        });

        if (coupon) {
            await createLog({
                actorId,
                action: "COUPON_DELETED",
                entityType: "COUPON",
                entityId: id,
                oldValue: coupon.code,
                metadata: { description: coupon.description },
            });
        }

        return result;
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
