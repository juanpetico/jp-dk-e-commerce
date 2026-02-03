import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { AppError } from "../middleware/error-handler.js";

// Helper for consistent User selections and transformations
const userInclude = {
    addresses: true,
    orders: {
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
            shippingAddress: true,
            billingAddress: true,
        },
    },
};

const mapUserToResponse = (user: any) => {
    const { password, ...userWithoutPassword } = user;

    // Transform orders to match frontend expectation (flattening product into item)
    if (userWithoutPassword.orders) {
        userWithoutPassword.orders = userWithoutPassword.orders.map((order: any) => ({
            ...order,
            items: order.items.map((item: any) => ({
                ...item,
                ...item.product, // Flatten product details (name, images, etc.)
                id: item.id, // Preserve OrderItem ID or Product ID? Usually OrderItem ID for lists, but CartItem might need Product ID.
                // item.product.id is available if needed.
                // Let's assume frontend treats this item as "CartItem" which extends "Product".
                // Product has 'id' (the product id). CartItem usually has 'id' (the product id) or 'productId'.
                // If we overwrite 'id' with OrderItem.id, we lose product.id.
                // item.productId is on OrderItem.
                // Let's keep item.id as OrderItem ID, and ensure product id is available?
                // Frontend CartItem extends Product, so it has .id (product ID).
                // If we allow "...item.product" to overwrite "...item", product.id overwrites item.id.
                // This is probably what we want for "Product-like" behavior.
                // But for "Order Entry" reference, we might need item.id.
                // Let's check overlap.
                // OrderItem: id, quantity, price, size.
                // Product: id, name, price, etc.
                // Conflict: id, price (OrderItem.price is historical, Product.price is current).
                // We definitely want HISTORICAL price for the order.
                price: item.price, // Keep historical price
                productId: item.productId, // Explicitly keep reference
                // If we want product.images, we get them from ...item.product
            })),
        }));
    }

    return userWithoutPassword;
};

export const userService = {
    async createUser(data: {
        email: string;
        password: string;
        name?: string;
        role?: "CLIENT" | "ADMIN";
    }) {
        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name ?? null,
                role: data.role || "CLIENT",
            },
            include: userInclude,
        });

        return mapUserToResponse(user);
    },

    async getUserById(id: string) {
        const user = await prisma.user.findUnique({
            where: { id },
            include: userInclude,
        });

        if (!user) {
            throw new AppError("User not found", 404);
        }

        return mapUserToResponse(user);
    },

    async getUserByEmail(email: string) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: userInclude,
        });

        if (!user) return null;
        return mapUserToResponse(user);
    },

    async updateUser(
        id: string,
        data: {
            name?: string;
            email?: string;
            password?: string;
            phone?: string;
        }
    ) {
        // Hash password if provided
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        const user = await prisma.user.update({
            where: { id },
            data,
            include: userInclude,
        });

        return mapUserToResponse(user);
    },

    async deleteUser(id: string) {
        await prisma.user.delete({
            where: { id },
        });
    },

    async getAllUsers() {
        const users = await prisma.user.findMany({
            include: userInclude,
            orderBy: {
                createdAt: "desc",
            },
        });

        return users.map(mapUserToResponse);
    },

    // Address Management
    async addAddress(userId: string, data: any) {
        // If this new address is set to default, unset others first
        if (data.isDefault) {
            await prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        } else {
            // Optional: If it's the first address, force it to be default
            const count = await prisma.address.count({ where: { userId } });
            if (count === 0) {
                data.isDefault = true;
            }
        }

        const address = await prisma.address.create({
            data: {
                ...data,
                userId,
            },
        });
        return address;
    },

    async updateAddress(userId: string, addressId: string, data: any) {
        // Verify ownership
        const existingAddress = await prisma.address.findUnique({
            where: { id: addressId },
        });

        if (!existingAddress) {
            throw new AppError("Address not found", 404);
        }

        if (existingAddress.userId !== userId) {
            throw new AppError("Unauthorized access to this address", 403);
        }

        // If setting to default, unset others
        if (data.isDefault) {
            await prisma.address.updateMany({
                where: {
                    userId,
                    id: { not: addressId } // Don't touch current one yet (optimization, though update below handles it)
                },
                data: { isDefault: false },
            });
        }

        const address = await prisma.address.update({
            where: { id: addressId },
            data,
        });

        return address;
    },

    async deleteAddress(userId: string, addressId: string) {
        // Verify ownership
        const existingAddress = await prisma.address.findUnique({
            where: { id: addressId },
        });

        if (!existingAddress) {
            throw new AppError("Address not found", 404);
        }

        if (existingAddress.userId !== userId) {
            throw new AppError("Unauthorized access to this address", 403);
        }

        await prisma.address.delete({
            where: { id: addressId },
        });

        // If we deleted the default address, should we make another one default?
        // Requirements didn't specify, but it's a good idea. 
        // For now, let's leave it to avoid "magic" behavior not requested.
    },
};
