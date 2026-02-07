import prisma from "../config/prisma.js";
import { AppError } from "../middleware/error-handler.js";

export const couponService = {
    /**
     * Valida un cupón basándose en el código, el usuario y el monto de la compra.
     * Soporta transacciones de Prisma opcionalmente para asegurar consistencia.
     */
    async validateCoupon(code: string, userId: string, currentTotal: number, tx?: any) {
        const db = tx || prisma;
        const coupon = await db.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });

        // 1. Si el cupón existe y está activo
        if (!coupon) {
            throw new AppError("El cupón no existe", 404);
        }

        if (!coupon.isActive) {
            throw new AppError("El cupón no está activo", 400);
        }

        // 2. Rango de fechas
        const now = new Date();
        if (now < coupon.startDate) {
            throw new AppError("El cupón aún no es válido", 400);
        }

        if (coupon.endDate && now > coupon.endDate) {
            throw new AppError("El cupón ha expirado", 400);
        }

        // 3. Límite de usos totales (usedCount < maxUses)
        if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
            throw new AppError("El cupón ha alcanzado su límite de usos", 400);
        }

        // 4. Límite por usuario (maxUsesPerUser)
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

        // 5. Monto mínimo (currentTotal >= minAmount)
        if (currentTotal < coupon.minAmount) {
            throw new AppError(`El monto mínimo de compra para este cupón es $${coupon.minAmount}`, 400);
        }

        // 6. Validación de Privacidad (Billetera)
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

    /**
     * Obtener todos los cupones
     */
    async getAllCoupons() {
        return await prisma.coupon.findMany({
            orderBy: { createdAt: "desc" },
        });
    },

    /**
     * Crear un nuevo cupón
     */
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

    /**
     * Actualizar un cupón existente
     */
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

        return await prisma.coupon.update({
            where: { id },
            data: updateData,
        });
    },

    /**
     * Eliminar un cupón
     */
    async deleteCoupon(id: string) {
        return await prisma.coupon.delete({
            where: { id },
        });
    },

    /**
     * Asignar un cupón a la billetera de un usuario
     */
    async assignCouponToUser(userId: string, couponCode: string, tx?: any) {
        const db = tx || prisma;

        // 1. Buscar el cupón por código
        const coupon = await db.coupon.findUnique({
            where: { code: couponCode.toUpperCase() },
        });

        if (!coupon) {
            console.warn(`Tentativa de asignar cupón inexistente: ${couponCode}`);
            return null;
        }

        // 2. Verificar si el usuario ya tiene este cupón asignado
        const existingAssignment = await db.userCoupon.findUnique({
            where: {
                userId_couponId: {
                    userId,
                    couponId: coupon.id,
                },
            },
        });

        if (existingAssignment) {
            return existingAssignment; // Ya lo tiene, no hacemos nada (unicidad)
        }

        // 3. Crear la relación en la billetera
        return await db.userCoupon.create({
            data: {
                userId,
                couponId: coupon.id,
                isUsed: false,
                assignedAt: new Date(),
            },
        });
    },

    /**
     * Obtener los cupones disponibles en la billetera del usuario
     */
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
