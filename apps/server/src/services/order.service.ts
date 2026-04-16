import prisma from "../config/prisma.js";
import { AppError } from "../middleware/error-handler.js";
import { couponService } from "./coupon.service.js";
import { shopConfigService } from "./shop-config.service.js";
import { createLog } from "./audit.service.js";

// Type definitions until Prisma generates types
type Size = "S" | "M" | "L" | "XL" | "XXL" | "STD";
type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface OrderItemInput {
    productId: string;
    quantity: number;
    size: Size;
}

export const orderService = {
    async createOrder(userId: string, items: OrderItemInput[], shippingAddressId?: string, billingAddressId?: string, couponCode?: string) {
        if (!items || items.length === 0) {
            throw new AppError("Order must contain at least one item", 400);
        }

        // Use a transaction to ensure data consistency
        const order = await prisma.$transaction(async (tx: any) => {
            let total = 0;
            const orderItemsData = [];

            // Validate each item and calculate total
            for (const item of items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                    include: { variants: true }
                });

                if (!product) {
                    throw new AppError(
                        `Product ${item.productId} not found`,
                        404
                    );
                }

                // Check if size is available in variants
                const variant = product.variants.find((v: any) => v.size === item.size);

                if (!variant) {
                    throw new AppError(
                        `Size ${item.size} not available for ${product.name}`,
                        400
                    );
                }

                // Check stock
                if (variant.stock < item.quantity) {
                    throw new AppError(
                        `Insufficient stock for ${product.name} (Size: ${item.size}). Available: ${variant.stock}`,
                        400
                    );
                }

                // Update stock in ProductVariant
                await tx.productVariant.update({
                    where: {
                        productId_size: {
                            productId: item.productId,
                            size: item.size
                        }
                    },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });

                // Calculate item total
                const itemTotal = product.price * item.quantity;
                total += itemTotal;

                orderItemsData.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    size: item.size,
                    price: product.price, // Store current price
                });
            }

            // --- Coupon Logic ---
            let discountAmount = 0;
            let couponId: string | undefined = undefined;

            if (couponCode) {
                // Pasamos la transacción actual (tx) para asegurar concurrencia
                const coupon = await couponService.validateCoupon(couponCode, userId, total, tx);

                if (coupon.type === "PERCENTAGE") {
                    // Redondeo CLP estándar
                    discountAmount = Math.round(total * (coupon.value / 100));
                } else if (coupon.type === "FIXED_AMOUNT") {
                    discountAmount = Math.min(coupon.value, total);
                }

                couponId = coupon.id;

                // Incremento atómico del uso del cupón dentro de la misma transacción
                await tx.coupon.update({
                    where: { id: coupon.id },
                    data: { usedCount: { increment: 1 } }
                });

                // Marcar como usado en la billetera (si existe)
                await tx.userCoupon.updateMany({
                    where: {
                        userId,
                        couponId: coupon.id,
                        isUsed: false
                    },
                    data: {
                        isUsed: true,
                        usedAt: new Date()
                    }
                });
            }
            // ---------------------

            // Aplicar lógica de impuestos: Sin impuestos por solicitud del usuario
            const netAmount = total - discountAmount;
            const taxRate = 0; // Sin impuestos
            const taxes = 0;
            // Envío y umbral de envío gratis provienen de la configuración dinámica de la tienda
            const shopConfig = await shopConfigService.getConfig();
            const qualifiesForFreeShipping =
                shopConfig.freeShippingThreshold > 0 && total >= shopConfig.freeShippingThreshold;
            const shippingCost = qualifiesForFreeShipping ? 0 : shopConfig.baseShippingCost;
            const finalTotal = netAmount + shippingCost;

            // Fetch user details for snapshot
            const user = await tx.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                throw new AppError("User not found", 404);
            }

            // Fetch user addresses for the order
            const userAddresses = await tx.address.findMany({
                where: { userId, isActive: true },
            });

            if (userAddresses.length === 0) {
                throw new AppError("User must have at least one address to create an order", 400);
            }

            // Determine addresses (use provided IDs or fallback to default)
            const shippingAddr = shippingAddressId
                ? userAddresses.find((a: any) => a.id === shippingAddressId)
                : (userAddresses.find((a: any) => a.isDefault) || userAddresses[0]);

            const billingAddr = billingAddressId
                ? userAddresses.find((a: any) => a.id === billingAddressId)
                : shippingAddr;

            if (!shippingAddr) throw new AppError("Shipping address not found", 400);
            if (!billingAddr) throw new AppError("Billing address not found", 400);

            // Create order with items and SNAPSHOTS
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    date: new Date(),
                    total: finalTotal,
                    subtotal: total,
                    discountAmount: discountAmount,
                    couponId: couponId,
                    shippingCost: shippingCost,
                    taxes: taxes,
                    taxRate: taxRate,
                    status: "PENDING",
                    isPaid: false,
                    shippingAddressId: shippingAddr.id,
                    billingAddressId: billingAddr.id,

                    // Snapshot: Customer
                    customerName: user.name,
                    customerEmail: user.email,
                    customerPhone: user.phone,

                    // Snapshot: Shipping
                    shippingName: shippingAddr.name,
                    shippingRut: shippingAddr.rut,
                    shippingStreet: shippingAddr.street,
                    shippingComuna: shippingAddr.comuna,
                    shippingRegion: shippingAddr.region,
                    shippingZipCode: shippingAddr.zipCode,
                    shippingPhone: shippingAddr.phone,

                    // Snapshot: Billing
                    billingName: billingAddr.name,
                    billingRut: billingAddr.rut,
                    billingStreet: billingAddr.street,
                    billingComuna: billingAddr.comuna,
                    billingRegion: billingAddr.region,
                    billingZipCode: billingAddr.zipCode,

                    billingPhone: billingAddr.phone,
                    billingCompany: billingAddr.company,

                    items: {
                        create: orderItemsData,
                    },
                },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    images: true,
                                    category: true,
                                    variants: true,
                                },
                            },
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            phone: true,
                        },
                    },
                    coupon: true,
                },
            });

            // 5. Verificar si califica para Cupón VIP (Basado en el total de esta compra)
            let earnedCoupon = null;

            if (total >= shopConfig.vipThreshold) {
                const result = await couponService.assignCouponToUser(userId, shopConfig.vipCouponCode, tx);
                // Solo informamos si es un cupón NUEVO (primera vez que entra al umbral)
                if (result?.isNew) {
                    earnedCoupon = {
                        code: shopConfig.vipCouponCode,
                        message: shopConfig.vipRewardMessage
                    };
                }
            }

            return {
                ...newOrder,
                earnedCoupon
            };
        });

        return order;
    },

    async getUserOrders(userId: string) {
        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: true,
                                category: true,
                                variants: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phone: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return orders;
    },

    async getOrderById(orderId: string, userId?: string) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: true,
                                category: true,
                                variants: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phone: true,
                    },
                },
            },
        });

        if (!order) {
            throw new AppError("Order not found", 404);
        }

        if (userId && order.userId !== userId) {
            throw new AppError("Access denied", 403);
        }

        return order;
    },

    async getAllOrders(filters?: {
        status?: OrderStatus;
        startDate?: Date;
        endDate?: Date;
        search?: string;
    }) {
        const where: any = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {};
            if (filters.startDate) {
                where.createdAt.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.createdAt.lte = filters.endDate;
            }
        }

        if (filters?.search) {
            where.OR = [
                {
                    id: {
                        startsWith: filters.search,
                        mode: "insensitive",
                    },
                },
                {
                    user: {
                        OR: [
                            {
                                name: {
                                    startsWith: filters.search,
                                    mode: "insensitive",
                                },
                            },
                            {
                                name: {
                                    contains: " " + filters.search,
                                    mode: "insensitive",
                                },
                            },
                            {
                                email: {
                                    startsWith: filters.search,
                                    mode: "insensitive",
                                },
                            },
                        ],
                    },
                },
            ];
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: true,
                                category: true,
                                variants: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phone: true,
                    },
                },
                shippingAddress: true,
                billingAddress: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return orders;
    },

    async updateOrderStatus(orderId: string, status: OrderStatus, actorId: string) {
        const current = await prisma.order.findUnique({
            where: { id: orderId },
            select: { status: true },
        });
        if (!current) throw new AppError("Order not found", 404);

        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: true,
                                category: true,
                                variants: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phone: true,
                    },
                },
                shippingAddress: true,
                billingAddress: true,
            },
        });

        await createLog({
            actorId,
            action: "ORDER_STATUS_CHANGE",
            entityType: "ORDER",
            entityId: orderId,
            oldValue: current.status,
            newValue: status,
        });

        return order;
    },

    async markOrderAsPaid(orderId: string) {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: {
                isPaid: true,
                paidAt: new Date(),
                status: "CONFIRMED",
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: true,
                                category: true,
                                variants: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phone: true,
                    },
                },
                shippingAddress: true,
                billingAddress: true,
            },
        });

        return order;
    },

    async cancelOrder(orderId: string, userId?: string) {
        const order = await this.getOrderById(orderId, userId);

        if (order.status === "CANCELLED") {
            throw new AppError("Order is already cancelled", 400);
        }

        if (order.status === "DELIVERED") {
            throw new AppError("Cannot cancel delivered order", 400);
        }

        const updatedOrder = await prisma.$transaction(async (tx: any) => {
            for (const item of order.items) {
                await tx.productVariant.update({
                    where: {
                        productId_size: {
                            productId: item.productId,
                            size: item.size
                        }
                    },
                    data: {
                        stock: {
                            increment: item.quantity,
                        },
                    },
                });
            }

            const cancelled = await tx.order.update({
                where: { id: orderId },
                data: { status: "CANCELLED" },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    images: true,
                                    category: true,
                                    variants: true,
                                },
                            },
                        },
                    },
                },
            });

            return cancelled;
        });

        return updatedOrder;
    },
};
