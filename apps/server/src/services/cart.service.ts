import prisma from "../config/prisma.js";
import { AppError } from "../middleware/error-handler.js";

type Size = "S" | "M" | "L" | "XL" | "XXL" | "STD";

export const cartService = {
    async getCart(userId: string) {
        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: true,
                                variants: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    images: true,
                                    variants: true,
                                },
                            },
                        },
                        orderBy: {
                            createdAt: "asc",
                        },
                    },
                },
            });
        }

        return cart;
    },

    async addItem(userId: string, productId: string, size: Size, quantity: number = 1) {
        const cart = await this.getCart(userId);

        return await prisma.cartItem.upsert({
            where: {
                cartId_productId_size: {
                    cartId: cart.id,
                    productId,
                    size,
                },
            },
            update: {
                quantity: {
                    increment: quantity,
                },
            },
            create: {
                cartId: cart.id,
                productId,
                size,
                quantity,
            },
            include: {
                product: {
                    include: { images: true, variants: true }
                }
            }
        });
    },

    async updateQuantity(userId: string, itemId: string, quantity: number) {
        // Verify item belongs to user's cart
        const cart = await this.getCart(userId);

        const item = await prisma.cartItem.findUnique({
            where: { id: itemId }
        });

        if (!item || item.cartId !== cart.id) {
            throw new AppError("Item not found in cart", 404);
        }

        if (quantity <= 0) {
            return await prisma.cartItem.delete({
                where: { id: itemId },
            });
        }

        return await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
            include: {
                product: {
                    include: { images: true, variants: true }
                }
            }
        });
    },

    async removeItem(userId: string, itemId: string) {
        const cart = await this.getCart(userId);

        const item = await prisma.cartItem.findUnique({
            where: { id: itemId }
        });

        if (!item || item.cartId !== cart.id) {
            throw new AppError("Item not found in cart", 404);
        }

        return await prisma.cartItem.delete({
            where: { id: itemId },
        });
    },

    async clearCart(userId: string) {
        const cart = await prisma.cart.findUnique({
            where: { userId },
        });

        if (cart) {
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
        }
    },
};
