import prisma from "../config/prisma.js";
import { AppError } from "../middleware/error-handler.js";

// Type definitions until Prisma generates types
type Size = "S" | "M" | "L" | "XL" | "XXL" | "STD";
type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface OrderItemInput {
    productId: string;
    quantity: number;
    size: Size;
}

export const orderService = {
    async createOrder(userId: string, items: OrderItemInput[], shippingAddressId?: string, billingAddressId?: string) {
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
                    date: new Date().toISOString(),
                    total,
                    subtotal: total,
                    shippingCost: 0,
                    taxes: 0,
                    taxRate: 0,
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
                        },
                    },
                },
            });

            return newOrder;
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
                    },
                },
            },
        });

        if (!order) {
            throw new AppError("Order not found", 404);
        }

        // If userId is provided, verify ownership
        if (userId && order.userId !== userId && userId !== 'ADMIN') { // Added generic check, logic might vary
            // Note: Controller logic uses explicit check. Here logic was `if (userId && order.userId !== userId)`.
            // If caller is admin, they might pass undefined or a specific logic.
            // Original code: if (userId && order.userId !== userId) { throw ... }
            // We should keep original logic.
        }

        if (userId && order.userId !== userId) {
            // Exception: if the passed userId is intended to be checked against order owner.
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
        // Construir el objeto where dinámicamente
        const where: any = {};

        // Filtro por estado
        if (filters?.status) {
            where.status = filters.status;
        }

        // Filtro por rango de fechas
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {};
            if (filters.startDate) {
                where.createdAt.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.createdAt.lte = filters.endDate;
            }
        }

        // Búsqueda por ID de orden o nombre de cliente
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
                    },
                },
                // Include relations just in case, though we rely on snapshots now
                shippingAddress: true,
                billingAddress: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return orders;
    },

    async updateOrderStatus(orderId: string, status: OrderStatus) {
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
                    },
                },
                shippingAddress: true,
                billingAddress: true,
            },
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
                    },
                },
                shippingAddress: true,
                billingAddress: true,
            },
        });

        return order;
    },

    async cancelOrder(orderId: string, userId?: string) {
        // Get order first to verify and restore stock
        const order = await this.getOrderById(orderId, userId);

        if (order.status === "CANCELLED") {
            throw new AppError("Order is already cancelled", 400);
        }

        if (order.status === "DELIVERED") {
            throw new AppError("Cannot cancel delivered order", 400);
        }

        // Use transaction to restore stock and update order
        const updatedOrder = await prisma.$transaction(async (tx: any) => {
            // Restore stock for each item
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

            // Update order status
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
