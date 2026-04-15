import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { AppError } from "../middleware/error-handler.js";

// Helper for consistent User selections and transformations
const userInclude = {
    addresses: {
        where: { isActive: true },
    },
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

    // Calculate stats if orders are included
    if (userWithoutPassword.orders) {
        // Filter orders that are considered "valid" for spending (CONFIRMED is usually PAID in this app)
        const validOrders = userWithoutPassword.orders.filter(
            (o: any) => o.status === "CONFIRMED" || o.status === "DELIVERED" || o.status === "SHIPPED" || o.isPaid
        );

        userWithoutPassword.totalSpent = validOrders.reduce((sum: number, o: any) => sum + o.total, 0);
        userWithoutPassword.ordersCount = validOrders.length;

        // Get last order date
        if (validOrders.length > 0) {
            const sortedByDate = [...validOrders].sort(
                (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            userWithoutPassword.lastOrder = sortedByDate[0].date;
        } else {
            userWithoutPassword.lastOrder = "-";
        }

        // Default status to Active for now as there's no isDeactivated field in schema
        userWithoutPassword.status = "Active";

        // Transform orders to match frontend expectation (flattening product into item)
        userWithoutPassword.orders = userWithoutPassword.orders.map((order: any) => ({
            ...order,
            items: order.items.map((item: any) => ({
                ...item,
                ...item.product, // Flatten product details (name, images, etc.)
                id: item.id,
                price: item.price, // Keep historical price
                productId: item.productId, // Explicitly keep reference
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

    async getUserByEmailWithPassword(email: string) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: userInclude,
        });

        if (!user) return null;
        return user;
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
        // Check if this is the first address, if so force default
        const count = await prisma.address.count({ where: { userId, isActive: true } });

        let isDefault = data.isDefault ?? false;
        if (count === 0) {
            isDefault = true;
        }

        // If this new address is set to default, unset others first
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId, isActive: true },
                data: { isDefault: false },
            });
        }

        // Whitelist allowed fields to prevent mass assignment
        const address = await prisma.address.create({
            data: {
                userId,
                name: data.name,
                rut: data.rut,
                street: data.street,
                comuna: data.comuna,
                city: data.city,
                region: data.region,
                zipCode: data.zipCode,
                country: data.country,
                phone: data.phone,
                company: data.company,
                isDefault,
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
                    id: { not: addressId },
                    isActive: true
                },
                data: { isDefault: false },
            });
        }

        // Whitelist allowed fields to prevent mass assignment
        const safeData: Record<string, unknown> = {};
        if (data.name !== undefined) safeData.name = data.name;
        if (data.rut !== undefined) safeData.rut = data.rut;
        if (data.street !== undefined) safeData.street = data.street;
        if (data.comuna !== undefined) safeData.comuna = data.comuna;
        if (data.city !== undefined) safeData.city = data.city;
        if (data.region !== undefined) safeData.region = data.region;
        if (data.zipCode !== undefined) safeData.zipCode = data.zipCode;
        if (data.country !== undefined) safeData.country = data.country;
        if (data.phone !== undefined) safeData.phone = data.phone;
        if (data.company !== undefined) safeData.company = data.company;
        if (data.isDefault !== undefined) safeData.isDefault = data.isDefault;

        const address = await prisma.address.update({
            where: { id: addressId },
            data: safeData,
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

        // If it's the current default, we need to pick another one if available
        if (existingAddress.isDefault) {
            const anotherAddress = await prisma.address.findFirst({
                where: {
                    userId,
                    isActive: true,
                    id: { not: addressId },
                },
            });

            if (anotherAddress) {
                await prisma.address.update({
                    where: { id: anotherAddress.id },
                    data: { isDefault: true },
                });
            }
        }

        await prisma.address.update({
            where: { id: addressId },
            data: {
                isActive: false,
                isDefault: false
            },
        });

        // If we deleted the default address, should we make another one default?
        // Requirements didn't specify, but it's a good idea. 
        // For now, let's leave it to avoid "magic" behavior not requested.
    },
};
