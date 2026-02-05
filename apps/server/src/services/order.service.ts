import prisma from "../config/prisma.js";
import { AppError } from "../middleware/error-handler.js";

// Type definitions until Prisma generates types
type Size = "S" | "M" | "L" | "XL" | "XXL";
type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface OrderItemInput {
    productId: string;
    quantity: number;
    size: Size;
}

export const orderService = {
    async createOrder(userId: string, items: OrderItemInput[]) {
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
                });

                if (!product) {
                    throw new AppError(
                        `Product ${item.productId} not found`,
                        404
                    );
                }

                // Check if size is available
                if (!product.sizes.includes(item.size)) {
                    throw new AppError(
                        `Size ${item.size} not available for ${product.name}`,
                        400
                    );
                }

                // Check stock
                if (product.stock < item.quantity) {
                    throw new AppError(
                        `Insufficient stock for ${product.name}. Available: ${product.stock}`,
                        400
                    );
                }

                // Update stock
                await tx.product.update({
                    where: { id: item.productId },
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

            // Fetch user addresses for the order
            const userAddresses = await tx.address.findMany({
                where: { userId, isActive: true },
            });

            if (userAddresses.length === 0) {
                throw new AppError("User must have at least one address to create an order", 400);
            }

            const defaultAddress = userAddresses.find((a: any) => a.isDefault) || userAddresses[0];

            // Create order with items
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
                    shippingAddressId: defaultAddress.id,
                    billingAddressId: defaultAddress.id,
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
                            },
                        },
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
                await tx.product.update({
                    where: { id: item.productId },
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
                            product: true,
                        },
                    },
                },
            });

            return cancelled;
        });

        return updatedOrder;
    },
};
