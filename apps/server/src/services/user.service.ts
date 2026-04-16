import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { AppError } from "../middleware/error-handler.js";
import { withAudit } from "./audit.service.js";
import { invalidateAuthCache } from "../middleware/auth.middleware.js";

const VALID_ROLES = ["CLIENT", "ADMIN", "SUPERADMIN"] as const;
type UserRole = (typeof VALID_ROLES)[number];

interface ActorInfo { id: string; role: string }
interface TargetInfo { id: string; role: string; isActive: boolean }

/**
 * Hierarchy guard. Throws AppError on violation.
 * - Only SUPERADMIN can mutate any user.
 * - Nobody can mutate themselves.
 * - role must be a valid enum value if provided.
 */
export function assertCanMutate(
    actor: ActorInfo,
    target: TargetInfo,
    change: { role?: string; isActive?: boolean }
): void {
    if (actor.id === target.id) {
        throw new AppError("Cannot modify your own account", 403);
    }
    if (actor.role !== "SUPERADMIN") {
        throw new AppError("Forbidden", 403);
    }
    if (change.role !== undefined && !VALID_ROLES.includes(change.role as UserRole)) {
        throw new AppError("Invalid role", 400);
    }
}

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

        // Reflect real isActive from DB
        userWithoutPassword.status = userWithoutPassword.isActive ? "Active" : "Inactive";

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

    async getAllUsers(params?: { role?: string }) {
        const users = await prisma.user.findMany({
            where: {
                ...(params?.role && params.role !== "ALL" ? { role: params.role as UserRole } : {}),
            },
            include: userInclude,
            orderBy: {
                createdAt: "desc",
            },
        });

        return users.map(mapUserToResponse);
    },

    async getUsers(params: {
        search?: string;
        role?: string;
        status?: string;
        cursor?: string;
        limit?: number;
    }) {
        const limit = params.limit ?? 20;
        const take = limit + 1;

        const where: any = {};

        if (params.search) {
            where.OR = [
                { email: { contains: params.search, mode: "insensitive" } },
                { name: { contains: params.search, mode: "insensitive" } },
            ];
        }

        if (params.role && params.role !== "ALL") {
            where.role = params.role;
        }

        if (params.status && params.status !== "ALL") {
            where.isActive = params.status === "ACTIVE";
        }

        const users = await prisma.user.findMany({
            where,
            take,
            ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                deactivationReason: true,
                lastLogin: true,
                createdAt: true,
            },
        });

        const hasNextPage = users.length > limit;
        const items = hasNextPage ? users.slice(0, limit) : users;
        const lastItem = items[items.length - 1];
        const nextCursor = hasNextPage && lastItem ? lastItem.id : null;

        return { users: items, nextCursor };
    },

    async updateUserRole(actorId: string, targetId: string, newRole: string) {
        const actor = await prisma.user.findUnique({
            where: { id: actorId },
            select: { id: true, role: true },
        });
        if (!actor) throw new AppError("Actor not found", 404);

        const target = await prisma.user.findUnique({
            where: { id: targetId },
            select: { id: true, role: true, isActive: true },
        });
        if (!target) throw new AppError("User not found", 404);

        assertCanMutate(actor, target, { role: newRole });

        const updatedUser = await withAudit(
            actorId,
            targetId,
            "ROLE_CHANGE",
            target.role,
            newRole,
            (tx) =>
                tx.user.update({
                    where: { id: targetId },
                    data: { role: newRole as UserRole },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        isActive: true,
                        deactivationReason: true,
                        lastLogin: true,
                        createdAt: true,
                    },
                })
        );

        invalidateAuthCache(targetId);
        return updatedUser;
    },

    async toggleUserStatus(actorId: string, targetId: string, newIsActive: boolean, deactivationReason?: string) {
        const actor = await prisma.user.findUnique({
            where: { id: actorId },
            select: { id: true, role: true },
        });
        if (!actor) throw new AppError("Actor not found", 404);

        const target = await prisma.user.findUnique({
            where: { id: targetId },
            select: { id: true, role: true, isActive: true },
        });
        if (!target) throw new AppError("User not found", 404);

        assertCanMutate(actor, target, { isActive: newIsActive });

        const updatedUser = await withAudit(
            actorId,
            targetId,
            "STATUS_CHANGE",
            String(target.isActive),
            String(newIsActive),
            (tx) =>
                tx.user.update({
                    where: { id: targetId },
                    data: {
                        isActive: newIsActive,
                        deactivationReason: newIsActive ? null : deactivationReason ?? null,
                    },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        isActive: true,
                        deactivationReason: true,
                        lastLogin: true,
                        createdAt: true,
                    },
                })
        );

        invalidateAuthCache(targetId);
        return updatedUser;
    },

    // Address Management
    async addAddress(userId: string, data: any) {
        // Check if this is the first address, if so force default
        const count = await prisma.address.count({ where: { userId, isActive: true } });

        if (count === 0) {
            data.isDefault = true;
        }

        // If this new address is set to default, unset others first
        if (data.isDefault) {
            await prisma.address.updateMany({
                where: { userId, isActive: true },
                data: { isDefault: false },
            });
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
                    id: { not: addressId },
                    isActive: true
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
