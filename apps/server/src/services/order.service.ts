import prisma from "../config/prisma.js";
import { AppError } from "../middleware/error-handler.js";

// Type definitions until Prisma generates types
type Size = "S" | "M" | "L" | "XL" | "XXL";
type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

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
        const order = await prisma.$transaction(async (tx: typeof prisma) => {
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

            // Create order with items
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    total,
                    status: "PENDING",
                    isPaid: false,
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

    async getAllOrders() {
        const orders = await prisma.order.findMany({
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
                        product: true,
                    },
                },
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
                status: "PAID",
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
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
        const updatedOrder = await prisma.$transaction(async (tx: typeof prisma) => {
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
